'use client'

import { useState, useEffect } from 'react'
import { Download, Filter, DollarSign, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface DonationItem {
  id: string
  donorName: string
  donorEmail: string
  amount: number
  currency: string
  method: string
  type: string
  campaign: string | null
  status: string
  message: string | null
  createdAt: string
}

interface CampaignItem {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  status: string
}

export default function DonationManagement() {
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const { toast } = useToast()

  const fetchDonations = async () => {
    try {
      const res = await fetch('/api/admin/donations')
      if (res.ok) {
        const data = await res.json()
        setDonations(data.donations || [])
        setCampaigns(data.campaigns || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load donations', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDonations() }, [])

  const filteredDonations = donations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (methodFilter !== 'all' && d.method !== methodFilter) return false
    if (campaignFilter !== 'all' && d.campaign !== campaignFilter) return false
    return true
  })

  const handleExport = () => {
    const headers = ['Donor Name', 'Email', 'Amount', 'Currency', 'Method', 'Type', 'Campaign', 'Status', 'Date']
    const rows = filteredDonations.map((d) => [
      d.donorName, d.donorEmail, d.amount.toString(), d.currency, d.method, d.type, d.campaign || '', d.status, new Date(d.createdAt).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'donations-export.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Success', description: 'CSV exported successfully' })
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const totalDonations = filteredDonations.reduce((sum, d) => sum + d.amount, 0)

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Donation Management</h2>
          <p className="text-gray-500 text-sm">Track and manage all donations</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="donations">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank">Bank</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Campaign" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.title}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto text-sm text-gray-500">
              Total: <span className="font-bold text-[#0F2D5C]">TZS {totalDonations.toLocaleString()}</span>
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#0F2D5C]">{d.donorName}</p>
                            <p className="text-xs text-gray-400">{d.donorEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#0F2D5C]">TZS {d.amount.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">({d.type})</span>
                        </TableCell>
                        <TableCell className="capitalize">{d.method}</TableCell>
                        <TableCell>{d.campaign || '—'}</TableCell>
                        <TableCell><Badge className={statusColor(d.status)}>{d.status}</Badge></TableCell>
                        <TableCell className="text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {filteredDonations.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No donations found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const percent = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0
              return (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#0F2D5C] flex items-center justify-between">
                      {c.title}
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className={c.status === 'active' ? 'bg-green-100 text-green-700' : ''}>
                        {c.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500">{c.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Raised: TZS {c.raised.toLocaleString()}</span>
                        <span className="font-medium text-[#0F2D5C]">Goal: TZS {c.goal.toLocaleString()}</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                      <p className="text-xs text-gray-400 text-right">{percent}% complete</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
