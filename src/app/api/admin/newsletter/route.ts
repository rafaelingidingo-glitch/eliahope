import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { sendNewsletterBroadcastEmail } from '@/lib/resend'
import { newsletterBroadcastSchema } from '@/lib/validations'
import { parsePagination, paginatedResponse, errorResponse, serverErrorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const pagination = parsePagination(request.nextUrl.searchParams)
    const [subscribers, total] = await Promise.all([
      db.newsletter.findMany({
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      db.newsletter.count(),
    ])
    return paginatedResponse(subscribers, total, pagination)
  } catch (error) {
    console.error('Newsletter GET error:', error)
    return serverErrorResponse('Failed to load subscribers')
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

    // Validate with Zod
    const validation = newsletterBroadcastSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input'
      return errorResponse(firstError, 400)
    }
    const { subject, to } = validation.data

    // Sanitize HTML: escape special characters to prevent XSS
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    // Build the HTML content from plain text body with escaped content
    const htmlContent = body.body
      .split('\n')
      .map((line: string) => `<p style="margin:0 0 12px 0;">${escapeHtml(line) || '<br/>'}</p>`)
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
