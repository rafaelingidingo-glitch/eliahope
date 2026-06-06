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

    await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
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
