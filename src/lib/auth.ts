import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

/**
 * Admin API Authentication Middleware
 * 
 * Validates a Bearer token from the Authorization header against
 * the ADMIN_API_TOKEN environment variable.
 * 
 * If ADMIN_API_TOKEN is not set, allows all requests (development mode).
 * In production, always set a strong ADMIN_API_TOKEN.
 */

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || ''

export function requireAdmin(request: NextRequest): NextResponse | null {
  // If no token configured, allow all requests (development mode)
  if (!ADMIN_TOKEN) {
    console.warn('ADMIN_API_TOKEN not set — admin API routes are unprotected')
    return null
  }

  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized. Missing or invalid Authorization header.' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'Forbidden. Invalid admin token.' },
      { status: 403 }
    )
  }

  return null // Auth passed
}

/**
 * Verify AzamPay webhook signature using HMAC-SHA256
 * 
 * AzamPay sends a signature header (X-Azampay-Signature) that is
 * computed as HMAC-SHA256(rawRequestBody, webhookSecret).
 * 
 * If AZAMPAY_WEBHOOK_SECRET is not set, verification is skipped (development mode).
 */
export function verifyWebhookSignature(
  request: NextRequest,
  rawBody: string
): boolean {
  const secret = process.env.AZAMPAY_WEBHOOK_SECRET

  // If no secret configured, skip verification (development mode)
  if (!secret) {
    console.warn('AZAMPAY_WEBHOOK_SECRET not set — webhook signature verification is disabled')
    return true
  }

  const signature = request.headers.get('X-Azampay-Signature')
  if (!signature) {
    console.error('AzamPay webhook: Missing X-Azampay-Signature header')
    return false
  }

  // Compute HMAC-SHA256 of the raw body with the webhook secret
  const computed = createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  if (computed.length !== signature.length) {
    return false
  }

  // Simple constant-time comparison
  let result = 0
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ signature.charCodeAt(i)
  }

  return result === 0
}
