'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { saveJob } from './actions'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'
import ImageUploadField from '@/components/ImageUploadField'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship']
const EXPERIENCE_LEVELS = ['Entry-level', 'Mid-level', 'Senior', 'Executive']
const SALARY_PERIODS = ['Monthly', 'Annual', 'Hourly', 'Negotiable']

interface Props {
  open: boolean
  onClose: () => void
  job?: any
}

const initialForm = {
  title: '',
  description: '',
  company: '',
  location: '',
  type: 'Full-time',
  salary: '',
  salary_period: '',
  experience_level: '',
  positions: '',
  closing_date: '',
  responsibilities: '',
  requirements: '',
  how_to_apply: '',
  contact_name: '',
  contact_number: '',
  contact_email: '',
}

export default function JobEditSheet({ open, onClose, job }: Props) {
  const isEdit = !!job
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [keptImage, setKeptImage] = useState<string | null>(null)
  const [keptGallery, setKeptGallery] = useState<string[]>([])

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
  const fileUrl = (f: string) => job ? `${pbUrl}/api/files/${job.collectionId}/${job.id}/${f}` : ''

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || '',
        description: job.description || '',
        company: job.company || '',
        location: job.location || '',
        type: job.type || 'Full-time',
        salary: job.salary || '',
        salary_period: job.salary_period || '',
        experience_level: job.experience_level || '',
        positions: job.positions != null ? String(job.positions) : '',
        closing_date: job.closing_date || '',
        responsibilities: job.responsibilities || '',
        requirements: job.requirements || '',
        how_to_apply: job.how_to_apply || '',
        contact_name: job.contact_name || '',
        contact_number: job.contact_number || '',
        contact_email: job.contact_email || '',
      })
      setKeptImage(job.image || null)
      setKeptGallery(Array.isArray(job.gallery) ? job.gallery : job.gallery ? [job.gallery] : [])
    } else {
      setForm(initialForm)
      setKeptImage(null)
      setKeptGallery([])
    }
    setImageFiles([])
    setGalleryFiles([])
  }, [job, open])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error('Job title is required.')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
      if (imageFiles[0]) fd.append('image', imageFiles[0])
      else if (!keptImage && job?.image) fd.append('image', '')
      galleryFiles.forEach((f) => fd.append('gallery', f))
      const originalGallery: string[] = job
        ? (Array.isArray(job.gallery) ? job.gallery : job.gallery ? [job.gallery] : [])
        : []
      originalGallery.filter((f) => !keptGallery.includes(f)).forEach((f) => fd.append('gallery-', f))

      await saveJob(isEdit ? job.id : null, fd)
      toast.success(isEdit ? 'Job updated' : 'Job created')
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto px-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-primary">
            {isEdit ? 'Edit Job' : 'Add Job'}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {isEdit ? 'Update the job details below.' : 'Fill in the details for the new job listing.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Job Title */}
          <div>
            <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">
              Job Title *
            </Label>
            <Input
              className="h-12 rounded-xl"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
            />
          </div>

          {/* Company | Location */}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Company</Label>
              <Input
                className="h-12 rounded-xl"
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Location</Label>
              <Input
                className="h-12 rounded-xl"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="e.g. Remote / Johannesburg"
              />
            </div>
          </div>

          {/* Type | Experience Level */}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Type</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Experience Level</Label>
              <Select value={form.experience_level} onValueChange={(v) => update('experience_level', v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary | Salary Period */}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Salary</Label>
              <Input
                className="h-12 rounded-xl"
                value={form.salary}
                onChange={(e) => update('salary', e.target.value)}
                placeholder="e.g. R15,000 - R20,000"
              />
            </div>
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Salary Period</Label>
              <Select value={form.salary_period} onValueChange={(v) => update('salary_period', v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Positions Available | Closing Date */}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Positions Available</Label>
              <Input
                type="number"
                min={1}
                className="h-12 rounded-xl"
                value={form.positions}
                onChange={(e) => update('positions', e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Closing Date</Label>
              <Input
                type="date"
                className="h-12 rounded-xl"
                value={form.closing_date}
                onChange={(e) => update('closing_date', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Name | Contact Number */}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Contact Name (optional)</Label>
              <Input
                className="h-12 rounded-xl"
                value={form.contact_name}
                onChange={(e) => update('contact_name', e.target.value)}
                placeholder="Optional name"
              />
            </div>
            <div>
              <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Contact Number</Label>
              <Input
                className="h-12 rounded-xl"
                value={form.contact_number}
                onChange={(e) => update('contact_number', e.target.value)}
                placeholder="e.g. +27 11 123 4567"
              />
            </div>
          </div>

          {/* Contact Email (full width) */}
          <div>
            <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Contact Email</Label>
            <Input
              type="email"
              className="h-12 rounded-xl"
              value={form.contact_email}
              onChange={(e) => update('contact_email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Description</Label>
            <RichTextEditor
              value={form.description}
              onChange={(v) => update('description', v)}
              placeholder="Job overview / description"
              minRows={5}
            />
          </div>

          {/* Key Responsibilities */}
          <div>
            <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Key Responsibilities</Label>
            <RichTextEditor
              value={form.responsibilities}
              onChange={(v) => update('responsibilities', v)}
              placeholder="List key responsibilities"
              minRows={4}
            />
          </div>

          {/* Requirements / Qualifications */}
          <div>
            <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">Requirements / Qualifications</Label>
            <RichTextEditor
              value={form.requirements}
              onChange={(v) => update('requirements', v)}
              placeholder="List required skills and qualifications"
              minRows={4}
            />
          </div>

          {/* How to Apply */}
          <div>
            <Label className="uppercase tracking-widest text-sm font-bold text-primary/60">How to Apply</Label>
            <RichTextEditor
              value={form.how_to_apply}
              onChange={(v) => update('how_to_apply', v)}
              placeholder="Instructions for applicants"
              minRows={4}
            />
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

          {/* Submit */}
          <Button
            className="w-full h-12 rounded-xl font-bold"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Job'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
