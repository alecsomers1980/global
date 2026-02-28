import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Search, Phone, MessageCircle, CheckCircle2 } from 'lucide-react'

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
        // Search business name, description, and service tags
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
        <div className="container mx-auto px-4 py-12 flex flex-col gap-8">
            {/* Search Header */}
            <section className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-3">Find a Service</h1>
                <p className="text-muted-foreground text-lg mb-8">
                    Don't know the business name? Just tell us what you need and we'll find the right local service for you.
                </p>

                <form className="bg-muted/30 border rounded-2xl p-6 space-y-4 text-left">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            name="q"
                            defaultValue={searchParams.q}
                            placeholder="e.g. plumber, car wash, accountant, catering..."
                            className="pl-11 h-12 text-base border-0 shadow-none bg-background rounded-xl"
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <Select name="sector" defaultValue={searchParams.sector || 'all'}>
                            <SelectTrigger className="h-10 bg-background">
                                <SelectValue placeholder="Filter by Sector" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sectors</SelectItem>
                                {sectors?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select name="area" defaultValue={searchParams.area || 'all'}>
                            <SelectTrigger className="h-10 bg-background">
                                <SelectValue placeholder="Filter by Area" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Areas</SelectItem>
                                {areas?.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" size="lg" className="w-full h-12 text-base">
                        <Search className="h-5 w-5 mr-2" /> Search Services
                    </Button>
                </form>
            </section>

            {/* Results */}
            <section>
                {bizList.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                        <h3 className="text-lg font-medium">No matching services found</h3>
                        <p className="text-muted-foreground mt-1">Try a different search term or expand your filters.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground mb-4">{bizList.length} service provider{bizList.length !== 1 ? 's' : ''} found</p>
                        <div className="space-y-4">
                            {bizList.map((biz) => (
                                <Card key={biz.id} className="flex flex-col sm:flex-row gap-0 overflow-hidden hover:border-primary/50 transition-colors">
                                    <div className="flex-1 p-5">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold">{biz.name}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                    <span className="flex items-center text-sm text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5 mr-1" />{biz.areas?.name}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">{biz.sectors?.name}</Badge>
                                                    {biz.is_verified && (
                                                        <span className="flex items-center text-xs text-green-600">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {biz.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{biz.description}</p>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col justify-end gap-3 p-4 sm:border-l sm:min-w-[180px] border-t sm:border-t-0">
                                        {biz.whatsapp && (
                                            <Button className="w-full bg-[#25D366] hover:bg-[#1ea855] text-white" asChild>
                                                <a href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '').replace(/^0/, '27')}`} target="_blank" rel="noopener noreferrer">
                                                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                                                </a>
                                            </Button>
                                        )}
                                        {biz.phone && (
                                            <Button variant="outline" className="w-full" asChild>
                                                <a href={`tel:${biz.phone}`}>
                                                    <Phone className="h-4 w-4 mr-2" /> Call
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}
