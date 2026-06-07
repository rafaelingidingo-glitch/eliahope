import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  resendNewsletterWelcomeEmail,
  isResendConfigured,
} from '@/lib/resend'

/**
 * POST /api/email/resend
 *
 * Generic resend endpoint for various email types.
 *
 * Request body:
 *   { type: 'newsletter_welcome', to: string, name: string, emailLogId?: string }
 *   { type: 'donation_confirmation', donationId: string, emailLogId?: string }
 *     (for donation_confirmation, delegates to /api/email/donation-confirm)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      type: 'newsletter_welcome' | 'donation_confirmation'
      to?: string
      name?: string
      emailLogId?: string
      donationId?: string
    }

    const { type } = body

    switch (type) {
      // ─── Resend Newsletter Welcome ──────────────────────────
      case 'newsletter_welcome': {
        if (!body.to || !body.name) {
          return NextResponse.json(
            { error: 'Email address and name are required' },
            { status: 400 }
          )
        }

        // Verify the subscriber exists
        const subscriber = await db.newsletter.findUnique({
          where: { email: body.to },
        })

        if (!subscriber) {
          return NextResponse.json(
            { error: 'Subscriber not found' },
            { status: 404 }
          )
        }

        const result = await resendNewsletterWelcomeEmail(
          body.to,
          body.name,
          body.emailLogId || ''
        )

        if (!result.success) {
          return NextResponse.json(
            { error: 'Failed to resend welcome email. Please try again.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome email resent successfully.',
          emailLogId: result.id,
        })
      }

      // ─── Resend Donation Confirmation ───────────────────────
      case 'donation_confirmation': {
        if (!body.donationId) {
          return NextResponse.json(
            { error: 'Donation ID is required' },
            { status: 400 }
          )
        }

        // Delegate to the donation-confirm endpoint
        const confirmRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/email/donation-confirm`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'resend',
              donationId: body.donationId,
              emailLogId: body.emailLogId,
            }),
          }
        )

        const confirmData = await confirmRes.json()
        return NextResponse.json(confirmData, { status: confirmRes.status })
      }

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Email Resend] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
