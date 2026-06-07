import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const volunteers = await db.volunteer.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(volunteers)
  } catch (error) {
    console.error('Volunteers GET error:', error)
    return NextResponse.json({ error: 'Failed to load volunteers' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as { status?: string; programId?: string }

    // Validate status if provided
    const validStatuses = ['pending', 'approved', 'rejected', 'inactive']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    const volunteer = await db.volunteer.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.programId && { programId: body.programId }),
      },
    })

    return NextResponse.json(volunteer)
  } catch (error) {
    console.error('Volunteers PUT error:', error)
    return NextResponse.json({ error: 'Failed to update volunteer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.volunteer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Volunteers DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete volunteer' }, { status: 500 })
  }
}
