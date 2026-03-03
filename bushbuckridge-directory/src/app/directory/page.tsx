import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Star, Phone, CheckCircle2, MessageCircle } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'

export default async function DirectoryPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; sector?: string; area?: string }>
}) {
    const supabase = await createClient()
    const resolvedParams = await searchParams;

    // 1. Fetch Taxonomies for Filters
    const { data: sectors } = await supabase.from('sectors').select('id, name').order('name')
    const { data: areas } = await supabase.from('areas').select('id, name').order('name')

    // 2. Build the Query for Businesses
    let query = supabase
        .from('businesses')
        .select(`
            *,
            sectors ( name ),
            areas ( name ),
            posts ( slug )
        `)
        .eq('status', 'active')

    if (resolvedParams.q) {
        query = query.ilike('name', `%${resolvedParams.q}%`)
    }
    if (resolvedParams.sector && resolvedParams.sector !== 'all') {
        query = query.eq('sector_id', resolvedParams.sector)
    }
    if (resolvedParams.area && resolvedParams.area !== 'all') {
        query = query.eq('area_id', resolvedParams.area)
    }

    const { data: fetchedBusinesses, error } = await query

    // Sort: Featured first, then Premium > Enhanced > Standard, then Alphabetical
    const tierWeight: Record<string, number> = { premium: 3, enhanced: 2, standard: 1 }
    const businesses = fetchedBusinesses?.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1

        const weightA = tierWeight[a.package_tier || 'standard'] || 1
        const weightB = tierWeight[b.package_tier || 'standard'] || 1

        if (weightA !== weightB) return weightB - weightA

        return a.name.localeCompare(b.name)
    })

    return (
        <div className="flex flex-col gap-12 pb-24">
            <SecondaryHeader
                title="Business Directory"
                subtitle="Find verified local businesses, services, and professionals in Bushbuckridge."
                badge="DIRECTORY"
            />

            <div className="container mx-auto px-4 -mt-24 relative z-20">
                {/* Header & Filter Section */}
                <section className="bg-card/80 backdrop-blur-xl border rounded-[2rem] p-8 shadow-2xl mb-12">
                    <form className="grid gap-6 md:grid-cols-4 lg:grid-cols-5 items-end">
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                                <Input
                                    name="q"
                                    defaultValue={resolvedParams.q}
                                    placeholder="Business name or keyword..."
                                    className="pl-12 h-14 bg-muted/50 border-0 rounded-xl font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Sector</label>
                            <Select name="sector" defaultValue={resolvedParams.sector || 'all'}>
                                <SelectTrigger className="h-14 bg-muted/30 border-0 rounded-xl font-medium">
                                    <SelectValue placeholder="All Sectors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sectors</SelectItem>
                                    {sectors?.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Area</label>
                            <Select name="area" defaultValue={resolvedParams.area || 'all'}>
                                <SelectTrigger className="h-14 bg-muted/30 border-0 rounded-xl font-medium">
                                    <SelectValue placeholder="All Areas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Areas</SelectItem>
                                    {areas?.map(a => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="h-14 w-full bg-primary hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/10">Apply Filters</Button>
                    </form>
                </section>

                {/* Results Grid */}
                <section>
                    <div className="flex justify-between items-center mb-10 px-2">
                        <h2 className="text-2xl font-black tracking-tight">{businesses?.length || 0} Businesses <span className="text-primary/40">Found</span></h2>
                    </div>

                    {error && (
                        <div className="p-6 text-sm text-red-500 bg-red-50 rounded-[2rem] border border-red-200 shadow-sm mb-8">
                            Failed to load directory. Please refresh the page or try again later.
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {businesses?.map((biz) => (
                            <Card key={biz.id} className={`group flex flex-col overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[2rem] ${biz.is_featured ? 'ring-2 ring-secondary ring-offset-4 ring-offset-background' : ''}`}>
                                {(biz.package_tier === 'premium' || biz.package_tier === 'enhanced') && (
                                    <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                                        {biz.logo_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={biz.logo_url} alt={biz.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="bg-primary/5 h-full w-full flex items-center justify-center">
                                                <span className="text-4xl font-black text-primary/10 select-none uppercase">{biz.name[0]}</span>
                                            </div>
                                        )}
                                        {biz.is_featured && (
                                            <Badge className="absolute top-4 right-4 shadow-lg bg-secondary text-secondary-foreground font-black px-3 py-1 rounded-full border-0">
                                                <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <CardHeader className="pb-3 flex-1 px-8 pt-8">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <CardTitle className="line-clamp-2 text-xl font-bold tracking-tight group-hover:text-primary transition-colors leading-tight">{biz.name}</CardTitle>
                                    </div>
                                    <div className="flex items-center text-sm font-bold text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                        <span className="truncate">{biz.areas?.name || 'Local Area'}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 px-8">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider py-0.5 px-3 rounded-full">{biz.sectors?.name}</Badge>
                                        {biz.is_verified && (
                                            <Badge variant="outline" className="font-bold text-[10px] uppercase tracking-wider py-0.5 px-3 rounded-full text-green-600 border-green-200 bg-green-50/50">
                                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Verified
                                            </Badge>
                                        )}
                                    </div>
                                    {biz.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 font-medium italic leading-relaxed">
                                            {biz.description}
                                        </p>
                                    )}
                                </CardContent>

                                <CardFooter className="px-8 pb-8 pt-4 flex flex-col gap-3 mt-auto">
                                    {biz.whatsapp && (
                                        <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-lg shadow-green-600/10" asChild>
                                            <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us
                                            </a>
                                        </Button>
                                    )}
                                    {!biz.whatsapp && biz.phone && (
                                        <Button variant="outline" className="w-full h-12 font-bold rounded-xl border-primary/10 bg-background/50" asChild>
                                            <a href={`tel:${biz.phone}`}>
                                                <Phone className="h-4 w-4 mr-2 text-primary" /> Call Us
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-primary h-10 rounded-xl" asChild>
                                        <Link href={`/business/${biz.id}`}>
                                            View Full Profile &rarr;
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                        {businesses?.length === 0 && (
                            <div className="col-span-full py-24 text-center space-y-6 bg-muted/30 rounded-[3rem] border border-dashed flex flex-col items-center justify-center">
                                <div className="p-8 bg-white rounded-full shadow-sm">
                                    <Search className="h-12 w-12 text-primary/20" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">No businesses found</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                                        We couldn't find any businesses matching your filters. Try adjusting your search criteria.
                                    </p>
                                </div>
                                <Button variant="outline" asChild className="h-12 px-8 rounded-xl font-bold border-primary/20">
                                    <Link href="/directory">Clear all filters</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
