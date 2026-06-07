import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { requireAdmin } from '@/lib/auth'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const rawSubfolder = (formData.get('subfolder') as string) || 'images'
    // Sanitize subfolder to prevent path traversal attacks
    const subfolder = rawSubfolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'images'

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate filename doesn't contain path separators
    if (file.name.includes('/') || file.name.includes('\\') || file.name.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subfolder)
    await mkdir(uploadsDir, { recursive: true })

    const fileExt = file.name.split('.').pop() || 'png'
    // Sanitize extension — only allow alphanumeric characters
    const sanitizedExt = fileExt.replace(/[^a-zA-Z0-9]/g, '') || 'png'
    const fileName = `${subfolder}_${Date.now()}_${randomBytes(3).toString('hex')}.${sanitizedExt}`
    const filePath = path.join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const url = `/uploads/${subfolder}/${fileName}`

    return NextResponse.json({
      success: true,
      url,
      fileName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
