import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  sendAdminOtpEmail,
  resendAdminOtpEmail,
  createOtpRecord,
  verifyOtp,
} from '@/lib/resend'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@eliashope.org'

/**
 * POST /api/admin/forgot-password
 *
 * Request body:
 *   { action: 'send_otp', email: string }
 *   { action: 'resend_otp', email: string, emailLogId?: string }
 *   { action: 'verify_otp', email: string, otp: string }
 *   { action: 'reset_password', email: string, otp: string, newPassword: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: 'send_otp' | 'resend_otp' | 'verify_otp' | 'reset_password'
      email: string
      otp?: string
      newPassword?: string
      emailLogId?: string
    }

    const { action, email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify the email belongs to the admin
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      // Don't reveal whether the email exists — generic message
      return NextResponse.json({
        success: true,
        message: 'If this email is registered, an OTP has been sent.',
      })
    }

    switch (action) {
      // ─── Send OTP ─────────────────────────────────────────
      case 'send_otp': {
        const otp = await createOtpRecord(email.trim().toLowerCase(), 'forgot_password')
        const result = await sendAdminOtpEmail(email.trim(), otp)

        if (!result.success) {
          return NextResponse.json(
            { error: 'Failed to send OTP email. Please try again.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'OTP has been sent to your email address.',
          emailLogId: result.id,
        })
      }

      // ─── Resend OTP ──────────────────────────────────────
      case 'resend_otp': {
        const otp = await createOtpRecord(email.trim().toLowerCase(), 'forgot_password')
        const result = await resendAdminOtpEmail(
          email.trim(),
          otp,
          body.emailLogId || ''
        )

        if (!result.success) {
          return NextResponse.json(
            { error: 'Failed to resend OTP email. Please try again.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'A new OTP has been sent to your email address.',
          emailLogId: result.id,
        })
      }

      // ─── Verify OTP ──────────────────────────────────────
      case 'verify_otp': {
        if (!body.otp) {
          return NextResponse.json({ error: 'OTP code is required' }, { status: 400 })
        }

        const verification = await verifyOtp(
          email.trim().toLowerCase(),
          body.otp,
          'forgot_password'
        )

        if (!verification.valid) {
          return NextResponse.json(
            { error: verification.error || 'Invalid OTP code' },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'OTP verified successfully. You may now reset your password.',
        })
      }

      // ─── Reset Password ──────────────────────────────────
      case 'reset_password': {
        if (!body.otp || !body.newPassword) {
          return NextResponse.json(
            { error: 'OTP and new password are required' },
            { status: 400 }
          )
        }

        if (body.newPassword.length < 8) {
          return NextResponse.json(
            { error: 'Password must be at least 8 characters long' },
            { status: 400 }
          )
        }

        // Verify OTP first
        const verification = await verifyOtp(
          email.trim().toLowerCase(),
          body.otp,
          'forgot_password'
        )

        if (!verification.valid) {
          return NextResponse.json(
            { error: verification.error || 'Invalid OTP code' },
            { status: 400 }
          )
        }

        // In this setup, admin password is stored in env vars
        // We update it in the database's User model for future reference
        const existingUser = await db.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        })

        if (existingUser) {
          await db.user.update({
            where: { email: email.trim().toLowerCase() },
            data: { password: body.newPassword },
          })
        } else {
          // Create the admin user in DB
          await db.user.create({
            data: {
              email: email.trim().toLowerCase(),
              name: 'Administrator',
              password: body.newPassword,
              role: 'admin',
            },
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Password has been reset successfully. You can now log in with your new password.',
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
