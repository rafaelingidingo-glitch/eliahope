import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactSchema } from '@/lib/validations'
import { createdResponse, errorResponse, serverErrorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input with Zod
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid input'
      return errorResponse(firstError, 400)
    }

    const { name, email, phone, message } = result.data

    await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
      },
    })

    return createdResponse(undefined, 'Thank you for your message! We will get back to you soon.')
  } catch {
    return serverErrorResponse('Something went wrong. Please try again later.')
  }
}
