import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const volunteers = await db.volunteer.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(volunteers)
  } catch (error) {
    console.error('Volunteers GET error:', error)
    return NextResponse.json({ error: 'Failed to load volunteers' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as { status?: string; programId?: string }
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
