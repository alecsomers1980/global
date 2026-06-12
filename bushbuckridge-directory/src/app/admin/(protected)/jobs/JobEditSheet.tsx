'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { createJob, updateJob } from './actions'
import { toast } from 'sonner'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']

interface Props {
  open: boolean
  onClose: () => void
  job?: any
}

export default function JobEditSheet({ open, onClose, job }: Props) {
  const isEdit = !!job
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    type: 'Full-time',
    contact_info: '',
  })

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || '',
        description: job.description || '',
        company: job.company || '',
        location: job.location || '',
        type: job.type || 'Full-time',
        contact_info: job.contact_info || '',
      })
    } else {
      setForm({ title: '', description: '', company: '', location: '', type: 'Full-time', contact_info: '' })
    }
  }, [job, open])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.title) {
      toast.error('Job title is required.')
      return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await updateJob(job.id, form)
        toast.success('Job updated')
      } else {
        await createJob(form)
        toast.success('Job created')
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
      <DialogContent>
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-primary">
            {isEdit ? 'Edit Job' : 'Add Job'}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {isEdit ? 'Update the job details below.' : 'Fill in the details for the new job listing.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Job Title *</Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Company</Label>
              <Input value={form.company} onChange={(e) => update('company', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Location</Label>
              <Input value={form.location} onChange={(e) => update('location', e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Type</Label>
            <Select value={form.type} onValueChange={(v) => update('type', v)}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {JOB_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Contact Info</Label>
            <Input value={form.contact_info} onChange={(e) => update('contact_info', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</Label>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="rounded-xl" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-bold text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {isEdit ? 'Save Changes' : 'Create Job'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
