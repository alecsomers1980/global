import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronLeft, MessageCircle, Phone, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function SpotlightDetailPage({
    params,
}: {
    params: { slug: string }
}) {
    const supabase = await createClient()

    const { data: post, error } = await supabase
        .from('posts')
        .select(`
            *,
            businesses (
                *,
                sectors (name),
                areas (name)
            )
        `)
        .eq('slug', params.slug)
        .single()

    if (error || !post) {
        notFound()
    }

    const business = Array.isArray(post.businesses) ? post.businesses[0] : post.businesses

    return (
        <article className="container mx-auto px-4 py-12 max-w-4xl">
            <Button variant="ghost" asChild className="mb-8 pl-0 text-muted-foreground hover:text-primary">
                <Link href="/spotlight">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Spotlight
                </Link>
            </Button>

            <header className="mb-10 text-center md:text-left">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                    <Badge variant="secondary">{business?.sectors?.name || 'Local Business'}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {format(new Date(post.created_at), 'MMMM d, yyyy')}
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-6">
                    {post.title}
                </h1>
            </header>

            {post.image_url && (
                <div className="relative aspect-video mb-12 rounded-2xl overflow-hidden border shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="md:col-span-2 prose prose-lg prose-primary max-w-none">
                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {post.content}
                    </div>
                </div>

                {/* Sidebar Info */}
                <aside className="space-y-6">
                    <div className="bg-muted/30 border rounded-2xl p-6 shadow-sm sticky top-24">
                        <h3 className="font-bold text-lg mb-4">About this Business</h3>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-primary/70 uppercase tracking-wider mb-1">Business Name</h4>
                                <p className="font-medium">{business?.name}</p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-primary/70 uppercase tracking-wider mb-1">Area</h4>
                                <p className="text-sm">{business?.areas?.name}</p>
                            </div>

                            <div className="pt-4 border-t space-y-3">
                                {business?.whatsapp && (
                                    <Button className="w-full bg-[#25D366] hover:bg-[#1ea855] text-white" asChild>
                                        <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us
                                        </a>
                                    </Button>
                                )}
                                {business?.phone && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`tel:${business.phone}`}>
                                            <Phone className="h-4 w-4 mr-2" /> Call Now
                                        </a>
                                    </Button>
                                )}
                                <Button variant="link" asChild className="w-full justify-start pl-0">
                                    <Link href="/buy-your-spot" className="text-xs group text-muted-foreground hover:text-primary">
                                        Is this your business? Update your listing <ArrowRight className="ml-1 h-3 w-3 inline transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </article>
    )
}
