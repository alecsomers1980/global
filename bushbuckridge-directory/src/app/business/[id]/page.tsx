import { createClient } from '@/utils/pocketbase/server'
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
    Briefcase,
    Newspaper,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'
import { trackAnalyticsEvent } from '@/app/actions/analytics'
import { TrackLink } from '@/components/TrackLink'
import GalleryLightbox from '@/components/GalleryLightbox'

export default async function BusinessProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const pb = await createClient()
    const { id } = await params;

    let business: any = null
    try {
      business = await pb.collection('businesses').getOne(id, {
        expand: 'sector,area',
      })
    } catch (e) {
      notFound()
    }

    const logoUrl = business.logo 
      ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${business.collectionId}/${business.id}/${business.logo}`
      : 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop';

    // Record Profile View (fire and forget)
    trackAnalyticsEvent(business.id, 'profile_view')

    const isEnhancedOrPremium = business.package_tier === 'pro-lead' || business.package_tier === 'pro-business';
    const isPremium = business.package_tier === 'pro-business';
    const galleryArray = Array.isArray(business.gallery) 
        ? business.gallery 
        : (typeof business.gallery === 'string' && business.gallery ? [business.gallery] : []);

    // Fetch spotlight article for this business (premium only)
    let spotlightArticle: any = null
    if (isPremium) {
        try {
            spotlightArticle = await pb.collection('spotlight_articles').getFirstListItem(
                `business_id = "${business.id}" && status = "published"`
            )
        } catch (e) {
            // No spotlight article exists
        }
    }

    return (
        <div className="flex flex-col pb-24">
            <SecondaryHeader
                title={business.name}
                subtitle={business.description?.substring(0, 150) + (business.description?.length > 150 ? '...' : '')}
                badge={business.expand?.sector?.name || 'BUSINESS PROFILE'}
                backgroundImage={logoUrl}
            />

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
                            <CardHeader className="p-10 pb-2">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="h-24 w-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={logoUrl}
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
                                    <MapPin className="h-5 w-5 mr-2 text-primary" /> {business.expand?.area?.name || 'Bushbuckridge'}
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

                                {isEnhancedOrPremium && galleryArray.length > 0 && (
                                    <div className="mt-12">
                                        <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-6">
                                            {isPremium ? 'Business Gallery' : 'Featured Image'}
                                        </h3>
                                        <GalleryLightbox
                                            images={(isPremium ? galleryArray : [galleryArray[0]]).map((img: string) =>
                                                `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${business.collectionId}/${business.id}/${img}`
                                            )}
                                            businessName={business.name}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Spotlight Article Cross-Link */}
                        {isPremium && spotlightArticle && (
                            <Link href={`/articles/${spotlightArticle.id}`} className="group block">
                                <div className="relative bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-[3rem] p-8 md:p-10 overflow-hidden shadow-2xl border border-emerald-400/10">
                                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-60 h-60 bg-secondary/10 rounded-full blur-[80px] animate-pulse" />
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="h-16 w-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <Newspaper className="h-8 w-8 text-secondary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Badge className="bg-secondary text-secondary-foreground font-black text-[10px] px-3 py-1 mb-2 shadow-lg">SPOTLIGHT FEATURE</Badge>
                                            <h3 className="text-xl font-black text-white tracking-tight mb-1">Read our In-Depth Spotlight</h3>
                                            <p className="text-white/60 font-medium text-sm line-clamp-1">Discover the full story behind {business.name}</p>
                                        </div>
                                        <ArrowRight className="h-6 w-6 text-secondary shrink-0 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        )}

                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        <div className="bg-primary/5 backdrop-blur-md border rounded-[3rem] p-10 lg:sticky lg:top-32 shadow-xl">
                            <h3 className="font-black text-2xl mb-8 tracking-tight text-primary">Connect with <span className="text-secondary italic">Us</span></h3>

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

                                {isEnhancedOrPremium && business.website && (
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
                                {isEnhancedOrPremium && business.whatsapp && (
                                    <Button className="col-span-2 h-16 bg-[#25D366] hover:bg-[#1ea855] text-white font-black text-lg rounded-2xl shadow-lg shadow-green-600/20" asChild>
                                        <TrackLink href={`https://wa.me/${business.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} businessId={business.id} eventType="whatsapp_click" target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-5 w-5 mr-3" /> WhatsApp
                                        </TrackLink>
                                    </Button>
                                )}

                                {isEnhancedOrPremium && business.facebook && (
                                    <Button variant="outline" className="h-14 w-full rounded-2xl border-[#1877F2]/20 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 shadow-sm font-bold text-[#1877F2] gap-3" asChild>
                                        <a href={business.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /> Facebook</a>
                                    </Button>
                                )}
                                {isEnhancedOrPremium && business.instagram && (
                                    <Button variant="outline" className="h-14 w-full rounded-2xl border-[#E4405F]/20 bg-[#E4405F]/5 hover:bg-[#E4405F]/10 shadow-sm font-bold text-[#E4405F] gap-3" asChild>
                                        <a href={business.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /> Instagram</a>
                                    </Button>
                                )}
                                {isEnhancedOrPremium && business.linkedin && (
                                    <Button variant="outline" className="h-14 w-full rounded-2xl border-[#0A66C2]/20 bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 shadow-sm font-bold text-[#0A66C2] gap-3" asChild>
                                        <a href={business.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5" /> LinkedIn</a>
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
