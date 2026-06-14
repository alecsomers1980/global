'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, LockKeyhole, Zap, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'
import ImageUploadField from '@/components/ImageUploadField'
import BusinessHoursEditor from '@/components/BusinessHoursEditor'
import PairListEditor from '@/components/PairListEditor'
import TagListEditor from '@/components/TagListEditor'
import { updateMyBusiness } from './actions'

const LBL = 'text-xs font-black text-primary/40 uppercase tracking-widest'

export default function SettingsForm({ business, pbUrl }: { business: any; pbUrl: string }) {
  const tier: string = business.package_tier || 'basic'
  const isEnhanced = tier === 'pro-lead' || tier === 'pro-business'
  const isPremium = tier === 'pro-business'
  const galleryMax = isPremium ? 10 : isEnhanced ? 3 : 0

  const fileUrl = (f: string) => `${pbUrl}/api/files/${business.collectionId}/${business.id}/${f}`

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    name: business.name || '',
    description: business.description || '',
    phone: business.phone || '',
    address: business.address || '',
    whatsapp: business.whatsapp || '',
    email: business.email || '',
    website: business.website || '',
    facebook: business.facebook || '',
    instagram: business.instagram || '',
    linkedin: business.linkedin || '',
    video_url: business.video_url || '',
    special_offer: business.special_offer || '',
    special_offer_expires: business.special_offer_expires ? String(business.special_offer_expires).slice(0, 10) : '',
    team_size: business.team_size || '',
    years_in_business: business.years_in_business != null ? String(business.years_in_business) : '',
    map_lat: business.map_lat != null ? String(business.map_lat) : '',
    map_lng: business.map_lng != null ? String(business.map_lng) : '',
  })
  const [hours, setHours] = useState<any>(business.business_hours || null)
  const [services, setServices] = useState<any[]>(Array.isArray(business.services) ? business.services : [])
  const [faqs, setFaqs] = useState<any[]>(Array.isArray(business.faqs) ? business.faqs : [])
  const [certs, setCerts] = useState<string[]>(Array.isArray(business.certifications) ? business.certifications : [])

  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [coverFiles, setCoverFiles] = useState<File[]>([])
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [keptLogo, setKeptLogo] = useState<string | null>(business.logo || null)
  const [keptCover, setKeptCover] = useState<string | null>(business.cover_image || null)
  const [keptGallery, setKeptGallery] = useState<string[]>(
    Array.isArray(business.gallery) ? business.gallery : business.gallery ? [business.gallery] : []
  )

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
      const textKeys = ['name', 'phone', 'address', 'whatsapp', 'email', 'website',
        'facebook', 'instagram', 'linkedin', 'video_url', 'special_offer', 'special_offer_expires', 'team_size']
      textKeys.forEach((k) => fd.append(k, form[k] ?? ''))
      fd.append('description', form.description ?? '')
      ;['map_lat', 'map_lng', 'years_in_business'].forEach((k) => {
        if (form[k] !== '' && form[k] != null) fd.append(k, form[k])
      })
      fd.append('business_hours', JSON.stringify(hours || {}))
      fd.append('services', JSON.stringify(services.filter((s) => s.name || s.price)))
      fd.append('faqs', JSON.stringify(faqs.filter((f) => f.question || f.answer)))
      fd.append('certifications', JSON.stringify(certs))

      if (logoFiles[0]) fd.append('logo', logoFiles[0])
      else if (!keptLogo && business.logo) fd.append('logo', '')
      if (coverFiles[0]) fd.append('cover_image', coverFiles[0])
      else if (!keptCover && business.cover_image) fd.append('cover_image', '')
      galleryFiles.forEach((f) => fd.append('gallery', f))
      const originalGallery: string[] = Array.isArray(business.gallery)
        ? business.gallery : business.gallery ? [business.gallery] : []
      originalGallery.filter((f) => !keptGallery.includes(f)).forEach((f) => fd.append('gallery-', f))

      await updateMyBusiness(fd)
      toast.success('Profile updated')
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const LockOverlay = ({ variant, title, blurb }: { variant: 'amber' | 'rose'; title: string; blurb: string }) => {
    const styles = variant === 'amber'
      ? { border: 'border-amber-100', bubble: 'bg-amber-50', icon: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600' }
      : { border: 'border-rose-100', bubble: 'bg-rose-50', icon: 'text-rose-500', btn: 'bg-rose-500 hover:bg-rose-600' }
    return (
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[2rem]">
        <div className={`bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm border ${styles.border}`}>
          <div className={`h-16 w-16 ${styles.bubble} rounded-full flex items-center justify-center mb-4`}>
            {variant === 'amber' ? <Zap className={`h-8 w-8 ${styles.icon}`} /> : <Sparkles className={`h-8 w-8 ${styles.icon}`} />}
          </div>
          <h3 className="text-2xl font-black mb-2">{title}</h3>
          <p className="text-muted-foreground font-medium mb-6">{blurb}</p>
          <Button asChild className={`w-full h-14 ${styles.btn} text-white font-black text-lg rounded-xl shadow-lg`}>
            <Link href="/portal/billing"><LockKeyhole className="h-5 w-5 mr-2" /> Upgrade</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Profile Editor</h1>
        <p className="text-muted-foreground font-medium mt-2 text-lg">Manage your listing. Greyed sections unlock with a higher package.</p>
      </div>

      {/* CORE — all tiers */}
      <Card className="border-0 shadow-xl bg-card rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-primary/5 bg-primary/5">
          <CardTitle className="text-2xl font-black">Core Business Info</CardTitle>
          <CardDescription className="text-base font-medium">Available on all packages.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={LBL}>Business Name *</Label>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Phone</Label>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className={LBL}>Physical Address</Label>
              <Input value={form.address} onChange={(e) => update('address', e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={LBL}>Business Description</Label>
            <RichTextEditor value={form.description} onChange={(v) => update('description', v)} minRows={5} placeholder="Describe your business..." />
          </div>
          <ImageUploadField
            label="Business Logo"
            files={logoFiles}
            onFilesChange={setLogoFiles}
            existing={keptLogo ? [fileUrl(keptLogo)] : []}
            onRemoveExisting={() => setKeptLogo(null)}
          />
          <div className="space-y-2">
            <Label className={LBL}>Business Hours</Label>
            <BusinessHoursEditor value={hours} onChange={setHours} />
          </div>
          <div className="space-y-2">
            <Label className={LBL}>Services & Prices</Label>
            <PairListEditor
              value={services}
              onChange={setServices}
              field1={{ key: 'name', label: 'Service', placeholder: 'Service name' }}
              field2={{ key: 'price', label: 'Price', placeholder: 'e.g. R500 or POA' }}
              addLabel="Add service"
            />
          </div>
        </CardContent>
      </Card>

      {/* ENHANCED — pro-lead+ */}
      <Card className={`border-0 shadow-xl bg-card rounded-[2rem] overflow-hidden relative ${!isEnhanced ? 'border-2 border-amber-500' : ''}`}>
        {!isEnhanced && <LockOverlay variant="amber" title="Enhanced Features" blurb="Unlock cover image, photo gallery and social links." />}
        <CardHeader className="p-8 border-b border-primary/5 bg-amber-50/50">
          <CardTitle className="text-2xl font-black text-amber-700">Media & Direct Links</CardTitle>
          <CardDescription className="text-base font-medium text-amber-900/60">Cover image, gallery and social platforms.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <ImageUploadField
            label="Cover / Banner Image"
            files={coverFiles}
            onFilesChange={setCoverFiles}
            existing={keptCover ? [fileUrl(keptCover)] : []}
            onRemoveExisting={() => setKeptCover(null)}
            disabled={!isEnhanced}
          />
          <ImageUploadField
            label={`Photo Gallery (max ${galleryMax || 3})`}
            multiple
            maxFiles={galleryMax || 3}
            hint={isPremium ? 'Up to 10 images.' : 'Up to 3 images.'}
            files={galleryFiles}
            onFilesChange={setGalleryFiles}
            existing={keptGallery.map((f) => fileUrl(f))}
            onRemoveExisting={(url) => {
              const fname = keptGallery.find((f) => fileUrl(f) === url)
              if (fname) setKeptGallery((prev) => prev.filter((x) => x !== fname))
            }}
            disabled={!isEnhanced}
          />
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={LBL}>WhatsApp</Label>
              <Input value={form.whatsapp} disabled={!isEnhanced} onChange={(e) => update('whatsapp', e.target.value)} placeholder="e.g. 27821234567" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Public Email</Label>
              <Input value={form.email} disabled={!isEnhanced} onChange={(e) => update('email', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Facebook</Label>
              <Input value={form.facebook} disabled={!isEnhanced} onChange={(e) => update('facebook', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Instagram</Label>
              <Input value={form.instagram} disabled={!isEnhanced} onChange={(e) => update('instagram', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>LinkedIn</Label>
              <Input value={form.linkedin} disabled={!isEnhanced} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PREMIUM — pro-business */}
      <Card className={`border-0 shadow-xl bg-card rounded-[2rem] overflow-hidden relative ${!isPremium ? 'border-2 border-rose-300' : ''}`}>
        {!isPremium && <LockOverlay variant="rose" title="Premium Features" blurb="Website link, video, FAQs, certifications, special offers and map." />}
        <CardHeader className="p-8 border-b border-primary/5 bg-rose-50/50">
          <CardTitle className="text-2xl font-black text-rose-700">Premium Showcase</CardTitle>
          <CardDescription className="text-base font-medium text-rose-900/60">Storytelling and trust-building tools.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={LBL}>Website</Label>
              <Input value={form.website} disabled={!isPremium} onChange={(e) => update('website', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Video URL (YouTube / Vimeo)</Label>
              <Input value={form.video_url} disabled={!isPremium} onChange={(e) => update('video_url', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className={`space-y-2 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
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
          <div className={`space-y-2 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
            <Label className={LBL}>Certifications & Accreditations</Label>
            <TagListEditor value={certs} onChange={setCerts} placeholder="e.g. CIDB Grade 3, BEE Level 1" />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className={LBL}>Special Offer</Label>
              <Input value={form.special_offer} disabled={!isPremium} onChange={(e) => update('special_offer', e.target.value)} placeholder="e.g. 10% off this month" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Offer Expires</Label>
              <Input type="date" value={form.special_offer_expires} disabled={!isPremium} onChange={(e) => update('special_offer_expires', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Years in Business</Label>
              <Input type="number" value={form.years_in_business} disabled={!isPremium} onChange={(e) => update('years_in_business', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Team Size</Label>
              <Input value={form.team_size} disabled={!isPremium} onChange={(e) => update('team_size', e.target.value)} placeholder="e.g. 10-50" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Map Latitude</Label>
              <Input type="number" value={form.map_lat} disabled={!isPremium} onChange={(e) => update('map_lat', e.target.value)} placeholder="-24.83" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className={LBL}>Map Longitude</Label>
              <Input type="number" value={form.map_lng} disabled={!isPremium} onChange={(e) => update('map_lng', e.target.value)} placeholder="31.05" className="h-12 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="h-14 px-10 rounded-2xl font-black text-lg bg-primary text-white">
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Save Profile Changes
        </Button>
      </div>
    </div>
  )
}
