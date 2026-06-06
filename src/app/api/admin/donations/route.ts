import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [donations, campaigns] = await Promise.all([
      db.donation.findMany({ orderBy: { createdAt: 'desc' } }),
      db.campaign.findMany({ orderBy: { createdAt: 'desc' } }),
    ])
    return NextResponse.json({ donations, campaigns })
  } catch (error) {
    console.error('Donations GET error:', error)
    return NextResponse.json({ error: 'Failed to load donations' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as { status?: string }
    const donation = await db.donation.update({
      where: { id },
      data: { ...(body.status && { status: body.status }) },
    })

    return NextResponse.json(donation)
  } catch (error) {
    console.error('Donations PUT error:', error)
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 })
  }
}
