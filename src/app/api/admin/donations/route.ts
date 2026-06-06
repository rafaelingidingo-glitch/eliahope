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

export async function POST(request: NextRequest) {
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

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Donations POST error:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as {
      status?: string
      title?: string
      description?: string
      goal?: number
      raised?: number
    }

    // Check if it's a campaign update or donation update
    if (body.title || body.goal !== undefined) {
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
      return NextResponse.json(campaign)
    }

    // Donation update
    const donation = await db.donation.update({
      where: { id },
      data: { ...(body.status && { status: body.status }) },
    })

    return NextResponse.json(donation)
  } catch (error) {
    console.error('Donations PUT error:', error)
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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
