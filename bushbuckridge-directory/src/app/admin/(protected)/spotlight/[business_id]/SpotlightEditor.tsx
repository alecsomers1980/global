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

const layoutDescriptions: Record<string, string> = {
    default: 'Classic article: hero banner, text, gallery at the end.',
    hero_top: 'Full-bleed cinematic hero, then a focused reading column.',
    gallery_grid: 'Image-led grid up top, story below.',
}

export default function SpotlightEditor({
    businessId,
    initialArticle,
    quarter,
    year,
}: {
    businessId: string
    initialArticle?: any
    quarter: string
    year: number
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState(initialArticle?.title || '')
    const [status, setStatus] = useState(initialArticle?.status || 'pending')
    const [layout, setLayout] = useState(initialArticle?.layout || 'default')
    const [content, setContent] = useState(initialArticle?.content || '')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const formData = new FormData(e.currentTarget)
            formData.append('business_id', businessId)
            if (initialArticle?.id) formData.append('article_id', initialArticle.id)
            formData.append('title', title)
            formData.append('quarter', quarter)
            formData.append('year', String(year))
            formData.append('content', content)
            const res = await saveSpotlightArticle(formData)
            if (res.success) {
                router.push(`/admin/spotlight/${businessId}?year=${year}`)
                router.refresh()
            } else {
                alert('Failed to save: ' + res.error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">
                    Editing {quarter} · {year}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Article Settings card */}
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader>
                        <CardTitle>Article Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Title – full width, first */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Optional headline (defaults to business name)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Status & Layout grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="layout">Layout</Label>
                                <Select name="layout" value={layout} onValueChange={setLayout}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="hero_top">Hero Top</SelectItem>
                                        <SelectItem value="gallery_grid">Gallery Grid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {layoutDescriptions[layout] && (
                            <p className="text-sm text-muted-foreground pt-1">
                                {layoutDescriptions[layout]}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Content Editor card */}
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader>
                        <CardTitle>Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            name="content"
                            className="min-h-[300px]"
                            placeholder="Write your article content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {/* Gallery Images card */}
                <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                    <CardHeader>
                        <CardTitle>Gallery Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="images">
                                Upload images for the gallery. The first image is used as the hero.
                            </Label>
                            <Input
                                id="images"
                                name="images"
                                type="file"
                                multiple
                                accept="image/*"
                                className="mt-2"
                            />
                        </div>
                        {initialArticle?.images?.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Current images</p>
                                <div className="flex flex-wrap gap-2">
                                    {initialArticle.images.map((img: string) => (
                                        <div
                                            key={img}
                                            className="relative h-20 w-20 overflow-hidden rounded-xl border"
                                        >
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_PB_URL}/api/files/spotlight_articles/${initialArticle.id}/${img}`}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Save button */}
                <CardFooter className="px-0">
                    <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Article
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}