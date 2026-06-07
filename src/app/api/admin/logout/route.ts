import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin Logout API
 *
 * Clears the admin_token httpOnly cookie to fully end the session.
 * The frontend also removes the token from localStorage independently.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Clear the httpOnly cookie by setting maxAge to 0
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Immediately expire
  })

  return response
}
