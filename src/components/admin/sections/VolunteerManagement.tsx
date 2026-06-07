'use client'

import { useState, useEffect } from 'react'
import { Check, X, Eye, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast'

interface VolunteerItem {
  id: string
  name: string
  email: string
  phone: string | null
  skills: string | null
  motivation: string | null
  status: string
  programId: string | null
  createdAt: string
}

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchVolunteers = async () => {
    try {
      const res = await fetch('/api/admin/volunteers')
      if (res.ok) setVolunteers(await res.json())
    } catch {
      toast({ title: 'Error', description: 'Failed to load volunteers', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVolunteers() }, [])

  const handleStatusUpdate = async (id: string, status: string, programId?: string) => {
    setUpdating(id)
    try {
      const body: Record<string, string> = { status }
      if (programId) body.programId = programId
      const res = await fetch(`/api/admin/volunteers?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: 'Success', description: `Volunteer ${status}` })
        fetchVolunteers()
      } else {
        throw new Error('Failed')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update volunteer', variant: 'destructive' })
    } finally {
      setUpdating(null)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F2D5C]">Volunteer Management</h2>
        <p className="text-gray-500 text-sm">Review and manage volunteer applications</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteers.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#0F2D5C]">{v.name}</p>
                        <p className="text-xs text-gray-400">{v.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {v.skills ? v.skills.split(',').map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill.trim()}</Badge>
                        )) : <span className="text-gray-400 text-sm">—</span>}
                      </div>
                    </TableCell>
                    <TableCell><Badge className={statusColor(v.status)}>{v.status}</Badge></TableCell>
                    <TableCell className="text-gray-500 text-sm">{new Date(v.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedVolunteer(v); setDetailOpen(true) }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {v.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700"
                              disabled={updating === v.id}
                              onClick={() => handleStatusUpdate(v.id, 'approved')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              disabled={updating === v.id}
                              onClick={() => handleStatusUpdate(v.id, 'rejected')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {v.status === 'approved' && !v.programId && (
                          <Select onValueChange={(val) => handleStatusUpdate(v.id, 'approved', val)}>
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue placeholder="Assign Program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="feeding">Feeding</SelectItem>
                              <SelectItem value="bible-study">Bible Study</SelectItem>
                              <SelectItem value="community">Community</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {volunteers.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No volunteers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#0F2D5C]">Volunteer Details</DialogTitle>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-400">Name</p><p className="font-medium">{selectedVolunteer.name}</p></div>
                <div><p className="text-xs text-gray-400">Email</p><p className="font-medium">{selectedVolunteer.email}</p></div>
                <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium">{selectedVolunteer.phone || '—'}</p></div>
                <div><p className="text-xs text-gray-400">Status</p><Badge className={statusColor(selectedVolunteer.status)}>{selectedVolunteer.status}</Badge></div>
              </div>
              <div><p className="text-xs text-gray-400">Skills</p><p className="font-medium">{selectedVolunteer.skills || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Motivation</p><p className="text-sm text-gray-700">{selectedVolunteer.motivation || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Applied</p><p className="text-sm">{new Date(selectedVolunteer.createdAt).toLocaleDateString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
