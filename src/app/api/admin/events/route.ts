import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const events = await db.event.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(events)
  } catch (error) {
    console.error('Events GET error:', error)
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json() as {
      title: string
      description: string
      date: string
      location: string
      image?: string | null
      status?: string
    }

    const event = await db.event.create({
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date),
        location: body.location,
        image: body.image || null,
        status: body.status || 'upcoming',
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Events POST error:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as {
      title?: string
      description?: string
      date?: string
      location?: string
      image?: string | null
      status?: string
    }

    const event = await db.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Events PUT error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.event.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Events DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
