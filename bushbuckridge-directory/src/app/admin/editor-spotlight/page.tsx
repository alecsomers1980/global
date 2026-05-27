import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { saveEditorSpotlight } from './actions'
import { Badge } from '@/components/ui/badge'
import { Star, Save, Upload, ToggleLeft, FileText, PenLine } from 'lucide-react'

export default async function EditorSpotlightPage() {
  await requireAdmin()
  const pb = await createClient()

  let existingRecord: any = null
  try {
    const result = await pb.collection('editor_spotlight').getList(1, 1)
    existingRecord = result.items[0] || null
  } catch (error) {
    // Collection might be empty or not exist yet
  }

  return (
    <div className="relative bg-slate-950 flex items-center justify-center p-4 md:p-8 overflow-hidden rounded-[2rem]">
      {/* Ambient background effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <Card className="relative w-full max-w-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-black/40 rounded-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-100 tracking-tight">
                  Editor Spotlight
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1 text-sm">
                  Manage the featured editor and their content.
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`w-fit px-3 py-1 text-xs font-semibold border-none ${
                existingRecord?.is_active 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-800/80 text-slate-500'
              }`}
            >
              {existingRecord?.is_active ? 'Currently Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form action={saveEditorSpotlight} encType="multipart/form-data" className="space-y-8">
            <input type="hidden" name="id" value={existingRecord?.id || ''} />

            {/* Top Grid: Name & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <PenLine className="w-3.5 h-3.5 text-slate-500" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Jane Doe"
                  defaultValue={existingRecord?.name || ''}
                  className="bg-slate-950/50 border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-slate-500" />
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Senior Editor"
                  defaultValue={existingRecord?.title || ''}
                  className="bg-slate-950/50 border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60 transition-all"
                  required
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-2">
              <Label htmlFor="short_description" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Short Description
              </Label>
              <Textarea
                id="short_description"
                name="short_description"
                placeholder="A brief highlight for the spotlight card..."
                defaultValue={existingRecord?.short_description || ''}
                rows={3}
                className="bg-slate-950/50 border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60 transition-all min-h-[80px] resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_description" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Full Description
              </Label>
              <Textarea
                id="full_description"
                name="full_description"
                placeholder="Detailed biography or extended spotlight content..."
                defaultValue={existingRecord?.full_description || ''}
                rows={6}
                className="bg-slate-950/50 border-slate-700/50 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/60 transition-all min-h-[160px] resize-none"
                required
              />
            </div>

            {/* Bottom Grid: Image & Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="image" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Spotlight Image
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700/70 rounded-lg cursor-pointer bg-slate-950/30 hover:bg-slate-800/50 hover:border-indigo-500/40 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 mb-2 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      {existingRecord?.image && (
                        <p className="text-xs text-emerald-500/80 mt-1">Current file will be kept if left empty</p>
                      )}
                    </div>
                    <Input 
                      id="image" 
                      name="image" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <ToggleLeft className="w-3.5 h-3.5 text-slate-500" />
                  Visibility Status
                </Label>
                <div className="relative">
                  <select
                    id="is_active"
                    name="is_active"
                    defaultValue={existingRecord?.is_active ? 'true' : 'false'}
                    className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-slate-700/50 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 ring-offset-background placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-all"
                  >
                    <option value="true" className="bg-slate-900 text-slate-100">Active & Visible</option>
                    <option value="false" className="bg-slate-900 text-slate-100">Hidden / Inactive</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-800/80">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all font-semibold tracking-wide"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Spotlight
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Reusable icon component for the select dropdown
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
