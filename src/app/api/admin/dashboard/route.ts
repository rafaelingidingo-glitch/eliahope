import { NextRequest, NextResponse } from 'next/server'
import { db, toNumber } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const [
      donations,
      children,
      volunteers,
      events,
      newsletters,
    ] = await Promise.all([
      db.donation.aggregate({ _sum: { amount: true } }),
      db.child.count(),
      db.volunteer.count({ where: { status: 'approved' } }),
      db.event.count({ where: { status: 'upcoming' } }),
      db.newsletter.count({ where: { status: 'active' } }),
    ])

    const stats = {
      totalDonations: toNumber(donations._sum.amount),
      childrenSupported: children,
      totalVolunteers: volunteers,
      activeEvents: events,
      newsletterSubscribers: newsletters,
      websiteVisitors: 3450,
    }

    const recentDonations = await db.donation.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    })

    const recentVolunteers = await db.volunteer.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
    })

    const recentActivity = [
      ...recentDonations.map((d) => ({
        id: d.id,
        type: 'donation',
        message: `New donation of TZS ${toNumber(d.amount).toLocaleString()} from ${d.donorName}`,
        time: getTimeAgo(d.createdAt),
      })),
      ...recentVolunteers.map((v) => ({
        id: v.id,
        type: 'volunteer',
        message: `New volunteer application from ${v.name}`,
        time: getTimeAgo(v.createdAt),
      })),
    ].sort(() => Math.random() - 0.5)

    return NextResponse.json({ stats, recentActivity })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}
