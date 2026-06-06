import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed to our newsletter.' },
        { status: 409 }
      )
    }

    await db.newsletter.create({
      data: {
        name,
        email,
      },
    })

    return NextResponse.json(
      { message: 'Thank you for subscribing! You will receive our latest updates.' },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
