import { NextRequest, NextResponse } from 'next/server'

/**
 * Admin Login API
 * 
 * Validates admin credentials from environment variables and
 * returns a JWT-like bearer token (ADMIN_API_TOKEN) on success.
 * 
 * The frontend stores this token and sends it as a Bearer header
 * with all subsequent admin API requests.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@eliashope.org'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      email: string
      password: string
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate credentials against environment variables
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      // Add a small delay to prevent brute-force timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500))
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check that ADMIN_API_TOKEN is configured
    if (!ADMIN_API_TOKEN) {
      console.error('ADMIN_API_TOKEN is not set in environment variables. Admin API routes will be unprotected.')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // Return the admin token — the frontend will store and use it
    return NextResponse.json({
      success: true,
      token: ADMIN_API_TOKEN,
      user: {
        email: ADMIN_EMAIL,
        name: 'Administrator',
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
