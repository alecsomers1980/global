import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronLeft, MessageCircle, Phone, Calendar, ArrowRight, Share2, MapPin, Globe, Facebook, Instagram, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'

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
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title={post.title}
                subtitle={post.excerpt}
                badge={business?.sectors?.name || 'FEATURE ARTICLE'}
                backgroundImage={post.image_url || '/hero.png'}
            />

            <div className="container mx-auto px-4 -mt-32 relative z-20">
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* Main Content */}
                    <article className="lg:col-span-3 bg-card/80 backdrop-blur-xl border rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                                <Share2 className="h-5 w-5 text-primary/40" />
                            </Button>
                        </div>

                        <Link href={`/business/${business?.id}`} className="flex items-center gap-4 mb-12 group/author">
                            <div className="h-14 w-14 rounded-full border-2 border-primary/20 overflow-hidden bg-white shadow-lg p-1 group-hover/author:border-primary transition-colors">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={business?.logo_url || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=200&auto=format&fit=crop'}
                                    alt={business?.name}
                                    className="h-full w-full object-cover rounded-full"
                                />
                            </div>
                            <div>
                                <h3 className="font-black text-primary text-xl tracking-tight leading-none group-hover/author:text-secondary transition-colors">{business?.name}</h3>
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Written on {format(new Date(post.created_at), 'MMMM d, yyyy')}</p>
                            </div>
                        </Link>

                        <div className="prose prose-xl prose-primary max-w-none">
                            <div className="whitespace-pre-wrap text-muted-foreground/90 leading-relaxed font-medium text-lg italic border-l-4 border-secondary/30 pl-8 mb-12">
                                {post.content}
                            </div>
                        </div>

                        <div className="mt-16 pt-12 border-t border-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
                            <Button variant="ghost" asChild className="pl-0 text-muted-foreground hover:text-primary font-bold">
                                <Link href="/spotlight">
                                    <ChevronLeft className="mr-2 h-5 w-5" /> Back to Business Spotlight
                                </Link>
                            </Button>

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-primary/20 uppercase tracking-widest">Share this story</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-primary/10"><Facebook className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-primary/10"><Linkedin className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>
                    </article>

                    {/* Sidebar Info */}
                    <aside className="space-y-8">
                        <div className="bg-primary/5 backdrop-blur-md border rounded-[2.5rem] p-10 sticky top-32 shadow-xl">
                            <h3 className="font-black text-2xl mb-8 tracking-tight text-primary">About the <br /><span className="text-secondary italic">Business</span></h3>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-primary/40 uppercase tracking-widest mb-1">Location</h4>
                                        <p className="font-bold text-lg">{business?.areas?.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/20">
                                    {business?.whatsapp && (
                                        <Button className="w-full h-16 bg-[#25D366] hover:bg-[#1ea855] text-white font-black text-lg rounded-2xl shadow-lg shadow-green-600/20" asChild>
                                            <a href={`https://wa.me/${business.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="h-5 w-5 mr-3" /> WhatsApp Us
                                            </a>
                                        </Button>
                                    )}
                                    {business?.phone && (
                                        <Button variant="outline" className="w-full h-16 font-black text-lg rounded-2xl border-primary/10 bg-white/50" asChild>
                                            <a href={`tel:${business.phone}`}>
                                                <Phone className="h-5 w-5 mr-3 text-primary" /> Call Now
                                            </a>
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        {business?.email && (
                                            <Button variant="outline" size="icon" className="h-14 w-full rounded-2xl border-primary/5" asChild title={business.email}>
                                                <a href={`mailto:${business.email}`}><Mail className="h-5 w-5 text-primary/40" /></a>
                                            </Button>
                                        )}
                                        {business?.website && (
                                            <Button variant="outline" size="icon" className="h-14 w-full rounded-2xl border-primary/5" asChild title="Website">
                                                <a href={business.website} target="_blank" rel="noopener noreferrer"><Globe className="h-5 w-5 text-primary/40" /></a>
                                            </Button>
                                        )}
                                    </div>

                                    <Button variant="link" asChild className="w-full justify-center mt-6">
                                        <Link href={`/business/${business?.id}`} className="text-xs group text-muted-foreground hover:text-primary font-bold">
                                            View Full Business Profile <ArrowRight className="ml-1 h-3 w-3 inline transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
