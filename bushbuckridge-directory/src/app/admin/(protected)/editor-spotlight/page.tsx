import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import EditorSpotlightForm from './EditorSpotlightForm'

export default async function EditorSpotlightPage() {
  await requireAdmin()
  const pb = await createClient()
  let existingRecord: any = null
  try {
    const result = await pb.collection('editor_spotlight').getList(1, 1)
    existingRecord = result.items[0] || null
  } catch (error) {
    // ignore
  }

  const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || ''

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-primary">Editor Spotlight</h1>
            <p className="text-sm text-muted-foreground">
              Feature a story with rich page layouts and gallery.
            </p>
          </div>
          {existingRecord && (
            <Badge
              className={cn(
                existingRecord.is_active
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
              )}
            >
              {existingRecord.is_active ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>

        <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
          <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
            <CardTitle className="text-2xl font-black text-primary flex items-center gap-2">
              <Star className="h-6 w-6" /> Spotlight
            </CardTitle>
            <CardDescription>
              Fill in the details and choose a layout for the spotlight page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <EditorSpotlightForm existingRecord={existingRecord} pocketbaseUrl={pocketbaseUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
