import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CRDB${timestamp}${random}`
}

function generateBankReference(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `TXN${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      accountHolderName: string
      crdbAccountNumber: string
      amount: number
      name?: string
      email?: string
      phone?: string
      campaignId?: string
    }

    const { accountHolderName, crdbAccountNumber, amount, name, email, phone, campaignId } = body

    // Donor name is optional - default to "Anonymous"
    const donorName = (name && name.trim().length >= 2) ? name.trim() : 'Anonymous'

    // Validate account holder name
    if (!accountHolderName || accountHolderName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Account holder name is required' },
        { status: 400 }
      )
    }

    // Validate CRDB account number (should be 13 digits)
    const cleanedAccount = crdbAccountNumber.replace(/[\s-]/g, '')
    if (!/^\d{10,16}$/.test(cleanedAccount)) {
      return NextResponse.json(
        { error: 'Invalid CRDB account number. Please enter a valid 10-16 digit account number.' },
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

    // Generate transaction ID and bank reference
    const transactionId = generateTransactionId()
    const bankReference = generateBankReference()

    // Create donation record with "processing" status
    const donation = await db.donation.create({
      data: {
        donorName: donorName,
        donorEmail: email?.trim() || null,
        donorPhone: phone?.trim() || null,
        amount,
        currency: 'TZS',
        method: 'crdb',
        type: 'one-time',
        campaignId: campaignId || null,
        campaign: campaignName,
        status: 'processing',
        transactionId,
        crdbAccountHolder: accountHolderName.trim(),
        crdbAccountNumber: cleanedAccount,
        crdbReference: bankReference,
      },
    })

    // Simulate CRDB Bank payment processing (async callback)
    // In production, this would be a redirect to CRDB's secure payment gateway
    // and a callback/webhook from CRDB confirming the transaction
    setTimeout(async () => {
      try {
        // Simulate: 90% success rate
        const isSuccess = Math.random() > 0.1

        if (isSuccess) {
          await db.donation.update({
            where: { id: donation.id },
            data: {
              status: 'successful',
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
        } else {
          await db.donation.update({
            where: { id: donation.id },
            data: {
              status: 'failed',
            },
          })
        }
      } catch (err) {
        console.error('CRDB simulation callback error:', err)
      }
    }, 4000) // Slightly longer than M-Pesa to simulate bank processing time

    return NextResponse.json({
      success: true,
      transactionId,
      donationId: donation.id,
      bankReference,
      message: 'Connecting to CRDB Bank. Please authorize the transaction.',
    })
  } catch (error) {
    console.error('CRDB donation error:', error)
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
      crdbReference: donation.crdbReference,
      crdbAccountHolder: donation.crdbAccountHolder,
      createdAt: donation.createdAt,
    })
  } catch (error) {
    console.error('Check CRDB donation status error:', error)
    return NextResponse.json(
      { error: 'Failed to check donation status' },
      { status: 500 }
    )
  }
}
