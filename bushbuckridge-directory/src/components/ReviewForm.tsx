'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ReviewForm({ businessId }: { businessId: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [ts, setTs] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { setTs(Date.now()) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) { toast.error('Please select a star rating.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: businessId,
          author_name: name,
          author_email: email,
          rating,
          comment,
          company_website: honeypot,
          ts,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Could not submit review.'); setSubmitting(false); return }
      setDone(true)
    } catch {
      toast.error('Connection error. Please try again.')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-[2rem] bg-emerald-50 border border-emerald-100 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-xl font-black text-emerald-800">Thank you!</h4>
        <p className="text-emerald-700 font-medium mt-1">Your review has been submitted and will appear once approved.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-card/60 border border-primary/10 p-8 space-y-5">
      <h4 className="text-xl font-black text-primary">Write a Review</h4>

      {/* honeypot — hidden from users */}
      <input
        type="text"
        name="company_website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const v = i + 1
          return (
            <button
              key={v}
              type="button"
              onClick={() => setRating(v)}
              onMouseEnter={() => setHover(v)}
              onMouseLeave={() => setHover(0)}
              className="p-1"
              aria-label={`${v} star${v > 1 ? 's' : ''}`}
            >
              <Star className={`h-7 w-7 transition-colors ${(hover || rating) >= v ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
            </button>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Your Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Your Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-primary/60">Your Review *</Label>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} required rows={4} className="rounded-2xl resize-none" placeholder="Share your experience..." />
      </div>
      <Button type="submit" disabled={submitting} className="h-12 px-8 rounded-xl font-black bg-primary text-white">
        {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Submit Review
      </Button>
      <p className="text-xs text-muted-foreground">Reviews are moderated before they appear.</p>
    </form>
  )
}
