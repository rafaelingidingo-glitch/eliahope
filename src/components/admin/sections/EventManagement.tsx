'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, CalendarDays, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface EventItem {
  id: string
  title: string
  description: string
  date: string
  location: string
  image: string | null
  status: string
  createdAt: string
}

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  image: '',
  status: 'upcoming',
}

export default function EventManagement() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load events', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEvents() }, [])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const body = { ...form, image: form.image || null }
      const url = editingId ? `/api/admin/events?id=${editingId}` : '/api/admin/events'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: 'Success', description: editingId ? 'Event updated' : 'Event created' })
        setDialogOpen(false)
        setForm(emptyForm)
        setEditingId(null)
        fetchEvents()
      } else {
        throw new Error('Failed')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save event', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (event: EventItem) => {
    setForm({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      location: event.location,
      image: event.image || '',
      status: event.status,
    })
    setEditingId(event.id)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Success', description: 'Event deleted' })
        fetchEvents()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' })
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'ongoing': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Event Management</h2>
          <p className="text-gray-500 text-sm">Manage your community events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) { setForm(emptyForm); setEditingId(null) }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange hover:bg-orange-dark text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#0F2D5C]">{editingId ? 'Edit Event' : 'Add Event'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Event description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Event location" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <Button onClick={handleSubmit} disabled={saving} className="w-full bg-orange hover:bg-orange-dark text-white">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingId ? 'Update Event' : 'Create Event'}
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
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-orange" />
                        {event.title}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(event.status)}>{event.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">No events found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
