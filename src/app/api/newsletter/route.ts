import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendNewsletterWelcomeEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      )
    }

    // Validate email format
    const trimmedEmail = String(email).trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Validate name length
    const trimmedName = String(name).trim()
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters.' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed to our newsletter.' },
        { status: 409 }
      )
    }

    await db.newsletter.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
      },
    })

    // Send welcome email via Resend
    const emailResult = await sendNewsletterWelcomeEmail(trimmedEmail, trimmedName)

    if (!emailResult.success) {
      // Subscription was saved, but email failed — still return success
      // but include a note about the email
      console.warn('[Newsletter] Subscription saved but welcome email failed:', emailResult.error)
      return NextResponse.json(
        {
          message: 'Thank you for subscribing! Your welcome email could not be sent, but you are successfully subscribed.',
          emailSent: false,
          emailLogId: null,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        message: 'Thank you for subscribing! A welcome email has been sent to your inbox.',
        emailSent: true,
        emailLogId: emailResult.id,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
