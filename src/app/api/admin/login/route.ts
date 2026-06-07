import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

/**
 * Admin Login API
 *
 * Validates admin credentials against:
 *   1. The database User table (bcrypt-hashed passwords)
 *   2. Falls back to environment variables (for initial setup)
 *
 * Returns a bearer token (ADMIN_API_TOKEN) on success.
 * The frontend stores this token in an httpOnly cookie and sends it
 * as a Bearer header with all subsequent admin API requests.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@eliashope.org'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || ''
const SALT_ROUNDS = 12

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
      // Delay to prevent timing attacks on email enumeration
      await new Promise((resolve) => setTimeout(resolve, 500))
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ─── Step 1: Check DB for hashed password ───
    const dbUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    let authenticated = false

    if (dbUser && dbUser.password) {
      // User exists in DB — compare using bcrypt
      const isMatch = await bcrypt.compare(password, dbUser.password)
      if (isMatch) {
        authenticated = true
      }
    }

    // ─── Step 2: Fallback to env var credentials (initial setup) ───
    if (!authenticated && ADMIN_PASSWORD && password === ADMIN_PASSWORD) {
      authenticated = true

      // Hash and sync to DB so future logins use bcrypt
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      if (!dbUser) {
        await db.user.create({
          data: {
            email: normalizedEmail,
            name: 'Administrator',
            password: hashedPassword,
            role: 'admin',
          },
        })
      } else {
        await db.user.update({
          where: { email: normalizedEmail },
          data: { password: hashedPassword },
        })
      }
    }

    if (!authenticated) {
      // Delay to prevent brute-force timing attacks
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

    // Return the admin token — set it as httpOnly cookie too
    const response = NextResponse.json({
      success: true,
      token: ADMIN_API_TOKEN,
      user: {
        email: ADMIN_EMAIL,
        name: 'Administrator',
      },
    })

    // Set httpOnly cookie for server-side auth (middleware)
    response.cookies.set('admin_token', ADMIN_API_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
