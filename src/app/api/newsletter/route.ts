import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendNewsletterWelcomeEmail } from '@/lib/resend'
import { newsletterSubscribeSchema } from '@/lib/validations'
import { createdResponse, errorResponse, serverErrorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const result = newsletterSubscribeSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid input'
      return errorResponse(firstError, 400)
    }

    const { name, email } = result.data
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      return errorResponse('This email is already subscribed to our newsletter.', 409)
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
      console.warn('[Newsletter] Subscription saved but welcome email failed:', emailResult.error)
      return NextResponse.json(
        {
          success: true,
          message: 'Thank you for subscribing! Your welcome email could not be sent, but you are successfully subscribed.',
          emailSent: false,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing! A welcome email has been sent to your inbox.',
        emailSent: true,
        emailLogId: emailResult.id,
      },
      { status: 201 }
    )
  } catch {
    return serverErrorResponse('Something went wrong. Please try again later.')
  }
}
