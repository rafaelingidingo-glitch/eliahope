import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Convert a Prisma Decimal value to a plain JavaScript number.
 * Works with Prisma Decimal, plain numbers, null, and undefined.
 * This ensures cross-database compatibility — Prisma Decimal fields
 * (from PostgreSQL/MySQL decimal columns or SQLite text columns)
 * are always converted to numbers before being sent as JSON.
 */
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  // Prisma.Decimal has .toNumber() method; fallback to Number() for strings
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