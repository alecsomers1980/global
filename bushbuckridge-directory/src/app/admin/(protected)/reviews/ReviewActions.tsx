'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Trash2, Loader2 } from 'lucide-react'
import { setReviewStatus, deleteReview } from './actions'
import { toast } from 'sonner'

export default function ReviewActions({ review }: { review: any }) {
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<void>, msg: string) {
    setBusy(true)
    try {
      await fn()
      toast.success(msg)
    } catch (e: any) {
      toast.error(e.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      {review.status !== 'approved' && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold"
          onClick={() => run(() => setReviewStatus(review.id, 'approved'), 'Review approved')}
        >
          <Check className="h-4 w-4 mr-1" /> Approve
        </Button>
      )}
      {review.status !== 'rejected' && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-bold"
          onClick={() => run(() => setReviewStatus(review.id, 'rejected'), 'Review rejected')}
        >
          <X className="h-4 w-4 mr-1" /> Reject
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={busy}
        className="rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50"
        onClick={() => run(() => deleteReview(review.id), 'Review deleted')}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
