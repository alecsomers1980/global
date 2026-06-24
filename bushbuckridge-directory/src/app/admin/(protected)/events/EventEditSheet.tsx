'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { saveEvent } from './actions'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'
import ImageUploadField from '@/components/ImageUploadField'

interface Props {
  open: boolean
  onClose: () => void
  event?: any // if provided, edit mode; else create mode
}

export default function EventEditSheet({ open, onClose, event }: Props) {
  const isEdit = !!event
  const [saving, setSaving] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [keptImage, setKeptImage] = useState<string | null>(null)
  const [keptGallery, setKeptGallery] = useState<string[]>([])

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
  const fileUrl = (f: string) => event ? `${pbUrl}/api/files/${event.collectionId}/${event.id}/${f}` : ''

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    cost: '',
    contact_info: '',
    is_featured: false,
  })

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? event.date.slice(0, 10) : '',
        time: event.time || '',
        venue: event.venue || '',
        cost: event.cost || '',
        contact_info: event.contact_info || '',
        is_featured: event.is_featured || false,
      })
      setKeptImage(event.image || null)
      setKeptGallery(Array.isArray(event.gallery) ? event.gallery : event.gallery ? [event.gallery] : [])
    } else {
      setForm({ title: '', description: '', date: '', time: '', venue: '', cost: '', contact_info: '', is_featured: false })
      setKeptImage(null)
      setKeptGallery([])
    }
    setImageFiles([])
    setGalleryFiles([])
  }, [event, open])

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.title || !form.date) {
      toast.error('Title and Date are required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, typeof v === 'boolean' ? (v ? 'true' : 'false') : (v ?? '')))
      if (imageFiles[0]) fd.append('image', imageFiles[0])
      else if (!keptImage && event?.image) fd.append('image', '')
      galleryFiles.forEach((f) => fd.append('gallery', f))
      const originalGallery: string[] = event
        ? (Array.isArray(event.gallery) ? event.gallery : event.gallery ? [event.gallery] : [])
        : []
      originalGallery.filter((f) => !keptGallery.includes(f)).forEach((f) => fd.append('gallery-', f))

      await saveEvent(isEdit ? event.id : null, fd)
      toast.success(isEdit ? 'Event updated' : 'Event created')
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto px-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-primary">
            {isEdit ? 'Edit Event' : 'Add Event'}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {isEdit ? 'Update the event details below.' : 'Fill in the details for the new event.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Title *</Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Date *</Label>
            <Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Time</Label>
              <Input value={form.time} onChange={(e) => update('time', e.target.value)} placeholder="e.g. 14:00" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Cost</Label>
              <Input value={form.cost} onChange={(e) => update('cost', e.target.value)} placeholder="Free or R50" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Venue</Label>
            <Input value={form.venue} onChange={(e) => update('venue', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Contact Info</Label>
            <Input value={form.contact_info} onChange={(e) => update('contact_info', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</Label>
            <RichTextEditor
              value={form.description}
              onChange={(v) => update('description', v)}
              placeholder="Event description..."
              minRows={5}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm font-bold text-primary">Featured Event</Label>
            <Switch checked={form.is_featured} onCheckedChange={(v) => update('is_featured', v)} />
          </div>

          {/* Main Photo + Gallery */}
          <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-primary/5">
            <ImageUploadField
              label="Main Photo"
              hint="Landscape, recommended 1200 × 675 px (JPG). Max 2MB."
              files={imageFiles}
              onFilesChange={setImageFiles}
              existing={keptImage ? [fileUrl(keptImage)] : []}
              onRemoveExisting={() => setKeptImage(null)}
            />
            <ImageUploadField
              label="Gallery"
              multiple
              maxFiles={10}
              hint="Landscape, recommended 1200 × 800 px (JPG). Up to 10 images."
              files={galleryFiles}
              onFilesChange={setGalleryFiles}
              existing={keptGallery.map((f) => fileUrl(f))}
              onRemoveExisting={(url) => {
                const fname = keptGallery.find((f) => fileUrl(f) === url)
                if (fname) setKeptGallery((prev) => prev.filter((x) => x !== fname))
              }}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-bold text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
