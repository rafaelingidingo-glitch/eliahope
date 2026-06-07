import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import {
  resendNewsletterWelcomeEmail,
  sendDonationConfirmationEmail,
  resendDonationConfirmationEmail,
} from '@/lib/resend'

/**
 * POST /api/email/resend
 *
 * Generic resend endpoint for various email types.
 * Calls email functions directly — no internal HTTP fetch.
 *
 * Request body:
 *   { type: 'newsletter_welcome', to: string, name: string, emailLogId?: string }
 *   { type: 'donation_confirmation', donationId: string, emailLogId?: string }
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

        // Look up the donation directly (no internal HTTP fetch)
        const donation = await db.donation.findUnique({
          where: { id: body.donationId },
          include: { campaign: { select: { title: true } } },
        })

        if (!donation) {
          return NextResponse.json(
            { error: 'Donation not found' },
            { status: 404 }
          )
        }

        if (!donation.donorEmail) {
          return NextResponse.json(
            { error: 'This donation has no email address on file.' },
            { status: 400 }
          )
        }

        const emailData = {
          to: donation.donorEmail,
          name: donation.donorName || 'Donor',
          amount: toNumber(donation.amount),
          transactionId: donation.transactionId || donation.id,
          method: donation.method,
          date: donation.createdAt.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          campaign: donation.campaign?.title || undefined,
        }

        const result = await resendDonationConfirmationEmail(
          emailData,
          body.emailLogId || ''
        )

        if (!result.success) {
          return NextResponse.json(
            { error: 'Failed to resend donation confirmation email.' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Donation confirmation email resent successfully.',
          emailLogId: result.id,
        })
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
