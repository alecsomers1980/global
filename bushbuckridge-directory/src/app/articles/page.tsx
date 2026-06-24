import { createClient } from '@/utils/pocketbase/server'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Newspaper } from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'
import SearchArticles from './SearchArticles'
import { Suspense } from 'react'

export default async function ArticlesIndexPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const pb = await createClient()
    const resolvedParams = await searchParams
    const query = resolvedParams?.q || ''

    let articles: any[] = []
    try {
        const filter = query
            ? `status = "published" && (content ~ "${query}" || business_id.name ~ "${query}")`
            : 'status = "published"'
        const records = await pb.collection('spotlight_articles').getList(1, 50, {
            filter,
            sort: '-id',
            expand: 'business_id',
        })
        articles = records.items
    } catch (e) {
        console.error('Failed to fetch spotlight articles:', e)
    }

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title="Spotlight Articles"
                subtitle="In-depth features on Bushbuckridge's leading businesses and entrepreneurs"
                badge="COMMUNITY STORIES"
            />

            <div className="container mx-auto px-4 -mt-8 relative z-20 space-y-12">
                {/* Search */}
                <Suspense fallback={<div className="h-16" />}>
                    <SearchArticles />
                </Suspense>

                {query && (
                    <p className="text-center text-muted-foreground font-medium text-lg">
                        Showing results for: <strong className="text-primary">&ldquo;{query}&rdquo;</strong> &mdash; {articles.length} {articles.length === 1 ? 'article' : 'articles'} found
                    </p>
                )}

                {articles.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Newspaper className="h-10 w-10 text-primary/30" />
                        </div>
                        <h3 className="text-2xl font-black text-primary/40 mb-2">No Spotlight Articles Yet</h3>
                        <p className="text-muted-foreground font-medium">Check back soon — our editorial team is preparing premium business features.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => {
                            const business = article.expand?.business_id
                            const galleryImages = Array.isArray(article.images)
                                ? article.images
                                : (typeof article.images === 'string' && article.images ? [article.images] : [])
                            const thumbUrl = galleryImages.length > 0
                                ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${article.collectionId}/${article.id}/${galleryImages[0]}`
                                : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'

                            // Strip HTML tags for a text preview
                            const textPreview = (article.content || '')
                                .replace(/<[^>]*>/g, '')
                                .substring(0, 120)

                            return (
                                <Link key={article.id} href={`/articles/${article.id}`} className="group">
                                    <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                        <div className="relative h-56 overflow-hidden">
                                            <Image
                                                src={thumbUrl}
                                                alt={business?.name || 'Spotlight'}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                            <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground font-black text-[10px] px-3 py-1 shadow-lg">
                                                SPOTLIGHT
                                            </Badge>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="text-xl font-black text-white line-clamp-2 leading-tight">
                                                    {business?.name || 'Featured Business'}
                                                </h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <p className="text-muted-foreground font-medium text-sm line-clamp-3 mb-4">
                                                {textPreview || 'Read the full feature article...'}
                                            </p>
                                            <div className="flex items-center text-primary font-black text-sm">
                                                Read Article <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
