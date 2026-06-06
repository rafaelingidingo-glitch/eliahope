import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const donationId = request.nextUrl.searchParams.get('donationId')

    if (!donationId) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    const donation = await db.donation.findUnique({
      where: { id: donationId },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    // Generate text receipt
    const receiptText = `
════════════════════════════════════════════
        ELIA'S HOPE COMMUNITY
          DONATION RECEIPT
════════════════════════════════════════════

Receipt No:    ${donation.transactionId || donation.id}
Date:          ${new Date(donation.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}
Time:          ${new Date(donation.createdAt).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}

────────────────────────────────────────────
DONOR INFORMATION
────────────────────────────────────────────
Name:          ${donation.donorName}
Email:         ${donation.donorEmail || 'N/A'}
Phone:         ${donation.donorPhone || 'N/A'}

────────────────────────────────────────────
DONATION DETAILS
────────────────────────────────────────────
Amount:        TZS ${donation.amount.toLocaleString()}
Currency:      ${donation.currency}
Method:        ${donation.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
Type:          ${donation.type}
Campaign:      ${donation.campaign || 'General Donation'}
Status:        ${donation.status.toUpperCase()}
${donation.mpesaReceipt ? `M-Pesa Ref:     ${donation.mpesaReceipt}` : ''}
${donation.message ? `Message:       ${donation.message}` : ''}

════════════════════════════════════════════
  Thank you for your generous donation!
  Your support helps change lives.

  Elia's Hope Community
  Mwanza, Tanzania
  www.eliashope.org
════════════════════════════════════════════
`.trim()

    return new NextResponse(receiptText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="receipt-${donation.transactionId || donation.id}.txt"`,
      },
    })
  } catch (error) {
    console.error('Receipt download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}
