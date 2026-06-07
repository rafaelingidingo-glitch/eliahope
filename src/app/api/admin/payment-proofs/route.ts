import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { DonationMethod, DonationStatus, DonationType } from '@/generated/prisma/client'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const proofs = await db.paymentProof.findMany({
      orderBy: { createdAt: 'desc' },
    })
    // Convert Decimal fields to numbers for JSON serialization
    const serializedProofs = proofs.map(p => ({ ...p, amount: toNumber(p.amount) }))
    return NextResponse.json({ proofs: serializedProofs })
  } catch (error) {
    console.error('Payment proofs GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load payment proofs' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body = await request.json() as {
      id: string
      status: 'verified' | 'rejected'
      adminNotes?: string
    }

    const { id, status, adminNotes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Proof ID is required' },
        { status: 400 }
      )
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "verified" or "rejected"' },
        { status: 400 }
      )
    }

    const proof = await db.paymentProof.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    })

    // If verified, create a donation record for it
    if (status === 'verified') {
      const existingDonation = await db.donation.findFirst({
        where: {
          donorName: proof.donorName,
          donorPhone: proof.donorPhone,
          amount: proof.amount,
          method: 'bank_transfer' as DonationMethod,
          status: 'pending' as DonationStatus,
        },
      })

      if (!existingDonation) {
        let campaignName: string | null = null
        if (proof.campaignId) {
          const campaign = await db.campaign.findUnique({ where: { id: proof.campaignId } })
          if (campaign) {
            campaignName = campaign.title
            await db.campaign.update({
              where: { id: proof.campaignId },
              data: { raised: { increment: proof.amount } },
            })
          }
        }

        await db.donation.create({
          data: {
            donorName: proof.donorName,
            donorPhone: proof.donorPhone,
            amount: proof.amount,
            currency: 'TZS',
            method: 'bank_transfer' as DonationMethod,
            type: 'one_time' as DonationType,
            campaignId: proof.campaignId,
            status: 'successful' as DonationStatus,
            transactionId: `BNK${Date.now().toString(36).toUpperCase()}`,
          },
        })
      }
    }

    return NextResponse.json({ success: true, proof: { ...proof, amount: toNumber(proof.amount) } })
  } catch (error) {
    console.error('Payment proof PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment proof' },
      { status: 500 }
    )
  }
}
