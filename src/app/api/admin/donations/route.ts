import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { DonationStatus } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const [donations, campaigns] = await Promise.all([
      db.donation.findMany({ orderBy: { createdAt: 'desc' } }),
      db.campaign.findMany({ orderBy: { createdAt: 'desc' } }),
    ])
    // Convert Decimal fields to numbers for JSON serialization
    const serializedDonations = donations.map(d => ({ ...d, amount: toNumber(d.amount) }))
    const serializedCampaigns = campaigns.map(c => ({ ...c, goal: toNumber(c.goal), raised: toNumber(c.raised) }))
    return NextResponse.json({ donations: serializedDonations, campaigns: serializedCampaigns })
  } catch (error) {
    console.error('Donations GET error:', error)
    return NextResponse.json({ error: 'Failed to load donations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json() as {
      title: string
      description: string
      goal: number
    }

    const { title, description, goal } = body

    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { error: 'Campaign title is required (min 3 characters)' },
        { status: 400 }
      )
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Campaign description is required (min 10 characters)' },
        { status: 400 }
      )
    }

    if (!goal || goal <= 0) {
      return NextResponse.json(
        { error: 'Campaign goal must be greater than zero' },
        { status: 400 }
      )
    }

    const campaign = await db.campaign.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        goal,
        raised: 0,
        status: 'active',
      },
    })

    return NextResponse.json({ success: true, campaign: { ...campaign, goal: toNumber(campaign.goal), raised: toNumber(campaign.raised) } })
  } catch (error) {
    console.error('Donations POST error:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    const type = request.nextUrl.searchParams.get('type') // 'campaign' or 'donation'
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as {
      status?: string
      title?: string
      description?: string
      goal?: number
      raised?: number
    }

    // Determine update type: explicit type param takes precedence, otherwise infer from body
    const isCampaignUpdate = type === 'campaign' || (!type && (body.title !== undefined || body.goal !== undefined))

    if (isCampaignUpdate) {
      // Validate campaign status if provided
      const validCampaignStatuses = ['active', 'completed', 'paused', 'cancelled']
      if (body.status && !validCampaignStatuses.includes(body.status)) {
        return NextResponse.json({ error: `Invalid campaign status. Must be one of: ${validCampaignStatuses.join(', ')}` }, { status: 400 })
      }

      // Campaign update
      const campaign = await db.campaign.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title.trim() }),
          ...(body.description !== undefined && { description: body.description.trim() }),
          ...(body.goal !== undefined && { goal: body.goal }),
          ...(body.raised !== undefined && { raised: body.raised }),
          ...(body.status && { status: body.status }),
        },
      })
      return NextResponse.json({ ...campaign, goal: toNumber(campaign.goal), raised: toNumber(campaign.raised) })
    }

    // Donation update - validate status
    const validStatuses = ['pending', 'processing', 'successful', 'failed', 'cancelled']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const donation = await db.donation.update({
      where: { id },
      data: { ...(body.status && { status: body.status as DonationStatus }) },
    })

    return NextResponse.json({ ...donation, amount: toNumber(donation.amount) })
  } catch (error) {
    console.error('Donations PUT error:', error)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    const type = request.nextUrl.searchParams.get('type') // 'donation' or 'campaign'

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    if (type === 'campaign') {
      await db.campaign.delete({ where: { id } })
    } else {
      await db.donation.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Donations DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
  }
}
