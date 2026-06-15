import { Star } from 'lucide-react'
import { format } from 'date-fns'
import ReviewForm from './ReviewForm'

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </span>
  )
}

export default function ReviewsSection({
  businessId,
  reviews,
}: {
  businessId: string
  reviews: any[]
}) {
  const count = reviews.length
  const avg = count ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / count : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em]">Customer Reviews</h3>
        {count > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-primary">{avg.toFixed(1)}</span>
            <div>
              <Stars value={avg} />
              <p className="text-xs font-bold text-muted-foreground mt-0.5">{count} review{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {count > 0 ? (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-[2rem] bg-card/60 border border-primary/5 p-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-black text-primary">{r.author_name}</span>
                <span className="text-xs font-bold text-muted-foreground">
                  {r.created ? format(new Date(r.created), 'd MMM yyyy') : ''}
                </span>
              </div>
              <Stars value={r.rating} className="h-4 w-4 mt-1" />
              <p className="text-muted-foreground leading-relaxed font-medium mt-3">{r.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground font-medium italic">No reviews yet — be the first to share your experience.</p>
      )}

      <ReviewForm businessId={businessId} />
    </div>
  )
}
