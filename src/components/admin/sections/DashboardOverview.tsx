'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Baby,
  Users,
  Calendar,
  Mail,
  Eye,
  TrendingUp,
  Activity,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { adminFetch } from '@/lib/admin-api'

const monthlyDonationData = [
  { month: 'Jul', amount: 1200000 },
  { month: 'Aug', amount: 1800000 },
  { month: 'Sep', amount: 1500000 },
  { month: 'Oct', amount: 2200000 },
  { month: 'Nov', amount: 1900000 },
  { month: 'Dec', amount: 2800000 },
  { month: 'Jan', amount: 2100000 },
  { month: 'Feb', amount: 2400000 },
  { month: 'Mar', amount: 3100000 },
]

const weeklyVisitors = [
  { day: 'Mon', visitors: 120 },
  { day: 'Tue', visitors: 145 },
  { day: 'Wed', visitors: 132 },
  { day: 'Thu', visitors: 168 },
  { day: 'Fri', visitors: 190 },
  { day: 'Sat', visitors: 85 },
  { day: 'Sun', visitors: 95 },
]

interface DashboardStats {
  totalDonations: number
  childrenSupported: number
  totalVolunteers: number
  activeEvents: number
  newsletterSubscribers: number
  websiteVisitors: number
}

interface RecentActivity {
  id: string
  type: string
  message: string
  time: string
}

interface DashboardOverviewProps {
  onNavigate?: (section: string) => void
  onClose?: () => void
}

export default function DashboardOverview({ onNavigate, onClose }: DashboardOverviewProps = {}) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    childrenSupported: 0,
    totalVolunteers: 0,
    activeEvents: 0,
    newsletterSubscribers: 0,
    websiteVisitors: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await adminFetch('/api/admin/dashboard')
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats)
          setRecentActivity(data.recentActivity || [])
        }
      } catch {
        // Use fallback data
        setStats({
          totalDonations: 6100000,
          childrenSupported: 500,
          totalVolunteers: 120,
          activeEvents: 2,
          newsletterSubscribers: 7,
          websiteVisitors: 3450,
        })
        setRecentActivity([
          { id: '1', type: 'donation', message: 'New donation of TZS 500,000 from John Mwangi', time: '2 hours ago' },
          { id: '2', type: 'volunteer', message: 'New volunteer application from Fatima Said', time: '4 hours ago' },
          { id: '3', type: 'event', message: 'Event "Annual Charity Gala" updated', time: '6 hours ago' },
          { id: '4', type: 'newsletter', message: '3 new newsletter subscribers', time: '1 day ago' },
          { id: '5', type: 'sponsor', message: 'New child sponsorship by Maria Garcia', time: '2 days ago' },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: 'Total Donations', value: `TZS ${(stats.totalDonations / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', iconBg: 'bg-emerald-100' },
    { title: 'Children Supported', value: stats.childrenSupported.toLocaleString(), icon: Baby, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
    { title: 'Total Volunteers', value: stats.totalVolunteers.toLocaleString(), icon: Users, color: 'bg-violet-50 text-violet-600', iconBg: 'bg-violet-100' },
    { title: 'Active Events', value: stats.activeEvents.toString(), icon: Calendar, color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
    { title: 'Newsletter Subscribers', value: stats.newsletterSubscribers.toString(), icon: Mail, color: 'bg-pink-50 text-pink-600', iconBg: 'bg-pink-100' },
    { title: 'Website Visitors', value: stats.websiteVisitors.toLocaleString(), icon: Eye, color: 'bg-cyan-50 text-cyan-600', iconBg: 'bg-cyan-100' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-[#0F2D5C]">Welcome back, Admin!</h2>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with Elia&apos;s Hope Community today.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[5px] ${stat.iconBg}`}>
                    <Icon className={`h-5 w-5 ${stat.color.split(' ')[1]}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{stat.title}</p>
                    <p className="text-lg font-bold text-[#0F2D5C]">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0F2D5C] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange" />
              Monthly Donations (TZS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyDonationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: number) => [`TZS ${value.toLocaleString()}`, 'Donations']} />
                  <Bar dataKey="amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Visitors Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0F2D5C] flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#0F2D5C]" />
              Weekly Website Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyVisitors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="visitors" stroke="#0F2D5C" strokeWidth={2} dot={{ fill: '#0F2D5C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0F2D5C] flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-[5px] hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-orange mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#0F2D5C]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => onNavigate?.('events')} className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-orange hover:text-white hover:border-orange transition-all">
                <Plus className="h-5 w-5" />
                <span className="text-xs">Add Event</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.('donations')} className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-orange hover:text-white hover:border-orange transition-all">
                <DollarSign className="h-5 w-5" />
                <span className="text-xs">View Donations</span>
              </Button>
              <Button variant="outline" onClick={() => onNavigate?.('newsletter')} className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-orange hover:text-white hover:border-orange transition-all">
                <Mail className="h-5 w-5" />
                <span className="text-xs">Send Newsletter</span>
              </Button>
              <Button variant="outline" onClick={onClose} className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-orange hover:text-white hover:border-orange transition-all">
                <ExternalLink className="h-5 w-5" />
                <span className="text-xs">View Website</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
