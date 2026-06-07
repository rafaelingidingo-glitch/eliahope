'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

interface SiteSetting {
  id: string
  key: string
  value: string
  updatedAt: string
}

const contentSections = [
  { key: 'hero_title', label: 'Hero Title', type: 'text' },
  { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
  { key: 'about_title', label: 'About Title', type: 'text' },
  { key: 'about_content', label: 'About Content', type: 'textarea' },
  { key: 'mission', label: 'Mission', type: 'textarea' },
  { key: 'vision', label: 'Vision', type: 'textarea' },
  { key: 'core_values', label: 'Core Values (comma-separated)', type: 'text' },
  { key: 'contact_email', label: 'Contact Email', type: 'text' },
  { key: 'contact_phone', label: 'Contact Phone', type: 'text' },
  { key: 'contact_address', label: 'Contact Address', type: 'text' },
  { key: 'footer_text', label: 'Footer Text', type: 'text' },
]

const tabs = [
  { value: 'hero', label: 'Hero', keys: ['hero_title', 'hero_subtitle'] },
  { value: 'about', label: 'About', keys: ['about_title', 'about_content'] },
  { value: 'mission', label: 'Mission & Vision', keys: ['mission', 'vision'] },
  { value: 'values', label: 'Core Values', keys: ['core_values'] },
  { value: 'contact', label: 'Contact', keys: ['contact_email', 'contact_phone', 'contact_address'] },
  { value: 'footer', label: 'Footer', keys: ['footer_text'] },
]

export default function ContentManagement() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data: SiteSetting[] = await res.json()
          const map: Record<string, string> = {}
          data.forEach((s) => { map[s.key] = s.value })
          setSettings(map)
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Settings saved successfully' })
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F2D5C]">Content Management</h2>
          <p className="text-gray-500 text-sm">Edit your website content sections</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange hover:bg-orange-dark text-white">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="hero">
        <TabsList className="flex-wrap h-auto gap-1 bg-white p-1 border">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0F2D5C]">{tab.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tab.keys.map((key) => {
                  const section = contentSections.find((s) => s.key === key)
                  if (!section) return null
                  return (
                    <div key={key}>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{section.label}</label>
                      {section.type === 'textarea' ? (
                        <Textarea
                          value={settings[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      ) : (
                        <Input
                          value={settings[key] || ''}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
