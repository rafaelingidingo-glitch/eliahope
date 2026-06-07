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
 * The OTP is ALWAYS sent to the admin's registered email (ADMIN_EMAIL env var),
 * regardless of what email the user enters. This ensures only someone with
 * access to the admin inbox can reset the password.
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

    const normalizedInput = email.trim().toLowerCase()
    const adminEmail = ADMIN_EMAIL.toLowerCase()

    // ─── For send_otp / resend_otp: always send to the registered admin email ───
    // We validate that the entered email matches the admin email.
    // If it doesn't match, we return a generic message (don't reveal the admin email).
    if (action === 'send_otp' || action === 'resend_otp') {
      if (normalizedInput !== adminEmail) {
        // Don't reveal whether the email exists — generic message
        return NextResponse.json({
          success: true,
          message: 'If this email is registered as admin, an OTP has been sent to it.',
        })
      }

      if (action === 'send_otp') {
        const otp = await createOtpRecord(adminEmail, 'forgot_password')
        const result = await sendAdminOtpEmail(ADMIN_EMAIL, otp)

        if (!result.success) {
          return NextResponse.json(
            { error: 'Failed to send OTP email. Please try again.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: `OTP has been sent to ${ADMIN_EMAIL}.`,
          emailLogId: result.id,
        })
      }

      // resend_otp
      const otp = await createOtpRecord(adminEmail, 'forgot_password')
      const result = await resendAdminOtpEmail(
        ADMIN_EMAIL,
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
        message: `A new OTP has been sent to ${ADMIN_EMAIL}.`,
        emailLogId: result.id,
      })
    }

    // ─── For verify_otp / reset_password: must use admin email ───
    if (normalizedInput !== adminEmail) {
      return NextResponse.json(
        { error: 'Invalid request. Email does not match admin account.' },
        { status: 400 }
      )
    }

    switch (action) {
      // ─── Verify OTP ──────────────────────────────────────
      case 'verify_otp': {
        if (!body.otp) {
          return NextResponse.json({ error: 'OTP code is required' }, { status: 400 })
        }

        const verification = await verifyOtp(
          adminEmail,
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
          adminEmail,
          body.otp,
          'forgot_password'
        )

        if (!verification.valid) {
          return NextResponse.json(
            { error: verification.error || 'Invalid OTP code' },
            { status: 400 }
          )
        }

        // Update or create the admin user in DB
        // The login route checks the DB first, so this new password will be used
        const existingUser = await db.user.findUnique({
          where: { email: adminEmail },
        })

        if (existingUser) {
          await db.user.update({
            where: { email: adminEmail },
            data: { password: body.newPassword },
          })
        } else {
          await db.user.create({
            data: {
              email: adminEmail,
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
