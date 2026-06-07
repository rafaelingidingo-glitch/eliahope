import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual, createHmac } from 'crypto'

/**
 * Admin API Authentication Middleware
 * 
 * Validates a Bearer token from the Authorization header against
 * the ADMIN_API_TOKEN environment variable using timing-safe comparison.
 * 
 * If ADMIN_API_TOKEN is not set in production, all requests are rejected.
 * In development, a warning is logged and requests are allowed.
 */

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || ''
const isProduction = process.env.NODE_ENV === 'production'

export function requireAdmin(request: NextRequest): NextResponse | null {
  // If no token configured
  if (!ADMIN_TOKEN) {
    if (isProduction) {
      // In production: reject all requests if no token is configured
      console.error('ADMIN_API_TOKEN not set in production — admin API routes are BLOCKED')
      return NextResponse.json(
        { error: 'Server configuration error. Admin routes are disabled.' },
        { status: 503 }
      )
    }
    // In development: allow with warning
    console.warn('ADMIN_API_TOKEN not set — admin API routes are unprotected (development mode)')
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

  // Timing-safe comparison to prevent timing attacks
  const tokenBuf = Buffer.from(token)
  const adminBuf = Buffer.from(ADMIN_TOKEN)
  
  if (tokenBuf.length !== adminBuf.length) {
    return NextResponse.json(
      { error: 'Forbidden. Invalid admin token.' },
      { status: 403 }
    )
  }

  if (!timingSafeEqual(tokenBuf, adminBuf)) {
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
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY] AZAMPAY_WEBHOOK_SECRET not set in production — webhook signatures CANNOT be verified. Rejecting request.')
      return false
    }
    console.warn('AZAMPAY_WEBHOOK_SECRET not set — webhook signature verification is disabled (development mode)')
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

  // Timing-safe comparison
  const computedBuf = Buffer.from(computed)
  const signatureBuf = Buffer.from(signature)
  
  if (computedBuf.length !== signatureBuf.length) {
    return false
  }

  return timingSafeEqual(computedBuf, signatureBuf)
}
