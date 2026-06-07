'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Search, ImagePlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { adminFetch } from '@/lib/admin-api'
import ImageUpload from '@/components/admin/ImageUpload'

interface GalleryItem {
  id: string
  url: string
  title: string | null
  category: string
  description: string | null
  createdAt: string
}

const categories = ['all', 'programs', 'events', 'community', 'stories']

const emptyForm = { url: '', title: '', category: 'programs', description: '' }

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const { toast } = useToast()

  const fetchImages = async () => {
    try {
      const res = await adminFetch('/api/admin/gallery')
      if (res.ok) setImages(await res.json())
    } catch {
      toast({ title: 'Error', description: 'Failed to load gallery', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchImages() }, [])

  const handleSubmit = async () => {
    if (!form.url) {
      toast({ title: 'Error', description: 'Image URL is required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body = { ...form, title: form.title || null, description: form.description || null }
      const res = await adminFetch('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Image added' })
        setDialogOpen(false)
        setForm(emptyForm)
        fetchImages()
      } else {
        throw new Error('Failed')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add image', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    try {
      const res = await adminFetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Success', description: 'Image deleted' })
        fetchImages()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete image', variant: 'destructive' })
    }
  }

  const filtered = filter === 'all' ? images : images.filter((img) => img.category === filter)

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-lg" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Gallery Management</h2>
          <p className="text-gray-500 text-sm">Manage your website gallery images</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange hover:bg-orange-dark text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#0F2D5C]">Add Gallery Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <ImageUpload
                value={form.url}
                onChange={(url) => setForm({ ...form, url })}
                subfolder="gallery"
                label="Image"
                placeholder="https://example.com/image.jpg"
              />
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Image title" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programs">Programs</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="stories">Stories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Image description" />
              </div>
              <Button onClick={handleSubmit} disabled={saving} className="w-full bg-orange hover:bg-orange-dark text-white">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
                Add Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-4 w-4 text-gray-400" />
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            className={filter === cat ? 'bg-orange hover:bg-orange-dark text-white' : ''}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((img) => (
          <Card key={img.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative bg-gray-100">
              <img
                src={img.url}
                alt={img.title || 'Gallery image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpeg'
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(img.id)}
                  className="h-10 w-10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
              <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
                {img.category}
              </Badge>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium text-[#0F2D5C] truncate">{img.title || 'Untitled'}</p>
              <p className="text-xs text-gray-400 truncate">{img.description || 'No description'}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">No images found in this category</div>
        )}
      </div>
    </div>
  )
}
