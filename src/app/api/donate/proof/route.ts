import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const donorName = formData.get('donorName') as string
    const donorPhone = formData.get('donorPhone') as string
    const amount = parseFloat(formData.get('amount') as string)
    const receipt = formData.get('receipt') as File | null
    const campaignId = (formData.get('campaignId') as string) || null

    // Validate
    if (!donorName || donorName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide your full name' },
        { status: 400 }
      )
    }

    if (!donorPhone || donorPhone.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid phone number' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Please enter a valid amount' },
        { status: 400 }
      )
    }

    if (!receipt || receipt.size === 0) {
      return NextResponse.json(
        { error: 'Please upload a payment receipt' },
        { status: 400 }
      )
    }

    // Validate file type (receipts should be images or PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(receipt.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, GIF, WebP image or PDF.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (receipt.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Save receipt file
    const bytes = await receipt.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts')
    await mkdir(uploadsDir, { recursive: true })

    const fileExt = receipt.name.split('.').pop() || 'png'
    const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const filePath = path.join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const receiptUrl = `/uploads/receipts/${fileName}`

    // Create payment proof record
    const proof = await db.paymentProof.create({
      data: {
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim(),
        amount,
        receiptUrl,
        campaignId,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      proofId: proof.id,
      message: 'Payment proof submitted successfully. We will verify it shortly.',
    })
  } catch (error) {
    console.error('Payment proof submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit payment proof. Please try again.' },
      { status: 500 }
    )
  }
}
