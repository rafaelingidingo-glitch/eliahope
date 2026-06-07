import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Validate message length
    const trimmedMessage = String(message).trim()
    if (trimmedMessage.length < 5) {
      return NextResponse.json(
        { error: 'Message must be at least 5 characters long.' },
        { status: 400 }
      )
    }
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters.' },
        { status: 400 }
      )
    }

    await db.contactMessage.create({
      data: {
        name: String(name).trim().slice(0, 200),
        email: String(email).trim().slice(0, 200),
        phone: phone ? String(phone).trim().slice(0, 50) : null,
        message: trimmedMessage,
      },
    })

    return NextResponse.json(
      { message: 'Thank you for your message! We will get back to you soon.' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
