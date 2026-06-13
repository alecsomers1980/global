'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { updateBusiness } from './actions'
import { toast } from 'sonner'
import RichTextEditor from '@/components/RichTextEditor'

interface Props {
  open: boolean
  onClose: () => void
  business: any | null
}

export default function BusinessEditSheet({ open, onClose, business }: Props) {
  const [saving, setSaving] = useState(false)
  const [sectors, setSectors] = useState<any[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    sector: '',
    area: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    description: '',
    package_tier: 'basic',
    status: 'active',
  })

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
      })
    }
  }, [business, open])

  useEffect(() => {
    async function load() {
      try {
        const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
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
  }, [open])

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
      await updateBusiness(business.id, form)
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
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto px-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-primary">Edit Business</DialogTitle>
          <DialogDescription className="font-medium">
            Update the details for this business listing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Business Name *</Label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Sector</Label>
              <Select value={form.sector} onValueChange={(v) => update('sector', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {sectors.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Area</Label>
              <Select value={form.area} onValueChange={(v) => update('area', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Phone</Label>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">WhatsApp</Label>
              <Input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Website</Label>
              <Input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Package Tier</Label>
              <Select value={form.package_tier} onValueChange={(v) => update('package_tier', v)}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro-lead">Pro Lead</SelectItem>
                  <SelectItem value="pro-business">Pro Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Status</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v)}>
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
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</Label>
            <RichTextEditor
              value={form.description}
              onChange={(v) => update('description', v)}
              minRows={5}
              placeholder="Describe the business..."
            />
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
