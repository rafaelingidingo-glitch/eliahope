import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import {
  sendDonationConfirmationEmail,
  resendDonationConfirmationEmail,
} from '@/lib/resend'

// Simple in-memory rate limiting for email endpoints
const emailRateLimit = new Map<string, number>()
const RATE_LIMIT_MS = 60_000 // 1 minute between emails for the same donation

function checkRateLimit(donationId: string): boolean {
  const now = Date.now()
  const lastSent = emailRateLimit.get(donationId)
  if (lastSent && now - lastSent < RATE_LIMIT_MS) {
    return false // Rate limited
  }
  emailRateLimit.set(donationId, now)
  return true
}

/**
 * POST /api/email/donation-confirm
 *
 * Send or resend a donation confirmation email.
 *
 * Request body:
 *   { action: 'send', donationId: string }
 *   { action: 'resend', donationId: string, emailLogId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: 'send' | 'resend'
      donationId: string
      emailLogId?: string
    }

    const { action, donationId } = body

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 })
    }

    // Find the donation
    const donation = await db.donation.findUnique({
      where: { id: donationId },
      include: { campaign: { select: { title: true } } },
    })

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    if (!donation.donorEmail) {
      return NextResponse.json(
        { error: 'This donation does not have an email address on file. Cannot send confirmation email.' },
        { status: 400 }
      )
    }

    if (donation.status !== 'successful') {
      return NextResponse.json(
        { error: 'Cannot send confirmation email for a donation that is not yet completed.' },
        { status: 400 }
      )
    }

    // Rate limit check
    if (!checkRateLimit(donationId)) {
      return NextResponse.json(
        { error: 'Please wait a moment before requesting another email.' },
        { status: 429 }
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
        hour: '2-digit',
        minute: '2-digit',
      }),
      campaign: donation.campaign?.title || undefined,
    }

    if (action === 'send') {
      const result = await sendDonationConfirmationEmail(emailData)

      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to send donation confirmation email.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Donation confirmation email sent successfully.',
        emailLogId: result.id,
      })
    }

    if (action === 'resend') {
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

    return NextResponse.json({ error: 'Invalid action. Use "send" or "resend".' }, { status: 400 })
  } catch (error) {
    console.error('[Donation Confirm Email] Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
