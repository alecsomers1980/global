import { createClient } from '@/utils/pocketbase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    MapPin,
    Search,
    Phone,
    MessageCircle,
    CheckCircle2,
    Globe,
    Mail,
    Facebook,
    Instagram,
    Linkedin,
    Sprout,
    Plane,
    ShoppingBag,
    Truck,
    HardHat,
    Recycle,
    HeartPulse,
    GraduationCap,
    Factory,
    Briefcase,
    ShieldCheck,
    Palette,
    UtensilsCrossed,
    Users,
    ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'

const CATEGORIES = [
    { name: 'Agriculture and Agri-business', icon: Sprout, color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Community and Social Services', icon: Users, color: 'bg-pink-100 text-pink-700' },
    { name: 'Construction and Infrastructure', icon: HardHat, color: 'bg-amber-100 text-amber-700' },
    { name: 'Education and Training', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Food, Beverage and Licensed Trade', icon: UtensilsCrossed, color: 'bg-red-100 text-red-700' },
    { name: 'Health and Wellness', icon: HeartPulse, color: 'bg-rose-100 text-rose-700' },
    { name: 'Manufacturing and Industrial Services', icon: Factory, color: 'bg-slate-100 text-slate-700' },
    { name: 'Media, Creative and Digital Services', icon: Palette, color: 'bg-fuchsia-100 text-fuchsia-700' },
    { name: 'Professional and Business Services', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
    { name: 'Retail and Informal Trade', icon: ShoppingBag, color: 'bg-orange-100 text-orange-700' },
    { name: 'Security, Cleaning and Property Care', icon: ShieldCheck, color: 'bg-teal-100 text-teal-700' },
    { name: 'Tourism and Hospitality', icon: Plane, color: 'bg-sky-100 text-sky-700' },
    { name: 'Transport and Logistics', icon: Truck, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Waste and Environmental Services', icon: Recycle, color: 'bg-lime-100 text-lime-700' },
]

export default async function FindServicePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; category?: string }>
}) {
    const pb = await createClient()
    const resolvedParams = await searchParams;
    const hasFilter = Boolean(resolvedParams.q || resolvedParams.category)

    let fetchedBusinesses: any[] = []

    if (hasFilter) {
        try {
            let filterParts = ['status = "active"']
            if (resolvedParams.q) {
                filterParts.push(`(name ~ "${resolvedParams.q}" || description ~ "${resolvedParams.q}")`)
            }
            if (resolvedParams.category) {
                filterParts.push(`sector.name ~ "${resolvedParams.category}"`)
            }

            const records = await pb.collection('businesses').getFullList({
                filter: filterParts.join(' && '),
                expand: 'sector,area',
            })
            fetchedBusinesses = records
        } catch (e) {
            console.error('Data fetch error', e)
        }
    }

    const tierWeight: Record<string, number> = { 'pro-business': 3, 'pro-lead': 2, basic: 1 }
    const businesses = fetchedBusinesses?.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1

        const weightA = tierWeight[a.package_tier || 'basic'] || 1
        const weightB = tierWeight[b.package_tier || 'basic'] || 1

        if (weightA !== weightB) return weightB - weightA

        return a.name.localeCompare(b.name)
    })

    const bizList = businesses ?? []

    return (
        <div className="flex flex-col gap-12 pb-24">
            <SecondaryHeader
                title="Find a Service"
                subtitle="Don't know the business name? Just tell us what you need and we'll find the right local service for you."
                badge="LOCAL SERVICES"
            />

            <div className="container mx-auto px-4 -mt-8 relative z-20">
                {/* Search Header */}
                <section className="max-w-4xl mx-auto mb-16">
                    <form className="bg-card/80 backdrop-blur-xl border rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/40" />
                            <Input
                                name="q"
                                defaultValue={resolvedParams.q}
                                placeholder="e.g. plumber, car wash, accountant, catering..."
                                className="pl-16 h-16 text-lg border-0 shadow-inner bg-muted/50 rounded-2xl focus-visible:ring-primary/20"
                            />
                        </div>
                        <Button type="submit" size="lg" className="h-16 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20">
                            Search Services Now
                        </Button>
                    </form>
                </section>

                {/* Industry Categories (alphabetical, clickable) */}
                <section className="max-w-6xl mx-auto mb-16">
                    <div className="text-center mb-10">
                        <Badge variant="outline" className="mb-4 px-4 py-1 text-xs font-black uppercase tracking-widest">
                            Browse by Industry
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Explore Local Industries</h2>
                        <p className="text-muted-foreground mt-3 font-medium italic">Choose an industry to see businesses operating in that sector.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon
                            const active = resolvedParams.category === cat.name
                            return (
                                <Link
                                    key={cat.name}
                                    href={`/find-a-service?category=${encodeURIComponent(cat.name)}`}
                                    className={`group flex items-center gap-4 p-5 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all ${active ? 'border-primary ring-2 ring-primary/20' : 'border-border/40 hover:border-primary/40'}`}
                                >
                                    <div className={`p-3 rounded-xl shrink-0 ${cat.color} transition-transform group-hover:scale-110`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-sm text-foreground leading-tight flex-1">{cat.name}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Results */}
                {hasFilter && (
                    <section>
                        {resolvedParams.category && (
                            <div className="flex items-center justify-between mb-6 px-2">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filtered by industry</p>
                                    <h3 className="text-2xl font-black tracking-tight text-primary mt-1">{resolvedParams.category}</h3>
                                </div>
                                <Button variant="ghost" size="sm" asChild className="font-bold">
                                    <Link href="/find-a-service">Clear filter &times;</Link>
                                </Button>
                            </div>
                        )}

                        {bizList.length === 0 ? (
                            <div className="text-center py-20 bg-muted/30 rounded-[2rem] border border-dashed flex flex-col items-center justify-center">
                                <div className="p-6 bg-white rounded-full shadow-sm mb-6">
                                    <Search className="h-12 w-12 text-primary/20" />
                                </div>
                                <h3 className="text-2xl font-bold">No matching services found</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm">Try a different search term or pick another industry above.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <p className="text-lg font-bold text-primary/80">{bizList.length} service provider{bizList.length !== 1 ? 's' : ''} found</p>
                                </div>
                                <div className="grid gap-6">
                                    {bizList.map((biz) => (
                                        <Card key={biz.id} className="group flex flex-col lg:flex-row gap-0 overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/20 rounded-[2.5rem]">
                                            <div className="lg:w-72 h-64 lg:h-auto bg-muted relative overflow-hidden flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={biz.logo
                                                        ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${biz.collectionId}/${biz.id}/${biz.logo}`
                                                        : 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800'}
                                                    alt={biz.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                {biz.is_featured && (
                                                    <Badge className="absolute top-6 left-6 bg-secondary text-secondary-foreground font-bold px-4 py-1 rounded-full shadow-lg">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex-1 p-8 flex flex-col">
                                                <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="secondary" className="px-3 py-0.5 rounded-full font-bold text-xs">
                                                                {biz.expand?.sector?.name || 'Service'}
                                                            </Badge>
                                                            {biz.is_verified && (
                                                                <span className="flex items-center py-1 px-3 bg-green-50 text-green-700 text-[10px] uppercase tracking-wider font-black rounded-full border border-green-100 italic">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="text-3xl font-black tracking-tight text-primary leading-tight group-hover:text-secondary transition-colors line-clamp-1">{biz.name}</h3>
                                                        <div className="flex items-center text-sm font-bold text-muted-foreground mt-1">
                                                            <MapPin className="h-4 w-4 mr-1 text-primary" />{biz.expand?.area?.name || 'Bushbuckridge'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {biz.description && (
                                                    <p className="text-muted-foreground line-clamp-2 mt-2 mb-6 text-lg font-medium leading-relaxed italic">{biz.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')}</p>
                                                )}

                                                <div className="mt-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-4 pt-6 border-t border-primary/5">
                                                    {biz.email && (
                                                        <a href={`mailto:${biz.email}`} className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                                                            <Mail className="h-4 w-4 mr-2 text-primary/40" /> {biz.email}
                                                        </a>
                                                    )}
                                                    {biz.website && (
                                                        <a href={biz.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                                                            <Globe className="h-4 w-4 mr-2 text-primary/40" /> Website
                                                        </a>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        {(biz as any).facebook && (
                                                            <a href={(biz as any).facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all">
                                                                <Facebook className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                        {(biz as any).instagram && (
                                                            <a href={(biz as any).instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all">
                                                                <Instagram className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                        {(biz as any).linkedin && (
                                                            <a href={(biz as any).linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-muted rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all">
                                                                <Linkedin className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-row lg:flex-col justify-center gap-4 p-8 lg:border-l bg-primary/5 min-w-[220px]">
                                                {biz.whatsapp && (
                                                    <Button className="flex-1 h-14 bg-[#25D366] hover:bg-[#1ea855] text-white font-bold rounded-2xl shadow-lg shadow-green-600/20" asChild>
                                                        <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                                                            <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp
                                                        </a>
                                                    </Button>
                                                )}
                                                {biz.phone && (
                                                    <Button variant="outline" className="flex-1 h-14 font-bold rounded-2xl border-primary/20 bg-background/50 backdrop-blur-sm" asChild>
                                                        <a href={`tel:${biz.phone}`}>
                                                            <Phone className="h-5 w-5 mr-2 text-primary" /> Call Now
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" className="flex-1 h-12 text-xs font-bold text-muted-foreground hover:text-primary rounded-xl" asChild>
                                                    <Link href={`/business/${biz.id}`}>
                                                        View Full Profile &rarr;
                                                    </Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}
