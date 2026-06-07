import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const sponsors = await db.sponsor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { child: { select: { name: true } } },
    })
    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Sponsors GET error:', error)
    return NextResponse.json({ error: 'Failed to load sponsors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json() as {
      name: string
      email: string
      phone?: string | null
      childId?: string | null
      amount: number
      frequency?: string
      status?: string
    }

    const sponsor = await db.sponsor.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        childId: body.childId && body.childId !== 'none' ? body.childId : null,
        amount: body.amount,
        frequency: body.frequency || 'monthly',
        status: body.status || 'active',
      },
    })

    return NextResponse.json(sponsor, { status: 201 })
  } catch (error) {
    console.error('Sponsors POST error:', error)
    return NextResponse.json({ error: 'Failed to create sponsor' }, { status: 500 })
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
      email?: string
      phone?: string | null
      childId?: string | null
      amount?: number
      frequency?: string
      status?: string
    }

    const sponsor = await db.sponsor.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.childId !== undefined && { childId: body.childId === 'none' ? null : body.childId }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.frequency !== undefined && { frequency: body.frequency }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    return NextResponse.json(sponsor)
  } catch (error) {
    console.error('Sponsors PUT error:', error)
    return NextResponse.json({ error: 'Failed to update sponsor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.sponsor.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sponsors DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete sponsor' }, { status: 500 })
  }
}
