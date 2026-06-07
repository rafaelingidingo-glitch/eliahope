import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const subscribers = await db.newsletter.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Newsletter GET error:', error)
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json() as {
      to: string
      subject: string
      body: string
    }

    // In a real app, this would send emails
    // For now, just log and return success
    console.log('Newsletter sent:', { to: body.to, subject: body.subject })

    return NextResponse.json({ success: true, message: 'Newsletter sent successfully' })
  } catch (error) {
    console.error('Newsletter POST error:', error)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.newsletter.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 })
  }
}
