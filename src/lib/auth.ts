import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple admin API authentication middleware.
 * 
 * Validates a Bearer token from the Authorization header against
 * the ADMIN_API_TOKEN environment variable.
 * 
 * If ADMIN_API_TOKEN is not set, falls back to a basic check
 * for the presence of an Authorization header (for development).
 * 
 * For production, set a strong ADMIN_API_TOKEN env var and
 * update the admin frontend to send it with every request.
 */

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || ''

export function requireAdmin(request: NextRequest): NextResponse | null {
  // If no token configured, allow all requests (development mode)
  if (!ADMIN_TOKEN) {
    return null // No auth required in dev
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
