'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Loader2 } from 'lucide-react'
import { createOpportunity, updateOpportunity } from './actions'
import { toast } from 'sonner'

const CATEGORIES = ['Tender', 'Funding', 'Training', 'Grant', 'Business Support', 'Other']

interface Props {
  open: boolean
  onClose: () => void
  opportunity?: any
}

export default function OpportunityEditSheet({ open, onClose, opportunity }: Props) {
  const isEdit = !!opportunity
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Tender',
    deadline: '',
    contact_info: '',
    link: '',
  })

  useEffect(() => {
    if (opportunity) {
      setForm({
        title: opportunity.title || '',
        description: opportunity.description || '',
        category: opportunity.category || 'Tender',
        deadline: opportunity.deadline ? opportunity.deadline.slice(0, 10) : '',
        contact_info: opportunity.contact_info || '',
        link: opportunity.link || '',
      })
    } else {
      setForm({ title: '', description: '', category: 'Tender', deadline: '', contact_info: '', link: '' })
    }
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
      if (isEdit) {
        await updateOpportunity(opportunity.id, form)
        toast.success('Opportunity updated')
      } else {
        await createOpportunity(form)
        toast.success('Opportunity created')
      }
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto rounded-l-[2rem]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-black text-primary">
            {isEdit ? 'Edit Opportunity' : 'Add Opportunity'}
          </SheetTitle>
          <SheetDescription className="font-medium">
            {isEdit ? 'Update the opportunity details below.' : 'Fill in the details for the new opportunity.'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Title *</Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} className="h-12 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Category</Label>
              <Select value={form.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Deadline</Label>
              <Input type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} className="h-12 rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Link (URL)</Label>
            <Input value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://" className="h-12 rounded-xl" />
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
            {isEdit ? 'Save Changes' : 'Create Opportunity'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
