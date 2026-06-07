import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendNewsletterBroadcastEmail } from '@/lib/resend'

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

    if (!body.subject || !body.body) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      )
    }

    // Build the HTML content from plain text body
    const htmlContent = body.body
      .split('\n')
      .map((line: string) => `<p style="margin:0 0 12px 0;">${line || '<br/>'}</p>`)
      .join('')

    if (body.to === 'all') {
      // Broadcast to all active subscribers
      const subscribers = await db.newsletter.findMany({
        where: { status: 'active' },
        select: { email: true },
      })

      if (subscribers.length === 0) {
        return NextResponse.json(
          { error: 'No active subscribers to send to' },
          { status: 400 }
        )
      }

      // Send to each subscriber via BCC to protect privacy
      const recipientEmails = subscribers.map((s) => s.email)
      const result = await sendNewsletterBroadcastEmail(
        recipientEmails.join(','),
        body.subject,
        htmlContent
      )

      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to send newsletter: ' + (result.error || 'Unknown error') },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Newsletter sent to ${subscribers.length} subscriber(s)`,
        sentCount: subscribers.length,
      })
    } else {
      // Send to a single recipient
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.to)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }

      const result = await sendNewsletterBroadcastEmail(
        body.to,
        body.subject,
        htmlContent
      )

      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to send newsletter email: ' + (result.error || 'Unknown error') },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Newsletter sent successfully' })
    }
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
