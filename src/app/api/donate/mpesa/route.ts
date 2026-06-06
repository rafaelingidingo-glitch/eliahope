import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `EHC${timestamp}${random}`
}

function normalizePhone(phone: string): string | null {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s-]/g, '')

  // Handle +255 prefix
  if (cleaned.startsWith('+255')) {
    cleaned = '0' + cleaned.substring(4)
  }
  // Handle 255 prefix (without +)
  else if (cleaned.startsWith('255') && cleaned.length >= 12) {
    cleaned = '0' + cleaned.substring(3)
  }

  // Validate: should start with 0 and be 10 digits
  if (/^0\d{9}$/.test(cleaned)) {
    return cleaned
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string
      amount: number
      name: string
      email?: string
      campaignId?: string
    }

    const { phone, amount, name, email, campaignId } = body

    // Validate name
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide your full name' },
        { status: 400 }
      )
    }

    // Validate phone
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid Tanzanian phone number. Use format: +255XXXXXXXXX or 0XXXXXXXXX' },
        { status: 400 }
      )
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Donation amount must be greater than zero' },
        { status: 400 }
      )
    }

    // Get campaign name if provided
    let campaignName: string | null = null
    if (campaignId) {
      const campaign = await db.campaign.findUnique({ where: { id: campaignId } })
      if (campaign) {
        campaignName = campaign.title
      }
    }

    // Generate transaction ID
    const transactionId = generateTransactionId()

    // Create donation record
    const donation = await db.donation.create({
      data: {
        donorName: name.trim(),
        donorEmail: email?.trim() || null,
        donorPhone: normalizedPhone,
        amount,
        currency: 'TZS',
        method: 'mpesa',
        type: 'one-time',
        campaignId: campaignId || null,
        campaign: campaignName,
        status: 'pending',
        transactionId,
      },
    })

    // Simulate M-Pesa STK Push callback (async)
    // In production, this would be a callback from M-Pesa API
    setTimeout(async () => {
      try {
        const mockReceipt = `QHK${Date.now().toString().slice(-8)}`
        await db.donation.update({
          where: { id: donation.id },
          data: {
            status: 'successful',
            mpesaReceipt: mockReceipt,
          },
        })

        // Update campaign raised amount if applicable
        if (campaignId) {
          await db.campaign.update({
            where: { id: campaignId },
            data: {
              raised: { increment: amount },
            },
          })
        }
      } catch (err) {
        console.error('M-Pesa simulation callback error:', err)
      }
    }, 3000)

    return NextResponse.json({
      success: true,
      transactionId,
      donationId: donation.id,
      message: 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete.',
    })
  } catch (error) {
    console.error('M-Pesa donation error:', error)
    return NextResponse.json(
      { error: 'Failed to process donation. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const transactionId = request.nextUrl.searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const donation = await db.donation.findFirst({
      where: { transactionId },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: donation.id,
      status: donation.status,
      amount: donation.amount,
      donorName: donation.donorName,
      transactionId: donation.transactionId,
      mpesaReceipt: donation.mpesaReceipt,
      createdAt: donation.createdAt,
    })
  } catch (error) {
    console.error('Check donation status error:', error)
    return NextResponse.json(
      { error: 'Failed to check donation status' },
      { status: 500 }
    )
  }
}
