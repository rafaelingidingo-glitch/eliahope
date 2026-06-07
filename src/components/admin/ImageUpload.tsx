'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Link, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { adminFetch } from '@/lib/admin-api'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  subfolder?: string
  label?: string
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  subfolder = 'images',
  label = 'Image',
  placeholder = 'https://example.com/image.jpg',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) return

      // Client-side validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPEG, PNG, GIF, WebP, or SVG image',
          variant: 'destructive',
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 10MB',
          variant: 'destructive',
        })
        return
      }

      setUploading(true)

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('subfolder', subfolder)

        const res = await adminFetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (res.ok && data.url) {
          onChange(data.url)
          setPreview(data.url)
          toast({ title: 'Image uploaded', description: 'Image uploaded successfully' })
        } else {
          // Revert preview on error
          setPreview(value || null)
          toast({
            title: 'Upload failed',
            description: data.error || 'Failed to upload image',
            variant: 'destructive',
          })
        }
      } catch {
        setPreview(value || null)
        toast({
          title: 'Upload failed',
          description: 'Network error. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setUploading(false)
        // Clean up the object URL
        URL.revokeObjectURL(localPreview)
      }
    },
    [subfolder, onChange, toast, value]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const handleUrlChange = (url: string) => {
    onChange(url)
    setPreview(url)
  }

  const clearImage = () => {
    onChange('')
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <Tabs defaultValue={value && !value.startsWith('/uploads/') ? 'url' : 'upload'} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="upload" className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" /> Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5 text-xs">
            <Link className="h-3.5 w-3.5" /> Image URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
              transition-all duration-200
              ${dragActive ? 'border-orange bg-orange/5 scale-[1.02]' : 'border-gray-300 hover:border-orange/50 hover:bg-gray-50'}
              ${uploading ? 'pointer-events-none opacity-60' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-orange animate-spin" />
                <p className="text-sm text-gray-500">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-orange/10 p-3 rounded-full">
                  <ImageIcon className="h-6 w-6 text-orange" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F2D5C]">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, GIF, WebP, SVG (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <div className="flex gap-2">
            <Input
              value={value && !value.startsWith('/uploads/') ? value : ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            {value && !value.startsWith('/uploads/') && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearImage}
                className="h-10 w-10 shrink-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Paste a direct link to an image from the web</p>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {(preview || value) && (
        <div className="relative group mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={preview || value}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.jpeg'
            }}
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-orange animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
