import { createClient } from '@/utils/pocketbase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Building2, Calendar } from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'

export default async function ArticleDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const pb = await createClient()
    const { id } = await params

    let article: any = null
    let business: any = null

    try {
        article = await pb.collection('spotlight_articles').getOne(id, {
            expand: 'business_id',
        })
        business = article.expand?.business_id
    } catch (e) {
        notFound()
    }

    if (!article || article.status !== 'published') {
        notFound()
    }

    const galleryImages = Array.isArray(article.images)
        ? article.images
        : (typeof article.images === 'string' && article.images ? [article.images] : [])

    const heroImage = galleryImages.length > 0
        ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${article.collectionId}/${article.id}/${galleryImages[0]}`
        : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'

    const fileUrl = (img: string) => `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${article.collectionId}/${article.id}/${img}`

    const layout = article.layout || 'default'

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title={business?.name ? `Spotlight: ${business.name}` : 'Spotlight Article'}
                subtitle="An in-depth look at one of Bushbuckridge's leading businesses"
                badge="SPOTLIGHT FEATURE"
                backgroundImage={heroImage}
            />

            {layout === 'hero_top' && (
                <>
                    <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroImage} alt={business?.name || 'Spotlight'} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-10">
                            <Badge className="bg-secondary text-secondary-foreground font-black text-xs px-4 py-1.5 mb-3 shadow-lg">SPOTLIGHT FEATURE</Badge>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">{business?.name || 'Featured Business'}</h1>
                        </div>
                    </section>
                    <div className="container mx-auto px-4 -mt-16 relative z-20 max-w-3xl">
                        <div className="mb-8">
                            <Button variant="ghost" size="sm" asChild className="font-bold text-muted-foreground hover:text-primary">
                                <Link href="/articles"><ArrowLeft className="h-4 w-4 mr-2" /> All Spotlight Articles</Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-primary/10">
                            {business && (
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>{business.expand?.sector?.name || 'Local Business'}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{article.created ? new Date(article.created).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Featured Article'}</span>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 font-black text-xs">
                                {article.layout === 'hero_top' ? 'Hero Layout' : article.layout === 'gallery_grid' ? 'Gallery Layout' : 'Standard'}
                            </Badge>
                        </div>

                        <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold prose-img:rounded-2xl mt-8"
                            dangerouslySetInnerHTML={{ __html: article.content || '<p>This spotlight article is currently being prepared by the editorial team.</p>' }} />

                        {galleryImages.length > 1 && (
                            <div className="pt-8 border-t border-primary/10">
                                <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-6">Photo Gallery</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {galleryImages.slice(1).map((img: string, i: number) => (
                                        <div key={img} className="rounded-[1.5rem] overflow-hidden h-48 shadow-lg group border-2 border-primary/5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={fileUrl(img)} alt={`${business?.name || 'Spotlight'} gallery image ${i + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {business && (
                            <div className="bg-primary/5 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-primary/10 mt-10">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black tracking-tight text-primary mb-2">Visit {business.name}</h3>
                                    <p className="text-muted-foreground font-medium">Explore the full business profile, contact details, gallery, and more on the directory.</p>
                                </div>
                                <Button asChild className="h-14 px-8 rounded-2xl font-black text-lg bg-primary text-white shadow-lg shadow-primary/20 shrink-0">
                                    <Link href={`/business/${business.id}`}>View Full Profile <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {layout === 'gallery_grid' && (
                <>
                    <div className="container mx-auto px-4 mt-8 max-w-6xl relative z-20">
                        <div className="mb-8">
                            <Button variant="ghost" size="sm" asChild className="font-bold text-muted-foreground hover:text-primary">
                                <Link href="/articles"><ArrowLeft className="h-4 w-4 mr-2" /> All Spotlight Articles</Link>
                            </Button>
                        </div>

                        {galleryImages.length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-6">Photo Gallery</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {galleryImages.map((img: string, index: number) => {
                                        if (index === 0) {
                                            return (
                                                <div key={img} className="relative overflow-hidden rounded-[3rem] shadow-2xl md:col-span-2 md:row-span-2 h-72 md:h-[28rem] group border-2 border-primary/5">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={fileUrl(img)} alt={`${business?.name || 'Spotlight'} hero`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                    <div className="absolute bottom-6 left-8 right-8 z-10">
                                                        <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{business?.name || 'Spotlight'}</h2>
                                                    </div>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div key={img} className="rounded-[2rem] overflow-hidden h-64 md:h-80 shadow-lg group border-2 border-primary/5">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={fileUrl(img)} alt={`${business?.name || 'Spotlight'} gallery image ${index}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-primary/10 mb-8">
                            {business && (
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>{business.expand?.sector?.name || 'Local Business'}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{article.created ? new Date(article.created).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Featured Article'}</span>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 font-black text-xs">
                                {article.layout === 'hero_top' ? 'Hero Layout' : article.layout === 'gallery_grid' ? 'Gallery Layout' : 'Standard'}
                            </Badge>
                        </div>

                        <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold prose-img:rounded-2xl"
                            dangerouslySetInnerHTML={{ __html: article.content || '<p>This spotlight article is currently being prepared by the editorial team.</p>' }} />

                        {business && (
                            <div className="bg-primary/5 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-primary/10 mt-10">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black tracking-tight text-primary mb-2">Visit {business.name}</h3>
                                    <p className="text-muted-foreground font-medium">Explore the full business profile, contact details, gallery, and more on the directory.</p>
                                </div>
                                <Button asChild className="h-14 px-8 rounded-2xl font-black text-lg bg-primary text-white shadow-lg shadow-primary/20 shrink-0">
                                    <Link href={`/business/${business.id}`}>View Full Profile <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {layout === 'default' && (
                <div className="container mx-auto px-4 -mt-12 relative z-20 max-w-4xl">
                    <div className="mb-8">
                        <Button variant="ghost" size="sm" asChild className="font-bold text-muted-foreground hover:text-primary">
                            <Link href="/articles"><ArrowLeft className="h-4 w-4 mr-2" /> All Spotlight Articles</Link>
                        </Button>
                    </div>

                    <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
                        <div className="relative h-72 md:h-96 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={heroImage} alt={business?.name || 'Spotlight'} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-8 right-8">
                                <Badge className="bg-secondary text-secondary-foreground font-black text-xs px-4 py-1.5 mb-3 shadow-lg">SPOTLIGHT FEATURE</Badge>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{business?.name || 'Featured Business'}</h1>
                            </div>
                        </div>

                        <CardContent className="p-8 md:p-12 space-y-10">
                            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-primary/10">
                                {business && (
                                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span>{business.expand?.sector?.name || 'Local Business'}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>{article.created ? new Date(article.created).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Featured Article'}</span>
                                </div>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 font-black text-xs">
                                    {article.layout === 'hero_top' ? 'Hero Layout' : article.layout === 'gallery_grid' ? 'Gallery Layout' : 'Standard'}
                                </Badge>
                            </div>

                            <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold prose-img:rounded-2xl"
                                dangerouslySetInnerHTML={{ __html: article.content || '<p>This spotlight article is currently being prepared by the editorial team.</p>' }} />

                            {galleryImages.length > 1 && (
                                <div className="pt-8 border-t border-primary/10">
                                    <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-6">Photo Gallery</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {galleryImages.slice(1).map((img: string, i: number) => (
                                            <div key={img} className="rounded-[1.5rem] overflow-hidden h-48 shadow-lg group border-2 border-primary/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={fileUrl(img)} alt={`${business?.name || 'Spotlight'} gallery image ${i + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {business && (
                                <div className="bg-primary/5 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-primary/10">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black tracking-tight text-primary mb-2">Visit {business.name}</h3>
                                        <p className="text-muted-foreground font-medium">Explore the full business profile, contact details, gallery, and more on the directory.</p>
                                    </div>
                                    <Button asChild className="h-14 px-8 rounded-2xl font-black text-lg bg-primary text-white shadow-lg shadow-primary/20 shrink-0">
                                        <Link href={`/business/${business.id}`}>View Full Profile <ArrowRight className="ml-2 h-5 w-5" /></Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}