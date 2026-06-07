/**
 * Shared Payment Utilities
 *
 * Centralizes transaction ID generation and other payment-related helpers
 * that are used across multiple API routes (M-Pesa, CRDB, etc.).
 */

import { randomBytes } from 'crypto'

/**
 * Generate a unique transaction ID with a given prefix.
 * Uses crypto.randomBytes instead of Math.random for cryptographic security.
 *
 * Format: {PREFIX}{TIMESTAMP_BASE36}{RANDOM_4_CHARS}
 * Example: EHCLKJF8GH2AB
 */
export function generateTransactionId(prefix: string = 'EHC'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(2).toString('hex').toUpperCase()
  return `${prefix}${timestamp}${random}`
}

/**
 * Generate a bank reference number for CRDB/NMB transactions.
 * Uses crypto.randomBytes for secure random generation.
 */
export function generateBankReference(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = randomBytes(2).toString('hex').toUpperCase().slice(0, 4)
  return `TXN${timestamp}${random}`
}
