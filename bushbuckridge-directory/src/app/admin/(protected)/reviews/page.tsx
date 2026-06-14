import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import ReviewActions from './ReviewActions'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  rejected: 'bg-red-50 text-red-700 border-red-100',
}

export default async function AdminReviewsPage() {
  await requireAdmin()
  const pb = await createClient()

  let reviews: any[] = []
  try {
    reviews = await pb.collection('reviews').getFullList({
      sort: '-created',
      expand: 'business',
    })
  } catch (e) {
    console.error('Failed to fetch reviews', e)
  }

  // pending first, then by date (already -created)
  reviews.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return 0
  })

  const pendingCount = reviews.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-primary">Customer Reviews</h1>
        <p className="text-muted-foreground font-medium mt-2 text-lg">
          Moderate submitted reviews. {pendingCount} pending approval.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card className="rounded-[2rem] border-0 shadow-xl">
          <CardContent className="py-20 text-center text-muted-foreground font-medium">
            No reviews submitted yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id} className="rounded-[2rem] border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black text-primary">
                      {r.expand?.business?.name || 'Unknown business'}
                    </CardTitle>
                    <CardDescription className="font-medium mt-1">
                      {r.author_name} · {r.author_email}
                      {r.created ? ` · ${format(new Date(r.created), 'd MMM yyyy')}` : ''}
                    </CardDescription>
                  </div>
                  <Badge className={`rounded-full font-black uppercase text-[10px] tracking-widest border ${STATUS_STYLES[r.status] || ''}`}>
                    {r.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed font-medium">{r.comment}</p>
                <ReviewActions review={r} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
