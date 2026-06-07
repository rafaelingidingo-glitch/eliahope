import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    })

    const campaignsWithProgress = campaigns.map((c) => ({
      ...c,
      percentage: c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0,
      remaining: Math.max(0, c.goal - c.raised),
    }))

    return NextResponse.json({ campaigns: campaignsWithProgress })
  } catch (error) {
    console.error('Campaigns GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Require admin auth to create campaigns
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

    return NextResponse.json({ success: true, campaign })
  } catch (error) {
    console.error('Campaign POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
