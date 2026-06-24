'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { updateBusinessFull } from './actions'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'
import ImageUploadField from '@/components/ImageUploadField'
import BusinessHoursEditor from '@/components/BusinessHoursEditor'
import PairListEditor from '@/components/PairListEditor'
import TagListEditor from '@/components/TagListEditor'

interface Props {
  open: boolean
  onClose: () => void
  business: any | null
}

const LBL = 'text-xs font-bold uppercase tracking-widest text-primary/60'

export default function BusinessEditSheet({ open, onClose, business }: Props) {
  const [saving, setSaving] = useState(false)
  const [sectors, setSectors] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])

  const [form, setForm] = useState<Record<string, string>>({})
  const [hours, setHours] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [certs, setCerts] = useState<string[]>([])

  // file state
  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [coverFiles, setCoverFiles] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [keptLogo, setKeptLogo] = useState<string | null>(null)
  const [keptCover, setKeptCover] = useState<string | null>(null)
  const [keptGallery, setKeptGallery] = useState<string[]>([])

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
  const fileUrl = (f: string) =>
    business ? `${pbUrl}/api/files/${business.collectionId}/${business.id}/${f}` : ''

  useEffect(() => {
    if (business && open) {
      setForm({
        name: business.name || '',
        sector: business.sector || '',
        area: business.area || '',
        phone: business.phone || '',
        whatsapp: business.whatsapp || '',
        email: business.email || '',
        website: business.website || '',
        description: business.description || '',
        package_tier: business.package_tier || 'basic',
        status: business.status || 'active',
        address: business.address || '',
        video_url: business.video_url || '',
        special_offer: business.special_offer || '',
        special_offer_expires: business.special_offer_expires
          ? String(business.special_offer_expires).slice(0, 10)
          : '',
        map_lat: business.map_lat != null ? String(business.map_lat) : '',
        map_lng: business.map_lng != null ? String(business.map_lng) : '',
        years_in_business: business.years_in_business != null ? String(business.years_in_business) : '',
        team_size: business.team_size || '',
        facebook: business.facebook || '',
        instagram: business.instagram || '',
        linkedin: business.linkedin || '',
      })
      setHours(business.business_hours || null)
      setServices(Array.isArray(business.services) ? business.services : [])
      setFaqs(Array.isArray(business.faqs) ? business.faqs : [])
      setCerts(Array.isArray(business.certifications) ? business.certifications : [])
      setLogoFiles([]); setCoverFiles([]); setGalleryFiles([])
      setKeptLogo(business.logo || null)
      setKeptCover(business.cover_image || null)
      setKeptGallery(
        Array.isArray(business.gallery)
          ? business.gallery
          : business.gallery ? [business.gallery] : []
      )
    }
  }, [business, open])

  useEffect(() => {
    async function load() {
      try {
        const [sRes, aRes] = await Promise.all([
          fetch(`${pbUrl}/api/collections/sectors/records?sort=name&perPage=100`),
          fetch(`${pbUrl}/api/collections/areas/records?sort=name&perPage=100`),
        ])
        setSectors((await sRes.json()).items || [])
        setAreas((await aRes.json()).items || [])
      } catch (e) {
        console.error('Failed to load taxonomies', e)
      }
    }
    if (open) load()
  }, [open, pbUrl])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.name) {
      toast.error('Business name is required.')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      // scalar / text / select / relation / date / url fields
      const textKeys = ['name', 'sector', 'area', 'phone', 'whatsapp', 'email', 'website',
        'package_tier', 'status', 'address', 'video_url', 'special_offer',
        'special_offer_expires', 'team_size', 'facebook', 'instagram', 'linkedin']
      textKeys.forEach((k) => fd.append(k, form[k] ?? ''))
      // description is editor (html)
      fd.append('description', form.description ?? '')
      // number fields — only append when non-empty (PB rejects '' for number)
      ;['map_lat', 'map_lng', 'years_in_business'].forEach((k) => {
        if (form[k] !== '' && form[k] != null) fd.append(k, form[k])
      })
      // json fields
      fd.append('business_hours', JSON.stringify(hours || {}))
      fd.append('services', JSON.stringify(services.filter((s) => s.name || s.price)))
      fd.append('faqs', JSON.stringify(faqs.filter((f) => f.question || f.answer)))
      fd.append('certifications', JSON.stringify(certs))

      // logo (single)
      if (logoFiles[0]) fd.append('logo', logoFiles[0])
      else if (!keptLogo && business.logo) fd.append('logo', '')
      // cover (single)
      if (coverFiles[0]) fd.append('cover_image', coverFiles[0])
      else if (!keptCover && business.cover_image) fd.append('cover_image', '')
      // gallery (multiple): add new, remove deleted
      galleryFiles.forEach((f) => fd.append('gallery', f))
      const originalGallery: string[] = Array.isArray(business.gallery)
        ? business.gallery
        : business.gallery ? [business.gallery] : []
      originalGallery.filter((f) => !keptGallery.includes(f)).forEach((f) => fd.append('gallery-', f))

      await updateBusinessFull(business.id, fd)
      toast.success('Business updated')
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update business')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto px-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-primary">Edit Business</DialogTitle>
          <DialogDescription className="font-medium">
            Update all details for this listing. As admin you can edit every field regardless of tier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Core */}
          <div className="space-y-2">
            <Label className={LBL}>Business Name *</Label>
            <Input value={form.name || ''} onChange={(e) => update('name', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Sector</Label>
              <Select value={form.sector || ''} onValueChange={(v) => update('sector', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Area</Label>
              <Select value={form.area || ''} onValueChange={(v) => update('area', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className={LBL}>Physical Address</Label>
            <Input value={form.address || ''} onChange={(e) => update('address', e.target.value)} className="h-12 rounded-xl" placeholder="Street, town" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Phone</Label>
              <Input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>WhatsApp</Label>
              <Input value={form.whatsapp || ''} onChange={(e) => update('whatsapp', e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Email</Label>
              <Input type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Website</Label>
              <Input value={form.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Facebook</Label>
              <Input value={form.facebook || ''} onChange={(e) => update('facebook', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Instagram</Label>
              <Input value={form.instagram || ''} onChange={(e) => update('instagram', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>LinkedIn</Label>
              <Input value={form.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Package Tier</Label>
              <Select value={form.package_tier || 'basic'} onValueChange={(v) => update('package_tier', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro-lead">Pro Lead</SelectItem>
                  <SelectItem value="pro-business">Pro Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Status</Label>
              <Select value={form.status || 'active'} onValueChange={(v) => update('status', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={LBL}>Description</Label>
            <RichTextEditor value={form.description || ''} onChange={(v) => update('description', v)} minRows={5} placeholder="Describe the business..." />
          </div>

          {/* Images */}
          <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-primary/5">
            <ImageUploadField
              label="Logo"
              hint="Square, recommended 400 × 400 px (PNG, transparent background). Max 2MB."
              files={logoFiles}
              onFilesChange={setLogoFiles}
              existing={keptLogo ? [fileUrl(keptLogo)] : []}
              onRemoveExisting={() => setKeptLogo(null)}
            />
            <ImageUploadField
              label="Cover / Banner Image"
              hint="Landscape, recommended 1600 × 600 px (JPG). Max 2MB."
              files={coverFiles}
              onFilesChange={setCoverFiles}
              existing={keptCover ? [fileUrl(keptCover)] : []}
              onRemoveExisting={() => setKeptCover(null)}
            />
          </div>
          <ImageUploadField
            label="Photo Gallery"
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

          {/* Business hours */}
          <div className="space-y-2 pt-2 border-t border-primary/5">
            <Label className={LBL}>Business Hours</Label>
            <BusinessHoursEditor value={hours} onChange={setHours} />
          </div>

          {/* Services */}
          <div className="space-y-2 pt-2 border-t border-primary/5">
            <Label className={LBL}>Services & Prices</Label>
            <PairListEditor
              value={services}
              onChange={setServices}
              field1={{ key: 'name', label: 'Service', placeholder: 'Service name' }}
              field2={{ key: 'price', label: 'Price', placeholder: 'e.g. R500 or POA' }}
              addLabel="Add service"
            />
          </div>

          {/* FAQs */}
          <div className="space-y-2 pt-2 border-t border-primary/5">
            <Label className={LBL}>FAQs</Label>
            <PairListEditor
              value={faqs}
              onChange={setFaqs}
              field1={{ key: 'question', label: 'Question', placeholder: 'Question' }}
              field2={{ key: 'answer', label: 'Answer', placeholder: 'Answer' }}
              field2Multiline
              addLabel="Add FAQ"
            />
          </div>

          {/* Certifications */}
          <div className="space-y-2 pt-2 border-t border-primary/5">
            <Label className={LBL}>Certifications & Accreditations</Label>
            <TagListEditor value={certs} onChange={setCerts} placeholder="e.g. CIDB Grade 3, BEE Level 1" />
          </div>

          {/* Extras */}
          <div className="space-y-2 pt-2 border-t border-primary/5">
            <Label className={LBL}>Video URL (YouTube / Vimeo)</Label>
            <Input value={form.video_url || ''} onChange={(e) => update('video_url', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Special Offer</Label>
              <Input value={form.special_offer || ''} onChange={(e) => update('special_offer', e.target.value)} placeholder="e.g. 10% off this month" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Offer Expires</Label>
              <Input type="date" value={form.special_offer_expires || ''} onChange={(e) => update('special_offer_expires', e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Years in Business</Label>
              <Input type="number" value={form.years_in_business || ''} onChange={(e) => update('years_in_business', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Team Size</Label>
              <Input value={form.team_size || ''} onChange={(e) => update('team_size', e.target.value)} placeholder="e.g. 10-50" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={LBL}>Map Latitude</Label>
              <Input type="number" value={form.map_lat || ''} onChange={(e) => update('map_lat', e.target.value)} placeholder="-24.83" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Map Longitude</Label>
              <Input type="number" value={form.map_lng || ''} onChange={(e) => update('map_lng', e.target.value)} placeholder="31.05" className="h-12 rounded-xl" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl font-bold text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
