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

// ─── Database Engine Detection ───────────────────────────────────────────
// Detect which database engine to use based on the DATABASE_URL scheme.

type DatabaseEngine = 'sqlite' | 'postgresql' | 'mysql'

function detectEngine(url: string): DatabaseEngine {
  if (url.startsWith('file:')) return 'sqlite'
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql'
  if (url.startsWith('mysql://')) return 'mysql'
  return 'sqlite' // Default fallback
}

const DATABASE_URL = process.env.DATABASE_URL || 'file:./db/custom.db'
const engine = detectEngine(DATABASE_URL)

// ─── Adapter Creation ────────────────────────────────────────────────────
// Creates the Prisma driver adapter for the detected database engine.
//
// SQLite is always available (installed by default).
// For PostgreSQL/MySQL, uncomment the corresponding block after installing
// the required adapter packages.

function createPrismaClient(): PrismaClient {
  const log: Array<{ emit: 'stdout'; level: 'query' | 'error' }> =
    process.env.NODE_ENV === 'development'
      ? [{ emit: 'stdout', level: 'query' }, { emit: 'stdout', level: 'error' }]
      : [{ emit: 'stdout', level: 'error' }]

  if (engine === 'sqlite') {
    const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL })
    return new PrismaClient({ adapter, log })
  }

  // ─── PostgreSQL Adapter ────────────────────────────────────────────
  // Uncomment after installing: bun add @prisma/adapter-pg pg
  //
  // if (engine === 'postgresql') {
  //   const { PrismaPg } = require('@prisma/adapter-pg')
  //   const { Pool } = require('pg')
  //   const pool = new Pool({ connectionString: DATABASE_URL })
  //   const adapter = new PrismaPg(pool)
  //   return new PrismaClient({ adapter, log })
  // }

  // ─── MySQL Adapter ─────────────────────────────────────────────────
  // Uncomment after installing: bun add @prisma/adapter-mariadb mariadb
  //
  // if (engine === 'mysql') {
  //   const { PrismaMariaDB } = require('@prisma/adapter-mariadb')
  //   const mariadb = require('mariadb')
  //   const pool = mariadb.createPool({ connectionString: DATABASE_URL })
  //   const adapter = new PrismaMariaDB(pool)
  //   return new PrismaClient({ adapter, log })
  // }

  // Fallback: If non-SQLite engine detected but adapter not configured,
  // fall back to SQLite adapter (will fail if URL is actually PG/MySQL)
  console.warn(
    `[DB] Engine "${engine}" detected but adapter not configured. ` +
    'Falling back to SQLite adapter. For PostgreSQL/MySQL, see comments in db.ts.'
  )
  const adapter = new PrismaBetterSqlite3({ url: DATABASE_URL })
  return new PrismaClient({ adapter, log })
}

// ─── Type-safe global augmentation ───────────────────────────────────────
const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined
}

// ─── Singleton instantiation ─────────────────────────────────────────────
export const db = globalForPrisma.db ?? createPrismaClient()

// Persist on globalThis to survive HMR cycles (development only)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.db = db
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
