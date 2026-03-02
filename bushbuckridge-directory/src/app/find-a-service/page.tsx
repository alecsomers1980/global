import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Search, Phone, MessageCircle, CheckCircle2, Globe, Mail, Facebook, Instagram, Linkedin } from 'lucide-react'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'

export default async function FindServicePage({
    searchParams,
}: {
    searchParams: { q?: string; sector?: string; area?: string }
}) {
    const supabase = await createClient()

    const { data: sectors } = await supabase.from('sectors').select('id, name').order('name')
    const { data: areas } = await supabase.from('areas').select('id, name').order('name')

    let query = supabase
        .from('businesses')
        .select('*, sectors(name), areas(name)')
        .eq('status', 'active')

    if (searchParams.q) {
        query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
    }
    if (searchParams.sector && searchParams.sector !== 'all') {
        query = query.eq('sector_id', searchParams.sector)
    }
    if (searchParams.area && searchParams.area !== 'all') {
        query = query.eq('area_id', searchParams.area)
    }

    const { data: businesses } = await query.order('is_featured', { ascending: false }).order('name')
    const bizList = businesses ?? []

    return (
        <div className="flex flex-col gap-12 pb-24">
            <SecondaryHeader
                title="Find a Service"
                subtitle="Don't know the business name? Just tell us what you need and we'll find the right local service for you."
                badge="LOCAL SERVICES"
            />

            <div className="container mx-auto px-4 -mt-24 relative z-20">
                {/* Search Header */}
                <section className="max-w-4xl mx-auto mb-16">
                    <form className="bg-card/80 backdrop-blur-xl border rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/40" />
                            <Input
                                name="q"
                                defaultValue={searchParams.q}
                                placeholder="e.g. plumber, car wash, accountant, catering..."
                                className="pl-16 h-16 text-lg border-0 shadow-inner bg-muted/50 rounded-2xl focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Sector</label>
                                <Select name="sector" defaultValue={searchParams.sector || 'all'}>
                                    <SelectTrigger className="h-14 bg-muted/30 border-0 rounded-xl text-base font-medium">
                                        <SelectValue placeholder="All Sectors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sectors</SelectItem>
                                        {sectors?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Area</label>
                                <Select name="area" defaultValue={searchParams.area || 'all'}>
                                    <SelectTrigger className="h-14 bg-muted/30 border-0 rounded-xl text-base font-medium">
                                        <SelectValue placeholder="All Areas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Areas</SelectItem>
                                        {areas?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="submit" size="lg" className="h-16 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20">
                            Search Services Now
                        </Button>
                    </form>
                </section>

                {/* Results */}
                <section>
                    {bizList.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-[2rem] border border-dashed flex flex-col items-center justify-center">
                            <div className="p-6 bg-white rounded-full shadow-sm mb-6">
                                <Search className="h-12 w-12 text-primary/20" />
                            </div>
                            <h3 className="text-2xl font-bold">No matching services found</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm">Try a different search term or expand your filters to find local providers.</p>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            <div className="flex items-center justify-between mb-2 px-2">
                                <p className="text-lg font-bold text-primary/80">{bizList.length} service provider{bizList.length !== 1 ? 's' : ''} found</p>
                            </div>
                            <div className="grid gap-6">
                                {bizList.map((biz) => (
                                    <Card key={biz.id} className="group flex flex-col lg:flex-row gap-0 overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-primary/20 rounded-[2.5rem]">
                                        {/* Image Section */}
                                        <div className="lg:w-72 h-64 lg:h-auto bg-muted relative overflow-hidden flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={biz.logo_url || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=800'}
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

                                        {/* Content Section */}
                                        <div className="flex-1 p-8 flex flex-col">
                                            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="px-3 py-0.5 rounded-full font-bold text-xs">
                                                            {(biz.sectors as any)?.name}
                                                        </Badge>
                                                        {biz.is_verified && (
                                                            <span className="flex items-center py-1 px-3 bg-green-50 text-green-700 text-[10px] uppercase tracking-wider font-black rounded-full border border-green-100 italic">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-3xl font-black tracking-tight text-primary leading-tight group-hover:text-secondary transition-colors line-clamp-1">{biz.name}</h3>
                                                    <div className="flex items-center text-sm font-bold text-muted-foreground mt-1">
                                                        <MapPin className="h-4 w-4 mr-1 text-primary" />{(biz.areas as any)?.name}
                                                    </div>
                                                </div>
                                            </div>

                                            {biz.description && (
                                                <p className="text-muted-foreground line-clamp-2 mt-2 mb-6 text-lg font-medium leading-relaxed italic">{biz.description}</p>
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

                                        {/* Action Section */}
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
            </div>
        </div>
    )
}
