'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Save, Loader2, ImageIcon } from 'lucide-react'
import { saveSpotlightArticle } from '../spotlightActions'

export default function SpotlightEditor({ businessId, initialArticle }: { businessId: string, initialArticle?: any }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState(initialArticle?.status || 'pending')
    const [layout, setLayout] = useState(initialArticle?.layout || 'default')
    const [content, setContent] = useState(initialArticle?.content || '')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append('business_id', businessId)
            if (initialArticle?.id) {
                formData.append('article_id', initialArticle.id)
            }
            formData.append('content', content) // Use state content since it's a textarea

            const res = await saveSpotlightArticle(formData)
            if (res.success) {
                router.push('/admin/spotlight')
                router.refresh()
            } else {
                alert('Failed to save: ' + res.error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-0 shadow-2xl bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
                    <CardTitle className="text-2xl font-black">Article Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Publication Status</Label>
                            <Select name="status" value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-12 rounded-xl font-bold">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Draft / Pending</SelectItem>
                                    <SelectItem value="published">Published Live</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Layout Style</Label>
                            <Select name="layout" value={layout} onValueChange={setLayout}>
                                <SelectTrigger className="h-12 rounded-xl font-bold">
                                    <SelectValue placeholder="Select Layout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Standard Narrative</SelectItem>
                                    <SelectItem value="hero_top">Hero Image Focus</SelectItem>
                                    <SelectItem value="gallery_grid">Gallery Showcase</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
                    <CardTitle className="text-2xl font-black">Content Editor</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                        <Label className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Article Content (HTML / Text)</Label>
                        <Textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[300px] p-6 rounded-2xl resize-y font-medium text-base leading-relaxed"
                            placeholder="Write the spotlight story here..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-2xl bg-card rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 p-8 border-b border-primary/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-black flex items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-primary" /> Gallery Images
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                        <Label className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Upload Images (Max 10)</Label>
                        <Input type="file" name="images" multiple accept="image/*" className="h-12 pt-3 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white" />
                        {initialArticle?.images?.length > 0 && (
                            <div className="mt-4 text-sm text-muted-foreground">
                                Currently has {initialArticle.images.length} images uploaded. Note: Uploading new files will overwrite or append based on PB config.
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-8 bg-muted/20 border-t flex justify-end">
                    <Button type="submit" disabled={isLoading} size="lg" className="h-14 px-8 rounded-2xl font-black shadow-lg">
                        {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                        {initialArticle ? 'Update Article' : 'Create Article'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
