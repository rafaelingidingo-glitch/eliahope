'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface ChildItem {
  id: string
  name: string
  age: number | null
  gender: string | null
  story: string | null
  photo: string | null
  status: string
  program: string | null
  createdAt: string
}

interface SponsorItem {
  id: string
  name: string
  email: string
  phone: string | null
  childId: string | null
  amount: number
  frequency: string
  status: string
  startDate: string
  child?: { name: string } | null
}

const emptyChildForm = { name: '', age: '', gender: 'male', story: '', photo: '', status: 'available', program: '' }
const emptySponsorForm = { name: '', email: '', phone: '', childId: '', amount: '', frequency: 'monthly', status: 'active' }

export default function SponsorChildModule() {
  const [children, setChildren] = useState<ChildItem[]>([])
  const [sponsors, setSponsors] = useState<SponsorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [childDialogOpen, setChildDialogOpen] = useState(false)
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false)
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null)
  const [childForm, setChildForm] = useState(emptyChildForm)
  const [sponsorForm, setSponsorForm] = useState(emptySponsorForm)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [childrenRes, sponsorsRes] = await Promise.all([
        fetch('/api/admin/children'),
        fetch('/api/admin/sponsors'),
      ])
      if (childrenRes.ok) setChildren(await childrenRes.json())
      if (sponsorsRes.ok) setSponsors(await sponsorsRes.json())
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleChildSubmit = async () => {
    setSaving(true)
    try {
      const body = {
        name: childForm.name,
        age: childForm.age ? parseInt(childForm.age) : null,
        gender: childForm.gender,
        story: childForm.story || null,
        photo: childForm.photo || null,
        status: childForm.status,
        program: childForm.program || null,
      }
      const url = editingChildId ? `/api/admin/children?id=${editingChildId}` : '/api/admin/children'
      const method = editingChildId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: 'Success', description: editingChildId ? 'Child updated' : 'Child added' })
        setChildDialogOpen(false)
        setChildForm(emptyChildForm)
        setEditingChildId(null)
        fetchData()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save child', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleSponsorSubmit = async () => {
    setSaving(true)
    try {
      const body = {
        name: sponsorForm.name,
        email: sponsorForm.email,
        phone: sponsorForm.phone || null,
        childId: sponsorForm.childId || null,
        amount: parseFloat(sponsorForm.amount),
        frequency: sponsorForm.frequency,
        status: sponsorForm.status,
      }
      const url = editingSponsorId ? `/api/admin/sponsors?id=${editingSponsorId}` : '/api/admin/sponsors'
      const method = editingSponsorId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: 'Success', description: editingSponsorId ? 'Sponsor updated' : 'Sponsor added' })
        setSponsorDialogOpen(false)
        setSponsorForm(emptySponsorForm)
        setEditingSponsorId(null)
        fetchData()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save sponsor', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteChild = async (id: string) => {
    if (!confirm('Are you sure you want to delete this child?')) return
    try {
      const res = await fetch(`/api/admin/children?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: 'Success', description: 'Child deleted' }); fetchData() }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleDeleteSponsor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return
    try {
      const res = await fetch(`/api/admin/sponsors?id=${id}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: 'Success', description: 'Sponsor deleted' }); fetchData() }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const childStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700'
      case 'sponsored': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F2D5C]">Sponsor a Child</h2>
        <p className="text-gray-500 text-sm">Manage children profiles and sponsorships</p>
      </div>

      <Tabs defaultValue="children">
        <TabsList>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={childDialogOpen} onOpenChange={(open) => {
              setChildDialogOpen(open)
              if (!open) { setChildForm(emptyChildForm); setEditingChildId(null) }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-orange hover:bg-orange-dark text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-[#0F2D5C]">{editingChildId ? 'Edit Child' : 'Add Child'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name</Label><Input value={childForm.name} onChange={(e) => setChildForm({ ...childForm, name: e.target.value })} /></div>
                    <div><Label>Age</Label><Input type="number" value={childForm.age} onChange={(e) => setChildForm({ ...childForm, age: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Gender</Label>
                      <Select value={childForm.gender} onValueChange={(v) => setChildForm({ ...childForm, gender: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Status</Label>
                      <Select value={childForm.status} onValueChange={(v) => setChildForm({ ...childForm, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="sponsored">Sponsored</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Program</Label><Input value={childForm.program} onChange={(e) => setChildForm({ ...childForm, program: e.target.value })} /></div>
                  <div><Label>Photo URL</Label><Input value={childForm.photo} onChange={(e) => setChildForm({ ...childForm, photo: e.target.value })} /></div>
                  <div><Label>Story</Label><Textarea value={childForm.story} onChange={(e) => setChildForm({ ...childForm, story: e.target.value })} rows={3} /></div>
                  <Button onClick={handleChildSubmit} disabled={saving} className="w-full bg-orange hover:bg-orange-dark text-white">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {editingChildId ? 'Update Child' : 'Add Child'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-orange/10 text-orange text-lg">
                        {child.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#0F2D5C] truncate">{child.name}</h3>
                        <Badge className={childStatusColor(child.status)}>{child.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Age: {child.age || '—'} • {child.gender || '—'}</p>
                      {child.program && <p className="text-xs text-orange">{child.program}</p>}
                      {child.story && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{child.story}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setChildForm({
                        name: child.name,
                        age: child.age?.toString() || '',
                        gender: child.gender || 'male',
                        story: child.story || '',
                        photo: child.photo || '',
                        status: child.status,
                        program: child.program || '',
                      })
                      setEditingChildId(child.id)
                      setChildDialogOpen(true)
                    }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteChild(child.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={sponsorDialogOpen} onOpenChange={(open) => {
              setSponsorDialogOpen(open)
              if (!open) { setSponsorForm(emptySponsorForm); setEditingSponsorId(null) }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-orange hover:bg-orange-dark text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add Sponsor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-[#0F2D5C]">{editingSponsorId ? 'Edit Sponsor' : 'Add Sponsor'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Name</Label><Input value={sponsorForm.name} onChange={(e) => setSponsorForm({ ...sponsorForm, name: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Email</Label><Input value={sponsorForm.email} onChange={(e) => setSponsorForm({ ...sponsorForm, email: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input value={sponsorForm.phone} onChange={(e) => setSponsorForm({ ...sponsorForm, phone: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Amount (TZS)</Label><Input type="number" value={sponsorForm.amount} onChange={(e) => setSponsorForm({ ...sponsorForm, amount: e.target.value })} /></div>
                    <div><Label>Frequency</Label>
                      <Select value={sponsorForm.frequency} onValueChange={(v) => setSponsorForm({ ...sponsorForm, frequency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Assign to Child</Label>
                    <Select value={sponsorForm.childId} onValueChange={(v) => setSponsorForm({ ...sponsorForm, childId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select child (optional)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No child assigned</SelectItem>
                        {children.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSponsorSubmit} disabled={saving} className="w-full bg-orange hover:bg-orange-dark text-white">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    {editingSponsorId ? 'Update Sponsor' : 'Add Sponsor'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Child</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsors.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-orange" />
                            <div>
                              <p className="font-medium text-[#0F2D5C]">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{s.child?.name || '—'}</TableCell>
                        <TableCell className="font-semibold">TZS {s.amount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{s.frequency}</TableCell>
                        <TableCell>
                          <Badge className={s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              setSponsorForm({
                                name: s.name,
                                email: s.email,
                                phone: s.phone || '',
                                childId: s.childId || '',
                                amount: s.amount.toString(),
                                frequency: s.frequency,
                                status: s.status,
                              })
                              setEditingSponsorId(s.id)
                              setSponsorDialogOpen(true)
                            }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteSponsor(s.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {sponsors.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No sponsors found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
