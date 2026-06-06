import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json({ error: 'Failed to load blog posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      title: string
      slug: string
      content: string
      excerpt?: string | null
      image?: string | null
      author?: string | null
      published?: boolean
    }

    const post = await db.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt ?? null,
        image: body.image ?? null,
        author: body.author ?? 'Admin',
        published: body.published ?? false,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error: unknown) {
    console.error('Blog POST error:', error)
    const message = error instanceof Error && error.message.includes('Unique') ? 'A post with this slug already exists' : 'Failed to create post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json() as {
      title?: string
      slug?: string
      content?: string
      excerpt?: string | null
      image?: string | null
      author?: string | null
      published?: boolean
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.author !== undefined && { author: body.author }),
        ...(body.published !== undefined && { published: body.published }),
      },
    })

    return NextResponse.json(post)
  } catch (error: unknown) {
    console.error('Blog PUT error:', error)
    const message = error instanceof Error && error.message.includes('Unique') ? 'A post with this slug already exists' : 'Failed to update post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await db.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blog DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
