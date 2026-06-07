/**
 * Unified, Database-Agnostic Prisma Client Singleton
 *
 * This module provides a single Prisma Client instance that works seamlessly
 * across all supported database engines:
 *   - SQLite      (local development)
 *   - PostgreSQL   (Neon, Supabase, etc. — Vercel / production)
 *   - MySQL        (PlanetScale, etc. — Vercel / production)
 *
 * The Prisma engine type is resolved **automatically** from the `DATABASE_URL`
 * environment variable. No `datasources` or `datasourceUrl` overrides are
 * hardcoded here — Prisma's own generator reads the provider from
 * `schema.prisma` and the connection string from the env var at runtime.
 *
 * ─── Global Singleton Pattern ────────────────────────────────────────────
 * During Next.js development with Hot Module Replacement (HMR), module scope
 * is re-evaluated on every file change. Without the `globalThis` guard, each
 * HMR cycle would create a **new** PrismaClient, exhausting database
 * connections ("Too many connections" error on PostgreSQL / MySQL).
 *
 * The pattern below stores the client on `globalThis` in non-production
 * environments so the same connection pool is reused across HMR cycles.
 * In production, a fresh client is created per cold start (as expected).
 */

import { PrismaClient, Prisma } from '@prisma/client'

// ─── Type-safe global augmentation ───────────────────────────────────────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ─── Singleton instantiation ─────────────────────────────────────────────
// PrismaClient is constructed with NO `datasources` or `datasourceUrl`
// override. This lets Prisma natively resolve the engine from the active
// `DATABASE_URL` environment variable and the `provider` in schema.prisma.
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

// Persist on globalThis to survive HMR cycles (development only)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// ─── Decimal / Number Helpers ────────────────────────────────────────────
// Prisma returns `Decimal` objects for `Decimal` schema fields. These
// helpers convert them to plain numbers for JSON serialization, regardless
// of whether the underlying DB stores them as TEXT (SQLite), NUMERIC
// (PostgreSQL), or DECIMAL (MySQL).

/**
 * Convert a Prisma Decimal value to a plain JavaScript number.
 * Works with Prisma Decimal, plain numbers, null, and undefined.
 */
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'toNumber' in value) return (value as Prisma.Decimal).toNumber()
  return Number(value)
}

/**
 * Safely format a monetary value with toLocaleString.
 * Handles Prisma Decimal, plain numbers, and strings.
 */
export function toLocaleString(value: Prisma.Decimal | number | string | null | undefined): string {
  return toNumber(value).toLocaleString()
}

/**
 * Type helper: Convert all Decimal fields in an object to numbers.
 * Useful for preparing database records for JSON serialization.
 */
export function decimalFieldsToNumber<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj } as Record<string, unknown>
  for (const field of fields) {
    const key = field as string
    if (result[key] !== null && result[key] !== undefined) {
      result[key] = toNumber(result[key] as Prisma.Decimal | number | string)
    }
  }
  return result as T
}
