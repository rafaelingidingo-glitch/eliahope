'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Download,
  Filter,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Loader2,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Save,
  Search,
  Building2,
  CreditCard,
  Settings,
  FileCheck,
} from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface DonationItem {
  id: string
  donorName: string
  donorEmail: string | null
  donorPhone: string | null
  amount: number
  currency: string
  method: string
  type: string
  campaignId: string | null
  campaign: string | null
  status: string
  transactionId: string | null
  mpesaReceipt: string | null
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

interface PaymentProofItem {
  id: string
  donorName: string
  donorPhone: string
  amount: number
  receiptUrl: string
  campaignId: string | null
  status: string
  adminNotes: string | null
  createdAt: string
}

export default function DonationManagement() {
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [proofs, setProofs] = useState<PaymentProofItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Campaign form
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null)
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignDesc, setCampaignDesc] = useState('')
  const [campaignGoal, setCampaignGoal] = useState('')
  const [campaignSaving, setCampaignSaving] = useState(false)

  // Donation detail modal
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null)

  // Proof detail modal
  const [selectedProof, setSelectedProof] = useState<PaymentProofItem | null>(null)
  const [proofNotes, setProofNotes] = useState('')
  const [proofActionLoading, setProofActionLoading] = useState(false)

  // Bank settings
  const [bankAccount, setBankAccount] = useState('0150234567890')
  const [bankBranch, setBankBranch] = useState('Mwanza Main')
  const [bankSwift, setBankSwift] = useState('CORUTZTZ')
  const [settingsSaving, setSettingsSaving] = useState(false)

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/donations')
      if (res.ok) {
        const data = await res.json()
        setDonations(data.donations || [])
        setCampaigns(data.campaigns || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load donations', variant: 'destructive' })
    }
  }, [toast])

  const fetchProofs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/payment-proofs')
      if (res.ok) {
        const data = await res.json()
        setProofs(data.proofs || [])
      }
    } catch {
      // Silent
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const settings = await res.json() as { key: string; value: string }[]
        const acc = settings.find((s) => s.key === 'crdb_account_number')
        const br = settings.find((s) => s.key === 'crdb_branch')
        const sw = settings.find((s) => s.key === 'crdb_swift')
        if (acc) setBankAccount(acc.value)
        if (br) setBankBranch(br.value)
        if (sw) setBankSwift(sw.value)
      }
    } catch {
      // Use defaults
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchDonations(), fetchProofs(), fetchSettings()])
      setLoading(false)
    }
    load()
  }, [fetchDonations, fetchProofs, fetchSettings])

  // Filtered donations
  const filteredDonations = donations.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (methodFilter !== 'all' && d.method !== methodFilter) return false
    if (campaignFilter !== 'all' && d.campaign !== campaignFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchName = d.donorName.toLowerCase().includes(q)
      const matchEmail = (d.donorEmail || '').toLowerCase().includes(q)
      const matchTxn = (d.transactionId || '').toLowerCase().includes(q)
      if (!matchName && !matchEmail && !matchTxn) return false
    }
    return true
  })

  // Stats
  const totalDonations = donations
    .filter((d) => d.status === 'successful')
    .reduce((sum, d) => sum + d.amount, 0)
  const totalDonors = new Set(donations.filter((d) => d.status === 'successful').map((d) => d.donorName)).size
  const now = new Date()
  const monthlyDonations = donations
    .filter((d) => {
      const dDate = new Date(d.createdAt)
      return (
        d.status === 'successful' &&
        dDate.getMonth() === now.getMonth() &&
        dDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, d) => sum + d.amount, 0)
  const avgCampaignPerf =
    campaigns.length > 0
      ? Math.round(campaigns.reduce((sum, c) => sum + (c.goal > 0 ? (c.raised / c.goal) * 100 : 0), 0) / campaigns.length)
      : 0

  // Export CSV
  const handleExport = () => {
    const headers = ['Donor Name', 'Email', 'Phone', 'Amount', 'Currency', 'Method', 'Type', 'Campaign', 'Status', 'Transaction ID', 'M-Pesa Receipt', 'Date']
    const rows = filteredDonations.map((d) => [
      d.donorName,
      d.donorEmail || '',
      d.donorPhone || '',
      d.amount.toString(),
      d.currency,
      d.method,
      d.type,
      d.campaign || '',
      d.status,
      d.transactionId || '',
      d.mpesaReceipt || '',
      new Date(d.createdAt).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Success', description: 'CSV exported successfully' })
  }

  // Status badge
  const statusColor = (status: string) => {
    switch (status) {
      case 'successful':
      case 'verified':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'failed':
        return 'bg-red-100 text-red-700'
      case 'cancelled':
        return 'bg-gray-100 text-gray-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Campaign CRUD
  const handleCreateCampaign = async () => {
    setCampaignSaving(true)
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaignTitle,
          description: campaignDesc,
          goal: parseFloat(campaignGoal),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to create campaign', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Campaign created successfully' })
      setShowCampaignModal(false)
      resetCampaignForm()
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to create campaign', variant: 'destructive' })
    } finally {
      setCampaignSaving(false)
    }
  }

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return
    setCampaignSaving(true)
    try {
      const res = await fetch(`/api/admin/donations?id=${editingCampaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaignTitle,
          description: campaignDesc,
          goal: parseFloat(campaignGoal),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update campaign', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Campaign updated successfully' })
      setShowCampaignModal(false)
      setEditingCampaign(null)
      resetCampaignForm()
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to update campaign', variant: 'destructive' })
    } finally {
      setCampaignSaving(false)
    }
  }

  const handleToggleCampaignStatus = async (campaign: CampaignItem) => {
    const newStatus = campaign.status === 'active' ? 'completed' : 'active'
    try {
      const res = await fetch(`/api/admin/donations?id=${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to update campaign status', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: `Campaign marked as ${newStatus}` })
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to update campaign status', variant: 'destructive' })
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      const res = await fetch(`/api/admin/donations?id=${id}&type=campaign`, { method: 'DELETE' })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Campaign deleted' })
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete campaign', variant: 'destructive' })
    }
  }

  const openEditCampaign = (campaign: CampaignItem) => {
    setEditingCampaign(campaign)
    setCampaignTitle(campaign.title)
    setCampaignDesc(campaign.description)
    setCampaignGoal(campaign.goal.toString())
    setShowCampaignModal(true)
  }

  const resetCampaignForm = () => {
    setCampaignTitle('')
    setCampaignDesc('')
    setCampaignGoal('')
  }

  // Proof actions
  const handleProofAction = async (proofId: string, status: 'verified' | 'rejected') => {
    setProofActionLoading(true)
    try {
      const res = await fetch('/api/admin/payment-proofs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proofId, status, adminNotes: proofNotes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to update proof', variant: 'destructive' })
        return
      }
      toast({
        title: 'Success',
        description: `Proof ${status === 'verified' ? 'verified' : 'rejected'} successfully`,
      })
      setSelectedProof(null)
      setProofNotes('')
      fetchProofs()
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to update proof', variant: 'destructive' })
    } finally {
      setProofActionLoading(false)
    }
  }

  // Bank settings save
  const handleSaveSettings = async () => {
    setSettingsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            crdb_account_number: bankAccount,
            crdb_branch: bankBranch,
            crdb_swift: bankSwift,
          },
        }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Bank details saved successfully' })
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSettingsSaving(false)
    }
  }

  // Delete donation
  const handleDeleteDonation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donation?')) return
    try {
      const res = await fetch(`/api/admin/donations?id=${id}&type=donation`, { method: 'DELETE' })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to delete donation', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: 'Donation deleted' })
      setSelectedDonation(null)
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete donation', variant: 'destructive' })
    }
  }

  // Update donation status
  const handleUpdateDonationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/donations?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
        return
      }
      toast({ title: 'Success', description: `Donation status updated to ${status}` })
      fetchDonations()
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Donation Management</h2>
          <p className="text-gray-500 text-sm">Track and manage all donations, campaigns, and payment proofs</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Donations</p>
              <p className="text-lg font-bold text-[#0F2D5C]">TZS {totalDonations.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Donors</p>
              <p className="text-lg font-bold text-[#0F2D5C]">{totalDonors}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-[#ffdcc6] p-3 rounded-xl">
              <TrendingUp className="h-5 w-5 text-[#964900]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly Donations</p>
              <p className="text-lg font-bold text-[#0F2D5C]">TZS {monthlyDonations.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Campaign Performance</p>
              <p className="text-lg font-bold text-[#0F2D5C]">{avgCampaignPerf}% avg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="donations">
        <TabsList className="flex-wrap">
          <TabsTrigger value="donations" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Donations
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <Target className="h-3.5 w-3.5" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="proofs" className="gap-1.5">
            <FileCheck className="h-3.5 w-3.5" /> Payment Proofs
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search donor, email, txn ID..."
                className="w-full pl-10 pr-4 py-2 border-2 border-[#c5c6ce] rounded-lg text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
              />
            </div>
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="crdb">CRDB Bank</SelectItem>
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
            <Button onClick={handleExport} variant="outline" className="gap-2 ml-auto">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredDonations.length} of {donations.length} donations | Total:{' '}
            <span className="font-bold text-[#0F2D5C]">
              TZS {filteredDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
            </span>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#0F2D5C]">{d.donorName}</p>
                            <p className="text-xs text-gray-400">{d.donorEmail || d.donorPhone || '—'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#0F2D5C]">TZS {d.amount.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 ml-1">({d.type})</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {d.method === 'mpesa' ? (
                              <CreditCard className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Building2 className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            <span className="capitalize text-sm">
                              {d.method === 'mpesa' ? 'M-Pesa' : d.method === 'crdb' ? 'CRDB Bank' : 'Bank Transfer'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{d.campaign || '—'}</TableCell>
                        <TableCell><Badge className={statusColor(d.status)}>{d.status}</Badge></TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDonation(d)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDonations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                          No donations found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{campaigns.length} campaigns</p>
            <Button
              onClick={() => {
                resetCampaignForm()
                setEditingCampaign(null)
                setShowCampaignModal(true)
              }}
              className="gap-2 bg-[#ff8928] hover:bg-[#e07820] rounded-none"
            >
              <Plus className="h-4 w-4" /> Create Campaign
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => {
              const percent = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0
              return (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-[#0F2D5C] flex items-center justify-between">
                      <span className="truncate mr-2">{c.title}</span>
                      <Badge
                        variant={c.status === 'active' ? 'default' : 'secondary'}
                        className={c.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                      >
                        {c.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Raised: TZS {c.raised.toLocaleString()}</span>
                        <span className="font-medium text-[#0F2D5C]">Goal: TZS {c.goal.toLocaleString()}</span>
                      </div>
                      <Progress value={percent} className="h-2 [&>div]:bg-[#ff8928]" />
                      <p className="text-xs text-gray-400 text-right">{percent}% complete</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditCampaign(c)}
                        className="gap-1 text-xs"
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCampaignStatus(c)}
                        className="gap-1 text-xs"
                      >
                        {c.status === 'active' ? 'Complete' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(c.id)}
                        className="gap-1 text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {campaigns.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-400">
                <Target className="h-10 w-10 mx-auto mb-3" />
                <p>No campaigns yet. Create one to start raising funds.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Payment Proofs Tab */}
        <TabsContent value="proofs" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {proofs.filter((p) => p.status === 'pending').length} pending proofs
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proofs.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-[#0F2D5C]">{p.donorName}</TableCell>
                        <TableCell className="text-sm">{p.donorPhone}</TableCell>
                        <TableCell className="font-semibold text-[#0F2D5C]">
                          TZS {p.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#ff8928] text-sm underline"
                          >
                            View Receipt
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor(p.status)}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.status === 'pending' ? (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProof(p)
                                  setProofNotes('')
                                }}
                                className="text-green-600 hover:text-green-700"
                                title="Verify"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProof(p)
                                  setProofNotes('')
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProof(p)
                                setProofNotes(p.adminNotes || '')
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {proofs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                          No payment proofs submitted yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#0F2D5C] flex items-center gap-2">
                <Building2 className="h-4 w-4" /> CRDB Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Organization bank account details for internal reference.
              </p>

              <div>
                <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">Account Number</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-mono focus:outline-none focus:border-[#ff8928] transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">Branch</label>
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">SWIFT Code</label>
                <input
                  type="text"
                  value={bankSwift}
                  onChange={(e) => setBankSwift(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-mono focus:outline-none focus:border-[#ff8928] transition-colors"
                />
              </div>

              <Button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="gap-2 bg-[#ff8928] hover:bg-[#e07820] rounded-none"
              >
                {settingsSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Bank Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Donation Detail Modal */}
      <Dialog open={!!selectedDonation} onOpenChange={(open) => !open && setSelectedDonation(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0F2D5C]">Donation Details</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 block">Donor Name</span>
                  <span className="font-semibold text-[#0F2D5C]">{selectedDonation.donorName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="font-semibold text-[#0F2D5C]">{selectedDonation.donorEmail || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="font-semibold text-[#0F2D5C]">{selectedDonation.donorPhone || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Amount</span>
                  <span className="font-semibold text-[#0F2D5C]">TZS {selectedDonation.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Method</span>
                  <span className="font-semibold text-[#0F2D5C] capitalize">
                    {selectedDonation.method === 'mpesa' ? 'M-Pesa' : selectedDonation.method === 'crdb' ? 'CRDB Bank' : 'Bank Transfer'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Type</span>
                  <span className="font-semibold text-[#0F2D5C] capitalize">{selectedDonation.type}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Campaign</span>
                  <span className="font-semibold text-[#0F2D5C]">{selectedDonation.campaign || 'General'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <Badge className={statusColor(selectedDonation.status)}>{selectedDonation.status}</Badge>
                </div>
                {selectedDonation.transactionId && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Transaction ID</span>
                    <span className="font-mono text-sm font-semibold text-[#0F2D5C]">
                      {selectedDonation.transactionId}
                    </span>
                  </div>
                )}
                {selectedDonation.mpesaReceipt && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block">M-Pesa Receipt</span>
                    <span className="font-mono text-sm font-semibold text-[#0F2D5C]">
                      {selectedDonation.mpesaReceipt}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 block">Date</span>
                  <span className="font-semibold text-[#0F2D5C]">
                    {new Date(selectedDonation.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status update */}
              <div className="border-t pt-4 space-y-3">
                <label className="text-sm font-semibold text-[#0F2D5C]">Update Status</label>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'processing', 'successful', 'failed', 'cancelled'].map((s) => (
                    <Button
                      key={s}
                      variant={selectedDonation.status === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateDonationStatus(selectedDonation.id, s)}
                      className={`rounded-none text-xs ${selectedDonation.status === s ? 'bg-[#031632]' : ''}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <DialogFooter className="flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = `/api/donate/receipt?donationId=${selectedDonation.id}`
                    a.download = `receipt-${selectedDonation.transactionId || selectedDonation.id}.txt`
                    a.click()
                  }}
                  className="gap-1 rounded-none"
                >
                  <Download className="h-3.5 w-3.5" /> Download Receipt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDonation(selectedDonation.id)}
                  className="gap-1 text-red-500 hover:text-red-700 rounded-none"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Campaign Create/Edit Modal */}
      <Dialog open={showCampaignModal} onOpenChange={(open) => {
        if (!open) {
          setShowCampaignModal(false)
          setEditingCampaign(null)
          resetCampaignForm()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0F2D5C]">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">Campaign Title</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors"
                placeholder="e.g. School Feeding Program"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">Description</label>
              <textarea
                value={campaignDesc}
                onChange={(e) => setCampaignDesc(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors min-h-[100px] resize-y"
                placeholder="Describe the campaign and its goals..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">Goal Amount (TZS)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#44474d] font-semibold text-sm">TSh</span>
                <input
                  type="number"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm font-semibold focus:outline-none focus:border-[#ff8928] transition-colors"
                  placeholder="10000000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCampaignModal(false)
                setEditingCampaign(null)
                resetCampaignForm()
              }}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
              disabled={campaignSaving}
              className="gap-2 bg-[#ff8928] hover:bg-[#e07820] rounded-none"
            >
              {campaignSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Proof Detail/Action Modal */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => {
        if (!open) {
          setSelectedProof(null)
          setProofNotes('')
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0F2D5C]">Payment Proof Details</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 block">Donor Name</span>
                  <span className="font-semibold text-[#0F2D5C]">{selectedProof.donorName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="font-semibold text-[#0F2D5C]">{selectedProof.donorPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Amount</span>
                  <span className="font-semibold text-[#0F2D5C]">TZS {selectedProof.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <Badge className={statusColor(selectedProof.status)}>{selectedProof.status}</Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block">Date</span>
                  <span className="font-semibold text-[#0F2D5C]">
                    {new Date(selectedProof.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Receipt preview */}
              <div>
                <span className="text-gray-500 block text-sm mb-2">Receipt</span>
                <a
                  href={selectedProof.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  {selectedProof.receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={selectedProof.receiptUrl}
                      alt="Payment receipt"
                      className="max-h-48 rounded-lg border"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                      <FileCheck className="h-5 w-5 text-[#ff8928]" />
                      <span className="text-sm text-[#0F2D5C]">View Receipt File</span>
                    </div>
                  )}
                </a>
              </div>

              {/* Admin notes */}
              {selectedProof.adminNotes && (
                <div>
                  <span className="text-gray-500 block text-sm">Admin Notes</span>
                  <p className="text-sm text-[#0F2D5C]">{selectedProof.adminNotes}</p>
                </div>
              )}

              {/* Actions for pending proofs */}
              {selectedProof.status === 'pending' && (
                <div className="space-y-3 border-t pt-4">
                  <div>
                    <label className="text-sm font-semibold text-[#0F2D5C] mb-1.5 block">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#c5c6ce] rounded-xl text-[#031632] text-sm focus:outline-none focus:border-[#ff8928] transition-colors min-h-[80px] resize-y"
                      placeholder="Add notes about this proof..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleProofAction(selectedProof.id, 'verified')}
                      disabled={proofActionLoading}
                      className="gap-2 bg-green-600 hover:bg-green-700 rounded-none flex-1"
                    >
                      {proofActionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Verify
                    </Button>
                    <Button
                      onClick={() => handleProofAction(selectedProof.id, 'rejected')}
                      disabled={proofActionLoading}
                      variant="destructive"
                      className="gap-2 rounded-none flex-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
