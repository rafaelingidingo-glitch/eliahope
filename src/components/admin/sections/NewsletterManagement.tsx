'use client'

import { useState, useEffect } from 'react'
import { Download, Send, Loader2, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { adminFetch } from '@/lib/admin-api'

interface SubscriberItem {
  id: string
  name: string
  email: string
  status: string
  createdAt: string
}

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [emailForm, setEmailForm] = useState({ to: 'all', subject: '', body: '' })
  const { toast } = useToast()

  const fetchSubscribers = async () => {
    try {
      const res = await adminFetch('/api/admin/newsletter')
      if (res.ok) setSubscribers(await res.json())
    } catch {
      toast({ title: 'Error', description: 'Failed to load subscribers', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubscribers() }, [])

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Status', 'Date Joined']
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`
    const rows = subscribers.map((s) => [escapeCsv(s.name), escapeCsv(s.email), escapeCsv(s.status), new Date(s.createdAt).toLocaleDateString()])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Success', description: 'Subscribers exported' })
  }

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.body) {
      toast({ title: 'Error', description: 'Subject and body are required', variant: 'destructive' })
      return
    }
    setSending(true)
    try {
      const res = await adminFetch('/api/admin/newsletter', {
        method: 'POST',
        body: JSON.stringify(emailForm),
      })
      if (res.ok) {
        const data = await res.json()
        toast({ title: 'Success', description: data.message || 'Newsletter sent successfully' })
        setEmailForm({ to: 'all', subject: '', body: '' })
      } else {
        throw new Error('Failed')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to send newsletter', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return
    try {
      const res = await adminFetch(`/api/admin/newsletter?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Success', description: 'Subscriber removed' })
        fetchSubscribers()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to remove subscriber', variant: 'destructive' })
    }
  }

  const activeCount = subscribers.filter((s) => s.status === 'active').length
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Newsletter Management</h2>
          <p className="text-gray-500 text-sm">Manage subscribers and send newsletters</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Subscribers
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-[#0F2D5C]">{subscribers.length}</p>
            <p className="text-xs text-gray-500">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{unsubscribedCount}</p>
            <p className="text-xs text-gray-500">Unsubscribed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium text-[#0F2D5C]">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-orange" />
                            {s.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">{s.email}</TableCell>
                        <TableCell>
                          <Badge className={s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteSubscriber(s.id)}>
                            ×
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {subscribers.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No subscribers found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0F2D5C]">Compose Newsletter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Send To</Label>
                <Input value="All active subscribers" disabled />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Newsletter subject"
                />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                  placeholder="Write your newsletter content here..."
                  rows={8}
                />
              </div>
              <Button onClick={handleSendEmail} disabled={sending} className="bg-orange hover:bg-orange-dark text-white">
                {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Newsletter
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
