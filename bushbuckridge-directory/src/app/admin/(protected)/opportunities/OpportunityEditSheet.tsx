'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { saveOpportunity } from './actions'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'
import ImageUploadField from '@/components/ImageUploadField'

const CATEGORIES = ['Funding', 'Tenders', 'Grants', 'Training', 'Business Support', 'Other']

interface Props { open: boolean; onClose: () => void; opportunity?: any }

export default function OpportunityEditSheet({ open, onClose, opportunity }: Props) {
  const isEdit = !!opportunity
  const [saving, setSaving] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [keptImage, setKeptImage] = useState<string | null>(null)
  const [keptGallery, setKeptGallery] = useState<string[]>([])

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
  const fileUrl = (f: string) => opportunity ? `${pbUrl}/api/files/${opportunity.collectionId}/${opportunity.id}/${f}` : ''

  const [form, setForm] = useState({
    title: '',
    category: 'Funding',
    description: '',
    deadline: '',
    contact_info: '',
    link: '',
    organization: '',
    value: '',
    eligibility: '',
    reference_number: '',
    location: '',
    how_to_apply: '',
    required_documents: ''
  })

  useEffect(() => {
    if (opportunity) {
      setForm({
        title: opportunity.title || '',
        category: opportunity.category || 'Funding',
        description: opportunity.description || '',
        deadline: opportunity.deadline ? opportunity.deadline.slice(0, 10) : '',
        contact_info: opportunity.contact_info || '',
        link: opportunity.link || '',
        organization: opportunity.organization || '',
        value: opportunity.value || '',
        eligibility: opportunity.eligibility || '',
        reference_number: opportunity.reference_number || '',
        location: opportunity.location || '',
        how_to_apply: opportunity.how_to_apply || '',
        required_documents: opportunity.required_documents || ''
      })
      setKeptImage(opportunity.image || null)
      setKeptGallery(Array.isArray(opportunity.gallery) ? opportunity.gallery : opportunity.gallery ? [opportunity.gallery] : [])
    } else {
      setForm({
        title: '',
        category: 'Funding',
        description: '',
        deadline: '',
        contact_info: '',
        link: '',
        organization: '',
        value: '',
        eligibility: '',
        reference_number: '',
        location: '',
        how_to_apply: '',
        required_documents: ''
      })
      setKeptImage(null)
      setKeptGallery([])
    }
    setImageFiles([])
    setGalleryFiles([])
  }, [opportunity, open])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.title) {
      toast.error('Title is required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
      if (imageFiles[0]) fd.append('image', imageFiles[0])
      else if (!keptImage && opportunity?.image) fd.append('image', '')
      galleryFiles.forEach((f) => fd.append('gallery', f))
      const originalGallery: string[] = opportunity
        ? (Array.isArray(opportunity.gallery) ? opportunity.gallery : opportunity.gallery ? [opportunity.gallery] : [])
        : []
      originalGallery.filter((f) => !keptGallery.includes(f)).forEach((f) => fd.append('gallery-', f))

      await saveOpportunity(isEdit ? opportunity.id : null, fd)
      toast.success(isEdit ? 'Opportunity updated' : 'Opportunity created')
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
            {isEdit ? 'Edit Opportunity' : 'Add Opportunity'}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {isEdit ? 'Update the opportunity details below.' : 'Fill in the details for the new opportunity.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {/* Title (full width) */}
          <div>
            <Label htmlFor="title" className="font-semibold">Title *</Label>
            <Input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Opportunity title" />
          </div>

          {/* Category | Organization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="font-semibold">Category</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="organization" className="font-semibold">Organization / Issuer</Label>
              <Input id="organization" value={form.organization} onChange={(e) => update('organization', e.target.value)} placeholder="Issuing organization" />
            </div>
          </div>

          {/* Value | Reference Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value" className="font-semibold">Value / Amount</Label>
              <Input id="value" value={form.value} onChange={(e) => update('value', e.target.value)} placeholder="e.g. R500,000" />
            </div>
            <div>
              <Label htmlFor="reference_number" className="font-semibold">Reference Number</Label>
              <Input id="reference_number" value={form.reference_number} onChange={(e) => update('reference_number', e.target.value)} placeholder="Tender/Ref no." />
            </div>
          </div>

          {/* Deadline | Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline" className="font-semibold">Deadline</Label>
              <Input id="deadline" type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="location" className="font-semibold">Location / Region</Label>
              <Input id="location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Gauteng" />
            </div>
          </div>

          {/* Link (full width) */}
          <div>
            <Label htmlFor="link" className="font-semibold">Link</Label>
            <Input id="link" type="url" value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://..." />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="font-semibold">Description</Label>
            <RichTextEditor
              value={form.description}
              onChange={(v) => update('description', v)}
              placeholder="Brief description of the opportunity"
              minRows={5}
            />
          </div>

          {/* Eligibility */}
          <div>
            <Label htmlFor="eligibility" className="font-semibold">Eligibility / Who can apply</Label>
            <RichTextEditor
              value={form.eligibility}
              onChange={(v) => update('eligibility', v)}
              placeholder="Eligibility criteria"
              minRows={4}
            />
          </div>

          {/* Required Documents */}
          <div>
            <Label htmlFor="required_documents" className="font-semibold">Required Documents</Label>
            <RichTextEditor
              value={form.required_documents}
              onChange={(v) => update('required_documents', v)}
              placeholder="Documents needed for application"
              minRows={4}
            />
          </div>

          {/* How to Apply */}
          <div>
            <Label htmlFor="how_to_apply" className="font-semibold">How to Apply</Label>
            <RichTextEditor
              value={form.how_to_apply}
              onChange={(v) => update('how_to_apply', v)}
              placeholder="Instructions for applying"
              minRows={4}
            />
          </div>

          {/* Contact Info */}
          <div>
            <Label htmlFor="contact_info" className="font-semibold">Contact Info</Label>
            <Input id="contact_info" value={form.contact_info} onChange={(e) => update('contact_info', e.target.value)} placeholder="Email / phone number" />
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
          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update Opportunity' : 'Create Opportunity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
