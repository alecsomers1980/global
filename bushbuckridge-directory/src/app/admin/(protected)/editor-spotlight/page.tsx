import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { saveEditorSpotlight } from './actions'
import { Star, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            <form action={saveEditorSpotlight} encType="multipart/form-data" className="space-y-6">
              <input type="hidden" name="id" value={existingRecord?.id || ''} />

              {/* Name & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    className="uppercase tracking-widest text-xs text-primary/60"
                    htmlFor="name"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., maria_torres"
                    defaultValue={existingRecord?.name || ''}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="uppercase tracking-widest text-xs text-primary/60"
                    htmlFor="title"
                  >
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="Spotlight Title"
                    defaultValue={existingRecord?.title || ''}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label
                  className="uppercase tracking-widest text-xs text-primary/60"
                  htmlFor="short_description"
                >
                  Short Description
                </Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  required
                  placeholder="A brief summary..."
                  defaultValue={existingRecord?.short_description || ''}
                  className="min-h-[80px] rounded-xl"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <Label
                  className="uppercase tracking-widest text-xs text-primary/60"
                  htmlFor="full_description"
                >
                  Full Description
                </Label>
                <Textarea
                  id="full_description"
                  name="full_description"
                  required
                  placeholder="Rich content..."
                  defaultValue={existingRecord?.full_description || ''}
                  className="min-h-[200px] rounded-xl"
                />
              </div>

              {/* Layout Selector */}
              <div className="space-y-2">
                <Label
                  className="uppercase tracking-widest text-xs text-primary/60"
                  htmlFor="layout"
                >
                  Layout
                </Label>
                <select
                  id="layout"
                  name="layout"
                  defaultValue={existingRecord?.layout || 'default'}
                  className="h-12 rounded-xl border border-border bg-background px-3 w-full"
                >
                  <option value="default">Standard Narrative</option>
                  <option value="hero_top">Hero Image Focus</option>
                  <option value="gallery_grid">Gallery Showcase</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  The full description renders as a full page using the chosen layout.
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label
                  className="uppercase tracking-widest text-xs text-primary/60"
                  htmlFor="is_active"
                >
                  Status
                </Label>
                <select
                  id="is_active"
                  name="is_active"
                  defaultValue={existingRecord?.is_active ? 'true' : 'false'}
                  className="h-12 rounded-xl border border-border bg-background px-3 w-full"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Main Image Upload */}
              <div className="space-y-2">
                <Label
                  className="uppercase tracking-widest text-xs text-primary/60"
                  htmlFor="image"
                >
                  Main Image
                </Label>
                {existingRecord?.image && (
                  <div className="mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${pocketbaseUrl}/api/files/${existingRecord.collectionId}/${existingRecord.id}/${existingRecord.image}`}
                      alt="Current Main"
                      className="h-20 w-auto rounded-lg border"
                    />
                  </div>
                )}
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="h-12 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              {/* Gallery Images Upload */}
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-xs text-primary/60">
                  Gallery Images (Max 10)
                </Label>
                {existingRecord?.images && existingRecord.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingRecord.images.map((img: string, idx: number) => (
                      <div key={idx}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${pocketbaseUrl}/api/files/${existingRecord.collectionId}/${existingRecord.id}/${img}`}
                          alt={`Gallery ${idx}`}
                          className="h-20 w-20 rounded-lg object-cover border shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mb-1">
                  First gallery image is used as the hero; the rest form the gallery.
                </p>
                <Input
                  type="file"
                  name="images"
                  multiple
                  accept="image/*"
                  className="h-12 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <Button type="submit" size="lg" className="h-12 rounded-xl font-bold w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Spotlight
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}