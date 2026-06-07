import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const children = await db.child.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(children)
  } catch (error) {
    console.error('Children GET error:', error)
    return NextResponse.json({ error: 'Failed to load children' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json() as {
      name: string
      age?: number | null
      gender?: string | null
      story?: string | null
      photo?: string | null
      status?: string
      program?: string | null
    }

    const child = await db.child.create({
      data: {
        name: body.name,
        age: body.age ?? null,
        gender: body.gender ?? null,
        story: body.story ?? null,
        photo: body.photo ?? null,
        status: body.status || 'available',
        program: body.program ?? null,
      },
    })

    return NextResponse.json(child, { status: 201 })
  } catch (error) {
    console.error('Children POST error:', error)
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as {
      name?: string
      age?: number | null
      gender?: string | null
      story?: string | null
      photo?: string | null
      status?: string
      program?: string | null
    }

    const child = await db.child.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.age !== undefined && { age: body.age }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.story !== undefined && { story: body.story }),
        ...(body.photo !== undefined && { photo: body.photo }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.program !== undefined && { program: body.program }),
      },
    })

    return NextResponse.json(child)
  } catch (error) {
    console.error('Children PUT error:', error)
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.child.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Children DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 })
  }
}
