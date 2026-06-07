import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const images = await db.galleryImage.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(images)
  } catch (error) {
    console.error('Gallery GET error:', error)
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      url: string
      title?: string | null
      category: string
      description?: string | null
    }

    const image = await db.galleryImage.create({
      data: {
        url: body.url,
        title: body.title || null,
        category: body.category,
        description: body.description || null,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Gallery POST error:', error)
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.galleryImage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
