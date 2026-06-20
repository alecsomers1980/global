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
import BusinessHoursDisplay from '@/components/BusinessHoursDisplay'
import BusinessFaqs from '@/components/BusinessFaqs'
import ReviewsSection from '@/components/ReviewsSection'
import { Clock, Tag, PlayCircle, Award, Calendar, UsersRound } from 'lucide-react'
import type { Metadata } from 'next'
import { buildMetadata, pbFileUrl } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { localBusinessLd, breadcrumbLd } from '@/lib/structured-data'

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    const pb = await createClient()
    try {
        const business: any = await pb.collection('businesses').getOne(id, { expand: 'sector,area' })
        return buildMetadata({
            title: business.name,
            description: business.description || `${business.name} — local business in the Bushbuckridge region.`,
            path: `/business/${id}`,
            image: pbFileUrl(business, business.cover_image) || pbFileUrl(business, business.logo),
        })
    } catch {
        return buildMetadata({ title: 'Business', path: `/business/${id}` })
    }
}

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

    // Reviews enabled for Pro Lead and Pro Business
    let reviews: any[] = []
    if (isEnhancedOrPremium) {
        try {
            reviews = await pb.collection('reviews').getFullList({
                filter: `business = "${business.id}" && status = "approved"`,
                sort: '-created',
            })
        } catch (e) {
            // none
        }
    }

    const coverUrl = business.cover_image
        ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${business.collectionId}/${business.id}/${business.cover_image}`
        : null

    // Build a YouTube/Vimeo embed URL from a watch link
    function toEmbed(url: string): string | null {
        if (!url) return null
        const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
        if (yt) return `https://www.youtube.com/embed/${yt[1]}`
        const vimeo = url.match(/vimeo\.com\/(\d+)/)
        if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
        return null
    }
    const videoEmbed = isPremium && business.video_url ? toEmbed(business.video_url) : null

    const offerActive = isPremium && business.special_offer &&
        (!business.special_offer_expires || new Date(business.special_offer_expires) >= new Date())

    const certs: string[] = isPremium && Array.isArray(business.certifications) ? business.certifications : []
    const services: any[] = Array.isArray(business.services) ? business.services.filter((s: any) => s && (s.name || s.price)) : []

    return (
        <div className="flex flex-col pb-24">
            <JsonLd data={[
                localBusinessLd(business),
                breadcrumbLd([
                    { name: 'Home', path: '/' },
                    { name: 'Find a Service', path: '/find-a-service' },
                    { name: business.name, path: `/business/${business.id}` },
                ]),
            ]} />
            <SecondaryHeader
                title={business.name}
                subtitle={(() => { const plain = (business.description || '').replace(/<[^>]*>/g, '').trim(); return plain.length > 150 ? plain.substring(0, 150) + '...' : plain; })()}
                badge={business.expand?.sector?.name || 'BUSINESS PROFILE'}
                backgroundImage={coverUrl || logoUrl}
            />

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {offerActive && (
                            <div className="flex items-center gap-4 rounded-[2rem] bg-secondary/15 border border-secondary/30 p-6">
                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                                    <Tag className="h-6 w-6 text-secondary-foreground" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Special Offer</p>
                                    <p className="font-black text-primary text-lg leading-tight">{business.special_offer}</p>
                                </div>
                            </div>
                        )}

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
                                <div
                                    className="text-muted-foreground/90 leading-relaxed font-medium text-lg [&_b]:font-bold [&_strong]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                                    dangerouslySetInnerHTML={{ __html: business.description || '<p>Information about this business is coming soon. We are currently verifying the full details to provide you with the most accurate experience.</p>' }}
                                />

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

                        {/* Services */}
                        {services.length > 0 && (
                            <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8">
                                    <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5">Services</h3>
                                    <div className="divide-y divide-primary/5">
                                        {services.map((s: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between py-3">
                                                <span className="font-bold text-primary">{s.name}</span>
                                                {s.price && <span className="font-black text-muted-foreground">{s.price}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Video (Premium) */}
                        {videoEmbed && (
                            <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8">
                                    <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                        <PlayCircle className="h-4 w-4" /> Video
                                    </h3>
                                    <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '56.25%' }}>
                                        <iframe
                                            src={videoEmbed}
                                            className="absolute inset-0 h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title="Business video"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* FAQ (Premium) */}
                        {isPremium && Array.isArray(business.faqs) && business.faqs.length > 0 && (
                            <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8">
                                    <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5">Frequently Asked Questions</h3>
                                    <BusinessFaqs faqs={business.faqs} />
                                </CardContent>
                            </Card>
                        )}

                        {/* Certifications (Premium) */}
                        {certs.length > 0 && (
                            <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8">
                                    <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                        <Award className="h-4 w-4" /> Certifications & Accreditations
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {certs.map((c, i) => (
                                            <Badge key={i} variant="secondary" className="px-5 py-2 rounded-xl bg-primary/5 text-primary font-bold border-0">{c}</Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews (Pro Lead+) */}
                        {isEnhancedOrPremium && (
                            <Card className="border-0 bg-card/60 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-8">
                                    <ReviewsSection businessId={business.id} reviews={reviews} />
                                </CardContent>
                            </Card>
                        )}

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

                        {/* Business Hours */}
                        {business.business_hours && (
                            <div className="bg-card/60 backdrop-blur-md border rounded-[3rem] p-8 shadow-xl">
                                <h3 className="font-black text-lg mb-5 tracking-tight text-primary flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" /> Business Hours
                                </h3>
                                <BusinessHoursDisplay hours={business.business_hours} />
                            </div>
                        )}

                        {/* Years / Team (Premium) */}
                        {isPremium && (business.years_in_business || business.team_size) && (
                            <div className="grid grid-cols-2 gap-4">
                                {business.years_in_business ? (
                                    <div className="bg-card/60 backdrop-blur-md border rounded-3xl p-6 text-center">
                                        <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                                        <p className="text-2xl font-black text-primary">{business.years_in_business}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Years in business</p>
                                    </div>
                                ) : null}
                                {business.team_size ? (
                                    <div className="bg-card/60 backdrop-blur-md border rounded-3xl p-6 text-center">
                                        <UsersRound className="h-6 w-6 text-primary mx-auto mb-2" />
                                        <p className="text-2xl font-black text-primary">{business.team_size}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Team size</p>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Map (Premium) */}
                        {isPremium && business.map_lat && business.map_lng && (
                            <div className="bg-card/60 backdrop-blur-md border rounded-[3rem] p-4 shadow-xl overflow-hidden">
                                <iframe
                                    title="Location map"
                                    className="w-full h-56 rounded-[2rem] border-0"
                                    loading="lazy"
                                    src={`https://maps.google.com/maps?q=${business.map_lat},${business.map_lng}&z=15&output=embed`}
                                />
                                {business.address && (
                                    <p className="text-sm font-bold text-muted-foreground mt-3 px-2 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" /> {business.address}
                                    </p>
                                )}
                            </div>
                        )}

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
