'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import { adminFetch } from '@/lib/admin-api'
import ImageUpload from '@/components/admin/ImageUpload'

interface BlogPostItem {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image: string | null
  author: string | null
  published: boolean
  createdAt: string
}

const emptyForm = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  image: '',
  author: 'Admin',
  published: false,
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchPosts = async () => {
    try {
      const res = await adminFetch('/api/admin/blog')
      if (res.ok) setPosts(await res.json())
    } catch {
      toast({ title: 'Error', description: 'Failed to load blog posts', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        content: form.content,
        excerpt: form.excerpt || null,
        image: form.image || null,
        author: form.author || 'Admin',
        published: form.published,
      }
      const url = editingId ? `/api/admin/blog?id=${editingId}` : '/api/admin/blog'
      const method = editingId ? 'PUT' : 'POST'
      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast({ title: 'Success', description: editingId ? 'Post updated' : 'Post created' })
        setDialogOpen(false)
        setForm(emptyForm)
        setEditingId(null)
        fetchPosts()
      } else {
        const error = await res.json()
        throw new Error(error.error || 'Failed')
      }
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to save post', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (post: BlogPostItem) => {
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      image: post.image || '',
      author: post.author || 'Admin',
      published: post.published,
    })
    setEditingId(post.id)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await adminFetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Success', description: 'Post deleted' })
        fetchPosts()
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Blog Management</h2>
          <p className="text-gray-500 text-sm">Create and manage blog posts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) { setForm(emptyForm); setEditingId(null) }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange hover:bg-orange-dark text-white">
              <Plus className="h-4 w-4 mr-2" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#0F2D5C]">{editingId ? 'Edit Post' : 'Create Post'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  placeholder="Post title"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="post-url-slug"
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Brief description of the post"
                  rows={2}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={10}
                />
              </div>
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                subfolder="blog"
                label="Featured Image"
                placeholder="https://example.com/blog-image.jpg"
              />
              <div>
                <Label>Author</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.published}
                  onCheckedChange={(checked) => setForm({ ...form, published: checked })}
                />
                <Label>Publish immediately</Label>
              </div>
              <Button onClick={handleSubmit} disabled={saving} className="w-full bg-orange hover:bg-orange-dark text-white">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingId ? 'Update Post' : 'Create Post'}
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
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange flex-shrink-0" />
                        <div>
                          <p className="font-medium text-[#0F2D5C]">{post.title}</p>
                          <p className="text-xs text-gray-400">/{post.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{post.author || '—'}</TableCell>
                    <TableCell>
                      <Badge className={post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {posts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-400">No blog posts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
