import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Facebook,
    Instagram,
    Linkedin,
    MessageCircle,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    Briefcase
} from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'
import { trackAnalyticsEvent } from '@/app/actions/analytics'
import { TrackLink } from '@/components/TrackLink'

export default async function BusinessProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params;

    const { data: business, error } = await supabase
        .from('businesses')
        .select(`
            *,
            sectors (name),
            areas (name),
            posts (*)
        `)
        .eq('id', id)
        .single()

    if (error || !business) {
        notFound()
    }

    // Record Profile View (fire and forget)
    trackAnalyticsEvent(business.id, 'profile_view')

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title={business.name}
                subtitle={business.description?.substring(0, 150) + (business.description?.length > 150 ? '...' : '')}
                badge={business.sectors?.name || 'BUSINESS PROFILE'}
                backgroundImage={business.logo_url || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2000&auto=format&fit=crop'}
            />

            <div className="container mx-auto px-4 -mt-32 relative z-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-2">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-24 w-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={business.logo_url || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop'}
                                            alt={business.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    {business.is_verified && (
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Verified Business
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-4xl font-black tracking-tight text-primary">{business.name}</CardTitle>
                                <div className="flex items-center text-lg font-bold text-muted-foreground mt-2">
                                    <MapPin className="h-5 w-5 mr-2 text-primary" /> {business.areas?.name}
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 pt-6">
                                <div className="prose prose-xl max-w-none">
                                    <p className="text-muted-foreground/90 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                                        {business.description || "Information about this business is coming soon. We are currently verifying the full details to provide you with the most accurate experience."}
                                    </p>
                                </div>

                                {business.services_tags && business.services_tags.length > 0 && (
                                    <div className="mt-12">
                                        <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-6">Specializations</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {business.services_tags.map((tag: string) => (
                                                <Badge key={tag} variant="secondary" className="px-5 py-2 rounded-xl bg-primary/5 text-primary font-bold border-0">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Associated Spotlight Articles */}
                        {business.posts && business.posts.length > 0 && (
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black tracking-tight text-primary flex items-center gap-3">
                                    <Sparkles className="h-8 w-8 text-secondary" /> Feature Stories
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-8">
                                    {business.posts.map((post: any) => (
                                        <Card key={post.id} className="group overflow-hidden border-0 bg-card/40 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[2.5rem]">
                                            <div className="relative h-48 overflow-hidden">
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                                    style={{ backgroundImage: `url('${post.image_url || '/hero.png'}')` }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            </div>
                                            <CardHeader className="p-8">
                                                <CardTitle className="text-xl font-black tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </CardTitle>
                                                <Button variant="link" asChild className="p-0 h-auto mt-4 text-primary font-bold">
                                                    <Link href={`/spotlight/${post.slug}`}>
                                                        Read Story <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        <div className="bg-primary/5 backdrop-blur-md border rounded-[3rem] p-10 lg:sticky lg:top-32 shadow-xl">
                            <h3 className="font-black text-2xl mb-8 tracking-tight text-primary">Connect with <br /><span className="text-secondary italic">Us</span></h3>

                            <div className="space-y-6">
                                {business.phone && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-primary/5 group hover:border-primary/20 transition-all">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Phone Number</p>
                                            <TrackLink href={`tel:${business.phone}`} businessId={business.id} eventType="phone_click" className="font-black text-lg block hover:text-primary transition-colors">{business.phone}</TrackLink>
                                        </div>
                                    </div>
                                )}

                                {business.email && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-primary/5 group hover:border-primary/20 transition-all">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Email Address</p>
                                            <a href={`mailto:${business.email}`} className="font-black text-base block truncate">{business.email}</a>
                                        </div>
                                    </div>
                                )}

                                {business.website && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-primary/5 group hover:border-primary/20 transition-all">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                            <Globe className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Official Website</p>
                                            <TrackLink href={business.website} businessId={business.id} eventType="website_click" target="_blank" rel="noopener noreferrer" className="font-black text-base block truncate hover:text-primary transition-colors">{business.website.replace(/^https?:\/\//, '')}</TrackLink>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-primary/10">
                                {business.whatsapp && (
                                    <Button className="col-span-2 h-16 bg-[#25D366] hover:bg-[#1ea855] text-white font-black text-lg rounded-2xl shadow-lg shadow-green-600/20" asChild>
                                        <TrackLink href={`https://wa.me/${business.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} businessId={business.id} eventType="whatsapp_click" target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-5 w-5 mr-3" /> WhatsApp
                                        </TrackLink>
                                    </Button>
                                )}

                                {business.facebook && (
                                    <Button variant="outline" size="icon" className="h-16 w-full rounded-2xl border-primary/5 bg-white/50 shadow-sm" asChild>
                                        <a href={business.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-6 w-6 text-primary/40" /></a>
                                    </Button>
                                )}
                                {business.instagram && (
                                    <Button variant="outline" size="icon" className="h-16 w-full rounded-2xl border-primary/5 bg-white/50 shadow-sm" asChild>
                                        <a href={business.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-6 w-6 text-primary/40" /></a>
                                    </Button>
                                )}
                            </div>

                            <div className="mt-12 pt-8 border-t border-primary/10 text-center">
                                <p className="text-xs font-black text-primary/20 uppercase tracking-[0.2em] mb-4">Verification Status</p>
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${business.is_verified ? 'bg-emerald-500' : 'bg-amber-400'} animate-pulse`} />
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                        {business.is_verified ? 'Verified Active Partner' : 'Listing Status: Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action */}
                        <div className="bg-secondary p-10 rounded-[3rem] shadow-2xl shadow-secondary/20 relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Briefcase className="h-48 w-48 text-secondary-foreground" />
                            </div>
                            <h4 className="text-2xl font-black tracking-tight text-secondary-foreground mb-4">Partner with us</h4>
                            <p className="text-secondary-foreground/70 font-bold mb-8 relative z-10">
                                Interested in featuring your business or exploring corporate collaboration?
                            </p>
                            <Button className="w-full h-14 bg-white text-primary font-black rounded-2xl hover:bg-white/90 relative z-10" asChild>
                                <Link href="/enquiries">Get in touch</Link>
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
