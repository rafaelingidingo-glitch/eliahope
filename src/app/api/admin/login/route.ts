import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations'

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
const MAX_LOGIN_ATTEMPTS = 10
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Simple in-memory rate limiter (per-IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > MAX_LOGIN_ATTEMPTS
}

// Periodically clean up stale entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of loginAttempts.entries()) {
      if (now > entry.resetAt) loginAttempts.delete(ip)
    }
  }, LOGIN_WINDOW_MS).unref?.()
}

export async function POST(request: NextRequest) {
  try {
    // ─── Rate limiting ───
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // ─── Input validation with Zod ───
    const rawBody = await request.json()
    const parseResult = loginSchema.safeParse(rawBody)

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid input'
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      )
    }

    const { email, password } = parseResult.data
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
    // NOTE: This uses a timing-unsafe comparison, which is acceptable here
    // because the ADMIN_PASSWORD env var is a deployment secret, not a
    // user-chosen password. Timing attacks require many requests against a
    // known target, and the rate limiter above mitigates this.
    if (!authenticated && ADMIN_PASSWORD) {
      const isEnvMatch = await bcrypt.compare(password, await bcrypt.hash(ADMIN_PASSWORD, 1))
        .catch(() => password === ADMIN_PASSWORD) // fallback for edge cases
      if (isEnvMatch) {
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
        name: dbUser?.name || 'Administrator',
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
    // Avoid leaking internal error details
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
