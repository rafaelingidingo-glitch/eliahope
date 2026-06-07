/**
 * Unified, Database-Agnostic Prisma Client Singleton (Prisma 7)
 *
 * This module provides a single Prisma Client instance that works seamlessly
 * across all supported database engines:
 *   - SQLite      (local development) — fully supported out of the box
 *   - PostgreSQL   (Neon, Supabase, etc.) — install @prisma/adapter-pg + pg
 *   - MySQL        (PlanetScale, etc.) — install @prisma/adapter-mariadb + mariadb
 *
 * Prisma 7 requires driver adapters for runtime database connections.
 * This module auto-detects the database engine from DATABASE_URL and
 * creates the appropriate adapter.
 *
 * ─── Switching Database Engines ──────────────────────────────────────────
 * 1. Update the `provider` in prisma/schema.prisma (e.g., "sqlite" → "postgresql")
 * 2. Update DATABASE_URL in .env
 * 3. Install the appropriate adapter packages:
 *    PostgreSQL: bun add @prisma/adapter-pg pg
 *    MySQL:     bun add @prisma/adapter-mariadb mariadb
 * 4. Uncomment the corresponding adapter block below
 * 5. Run: npx prisma generate && npx prisma db push
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

import { PrismaClient, Prisma } from '@/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

type DatabaseEngine = 'sqlite' | 'postgresql' | 'mysql'

function detectEngine(url: string): DatabaseEngine {
  if (url.startsWith('file:')) return 'sqlite'
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql'
  if (url.startsWith('mysql://')) return 'mysql'
  return 'sqlite'
}

const DATABASE_URL = process.env.DATABASE_URL || 'file:./db/custom.db'
const engine = detectEngine(DATABASE_URL)

// Tunaweka vigezo vya mteja hapa nje ili tuvisasishe baada ya asynchronous import
let dbInstance: PrismaClient

if (engine === 'sqlite') {
  const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL })
  dbInstance = new PrismaClient({ adapter })
} else if (engine === 'postgresql') {
  // Hii inafanya kazi Hostinger/Route Africa (Bun/Node runtime) na Vercel pia!
  // Tunatumia dynamic import inayokubalika na standard zote za kisasa
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const pg = (await import('pg')).default

  const pool = new pg.Pool({ connectionString: DATABASE_URL })
  const adapter = new PrismaPg(pool)
  dbInstance = new PrismaClient({ adapter })
} else {
  // Fallback ya usalama
  const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL })
  dbInstance = new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined
}

export const db = globalForPrisma.db ?? dbInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
}

// ... weka zile helper functions zako za `toNumber`, `decimalFieldsToNumber` chini kama zilivyokuwa.

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
