'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import { saveEditorSpotlight } from './actions'

interface Props {
  existingRecord: any | null
  pocketbaseUrl: string
}

export default function EditorSpotlightForm({ existingRecord, pocketbaseUrl }: Props) {
  const [shortDescription, setShortDescription] = useState<string>(
    existingRecord?.short_description || ''
  )
  const [fullDescription, setFullDescription] = useState<string>(
    existingRecord?.full_description || ''
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const formData = new FormData(e.currentTarget)
      formData.set('short_description', shortDescription)
      formData.set('full_description', fullDescription)
      await saveEditorSpotlight(formData)
      setSaved(true)
      toast.success('Spotlight saved successfully.')
    } catch (err) {
      toast.error('Failed to save spotlight. Please try again.')
      console.error('[EditorSpotlightForm] save error:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
      <input type="hidden" name="id" value={existingRecord?.id || ''} />

      {/* Name & Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="uppercase tracking-widest text-xs text-primary/60" htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="e.g., maria_torres"
            defaultValue={existingRecord?.name || ''}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="uppercase tracking-widest text-xs text-primary/60" htmlFor="title">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Spotlight Title"
            defaultValue={existingRecord?.title || ''}
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label className="uppercase tracking-widest text-xs text-primary/60">
          Short Description
        </Label>
        <RichTextEditor
          value={shortDescription}
          onChange={(v) => setShortDescription(v)}
          placeholder="A brief summary..."
          minRows={4}
        />
      </div>

      {/* Full Description */}
      <div className="space-y-2">
        <Label className="uppercase tracking-widest text-xs text-primary/60">
          Full Description
        </Label>
        <RichTextEditor
          value={fullDescription}
          onChange={(v) => setFullDescription(v)}
          placeholder="Rich content..."
          minRows={12}
        />
      </div>

      {/* Layout Selector */}
      <div className="space-y-2">
        <Label
          className="uppercase tracking-widest text-xs text-primary/60"
          htmlFor="layout"
        >
          Layout
        </Label>
        <select
          id="layout"
          name="layout"
          defaultValue={existingRecord?.layout || 'default'}
          className="h-12 rounded-xl border border-border bg-background px-3 w-full"
        >
          <option value="default">Standard Narrative</option>
          <option value="hero_top">Hero Image Focus</option>
          <option value="gallery_grid">Gallery Showcase</option>
        </select>
        <p className="text-xs text-muted-foreground">
          The full description renders as a full page using the chosen layout.
        </p>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label
          className="uppercase tracking-widest text-xs text-primary/60"
          htmlFor="is_active"
        >
          Status
        </Label>
        <select
          id="is_active"
          name="is_active"
          defaultValue={existingRecord?.is_active ? 'true' : 'false'}
          className="h-12 rounded-xl border border-border bg-background px-3 w-full"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Main Image Upload */}
      <div className="space-y-2">
        <Label
          className="uppercase tracking-widest text-xs text-primary/60"
          htmlFor="image"
        >
          Main Image
        </Label>
        {existingRecord?.image && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${pocketbaseUrl}/api/files/${existingRecord.collectionId}/${existingRecord.id}/${existingRecord.image}`}
              alt="Current Main"
              className="h-20 w-auto rounded-lg border"
            />
          </div>
        )}
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="h-12 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>

      {/* Gallery Images Upload */}
      <div className="space-y-2">
        <Label className="uppercase tracking-widest text-xs text-primary/60">
          Gallery Images (Max 10)
        </Label>
        {existingRecord?.images && existingRecord.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingRecord.images.map((img: string, idx: number) => (
              <div key={idx}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${pocketbaseUrl}/api/files/${existingRecord.collectionId}/${existingRecord.id}/${img}`}
                  alt={`Gallery ${idx}`}
                  className="h-20 w-20 rounded-lg object-cover border shadow-sm"
                />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-1">
          First gallery image is used as the hero; the rest form the gallery.
        </p>
        <Input
          type="file"
          name="images"
          multiple
          accept="image/*"
          className="h-12 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>

      <Button type="submit" size="lg" disabled={saving} className="h-12 rounded-xl font-bold w-full">
        <Save className="mr-2 h-4 w-4" />
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Spotlight'}
      </Button>
    </form>
  )
}
