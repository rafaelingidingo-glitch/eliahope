import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Admin Login API
 *
 * Validates admin credentials against:
 *   1. The database User table (supports passwords changed via Forgot Password)
 *   2. Falls back to environment variables (for initial setup before any reset)
 *
 * Returns a JWT-like bearer token (ADMIN_API_TOKEN) on success.
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

    const normalizedEmail = email.trim().toLowerCase()

    // Must be the admin email
    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ─── Step 1: Check DB for updated password (from forgot-password resets) ───
    const dbUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    let authenticated = false

    if (dbUser && dbUser.password) {
      // User exists in DB with a password — compare directly
      if (password === dbUser.password) {
        authenticated = true
      }
    }

    // ─── Step 2: Fallback to env var credentials (initial setup) ───
    if (!authenticated && password === ADMIN_PASSWORD) {
      authenticated = true

      // Sync to DB so future logins use the DB record
      if (!dbUser) {
        await db.user.create({
          data: {
            email: normalizedEmail,
            name: 'Administrator',
            password: ADMIN_PASSWORD,
            role: 'admin',
          },
        })
      } else if (!dbUser.password) {
        await db.user.update({
          where: { email: normalizedEmail },
          data: { password: ADMIN_PASSWORD },
        })
      }
    }

    if (!authenticated) {
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
