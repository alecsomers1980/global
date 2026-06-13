'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { createEvent, updateEvent } from './actions'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'

interface Props {
  open: boolean
  onClose: () => void
  event?: any // if provided, edit mode; else create mode
}

export default function EventEditSheet({ open, onClose, event }: Props) {
  const isEdit = !!event
  const [saving, setSaving] = useState(false)

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
    } else {
      setForm({ title: '', description: '', date: '', time: '', venue: '', cost: '', contact_info: '', is_featured: false })
    }
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
      if (isEdit) {
        await updateEvent(event.id, form)
        toast.success('Event updated')
      } else {
        await createEvent(form)
        toast.success('Event created')
      }
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

          <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-bold text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isEdit ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
