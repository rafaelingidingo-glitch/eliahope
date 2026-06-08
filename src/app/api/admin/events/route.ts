import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache' // <-- 1. Tumeongeza hii kwa ajili ya kusafisha cache

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

    // Validate required fields
    if (!body.title || body.title.trim().length < 2) {
      return NextResponse.json({ error: 'Event title is required (min 2 characters)' }, { status: 400 })
    }
    if (!body.date || isNaN(new Date(body.date).getTime())) {
      return NextResponse.json({ error: 'Valid event date is required' }, { status: 400 })
    }
    if (!body.location || body.location.trim().length < 2) {
      return NextResponse.json({ error: 'Event location is required (min 2 characters)' }, { status: 400 })
    }

    // Validate status if provided
    const validEventStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
    if (body.status && !validEventStatuses.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validEventStatuses.join(', ')}` }, { status: 400 })
    }

    const event = await db.event.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        date: new Date(body.date),
        location: body.location.trim(),
        image: body.image || null,
        status: body.status || 'upcoming',
      },
    })

    // <-- 2. Safisha cache baada ya kutengeneza event mpya
    revalidatePath('/events')
    revalidatePath('/')

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

    // Validate status if provided
    const validEventStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled']
    if (body.status && !validEventStatuses.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validEventStatuses.join(', ')}` }, { status: 400 })
    }

    // Validate date if provided
    if (body.date !== undefined && isNaN(new Date(body.date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const event = await db.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.location !== undefined && { location: body.location.trim() }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    // <-- 3. Safisha cache baada ya ku-update event
    revalidatePath('/events')
    revalidatePath(`/events/${id}`)
    revalidatePath('/')

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

    // <-- 4. Safisha cache baada ya kufuta kabisa event
    revalidatePath('/events')
    revalidatePath(`/events/${id}`)
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Events DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}