import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Star, Phone, CheckCircle2 } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link'

export default async function DirectoryPage({
    searchParams,
}: {
    searchParams: { q?: string; sector?: string; area?: string }
}) {
    const supabase = await createClient()

    // 1. Fetch Taxonomies for Filters
    const { data: sectors } = await supabase.from('sectors').select('id, name').order('name')
    const { data: areas } = await supabase.from('areas').select('id, name').order('name')

    // 2. Build the Query for Businesses
    let query = supabase
        .from('businesses')
        .select(`
      *,
      sectors ( name ),
      areas ( name )
    `)
        .eq('status', 'active')

    if (searchParams.q) {
        query = query.ilike('name', `%${searchParams.q}%`)
    }
    if (searchParams.sector && searchParams.sector !== 'all') {
        query = query.eq('sector_id', searchParams.sector)
    }
    if (searchParams.area && searchParams.area !== 'all') {
        query = query.eq('area_id', searchParams.area)
    }

    // 3. Sorting Logic: Featured first, then Premium -> Enhanced -> Standard
    // Note: For a true manual sort order in Supabase without a custom RPC, 
    // you often sort by an integer rank, or handle the specific tiered sorting in memory.
    // For this MVP, we will sort by featured flag, then package tier descending.
    query = query
        .order('is_featured', { ascending: false })
        .order('package_tier', { ascending: false })
        .order('name', { ascending: true })

    const { data: businesses, error } = await query

    return (
        <div className="container mx-auto px-4 py-12 flex flex-col gap-8">
            {/* Header & Filter Section */}
            <section className="bg-muted/30 rounded-2xl p-6 md:p-8 space-y-6 border">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Business Directory</h1>
                    <p className="text-muted-foreground">Find verified local businesses, services, and professionals in Bushbuckridge.</p>
                </div>

                <form className="grid gap-4 md:grid-cols-4 lg:grid-cols-5 items-end">
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-sm font-medium">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="q"
                                defaultValue={searchParams.q}
                                placeholder="Business name or keyword..."
                                className="pl-9 h-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sector</label>
                        <Select name="sector" defaultValue={searchParams.sector || 'all'}>
                            <SelectTrigger className="h-10">
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
                        <label className="text-sm font-medium">Area</label>
                        <Select name="area" defaultValue={searchParams.area || 'all'}>
                            <SelectTrigger className="h-10">
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

                    <Button type="submit" className="h-10 w-full">Filter</Button>
                </form>
            </section>

            {/* Results Grid */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">{businesses?.length || 0} Businesses Found</h2>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-200">
                        Failed to load directory. Please try again.
                    </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {businesses?.map((biz) => (
                        <Card key={biz.id} className={`flex flex-col overflow-hidden transition-all hover:shadow-md ${biz.is_featured ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                            {biz.package_tier === 'premium' && (
                                <div className="h-32 bg-muted relative flex items-center justify-center">
                                    {biz.logo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={biz.logo_url} alt={biz.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-muted-foreground pb-4">{biz.name[0]}</span>
                                    )}
                                    {biz.is_featured && (
                                        <Badge className="absolute top-3 right-3 shadow-md bg-yellow-500 hover:bg-yellow-600 text-white border-0">
                                            <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <CardHeader className="pb-3 flex-1">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="line-clamp-2 text-lg">{biz.name}</CardTitle>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1 text-primary/80">
                                    <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                                    <span className="truncate">{biz.areas?.name || 'Local Area'}</span>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="font-normal">{biz.sectors?.name}</Badge>
                                    {biz.is_verified && (
                                        <Badge variant="outline" className="font-normal text-green-600 border-green-200 bg-green-50">
                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                {biz.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {biz.description}
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0 flex flex-col gap-2 mt-auto">
                                {biz.whatsapp && (
                                    <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white" asChild>
                                        <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                                            WhatsApp Us
                                        </a>
                                    </Button>
                                )}
                                {biz.phone && !biz.whatsapp && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={`tel:${biz.phone}`}>
                                            <Phone className="h-4 w-4 mr-2" /> Call Us
                                        </a>
                                    </Button>
                                )}
                                {biz.package_tier !== 'standard' && (
                                    <Button variant="ghost" className="w-full text-xs text-muted-foreground h-8" asChild>
                                        <Link href={`/spotlight/${biz.id}`}>View Full Profile</Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}

                    {businesses?.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No businesses found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                We couldn't find any businesses matching your filters. Try adjusting your search criteria.
                            </p>
                            <Button variant="outline" asChild className="mt-4">
                                <Link href="/directory">Clear all filters</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
