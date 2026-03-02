import { requireAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import BusinessActionsMenu from './BusinessActionsMenu'

export default async function AdminBusinessesPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: businesses, error } = await supabase
        .from('businesses')
        .select(`
            id, name, status, package_tier, is_verified, created_at,
            sectors (name), areas (name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-xl">Error loading businesses: {error.message}</div>
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Business Directory</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage all listings, change tiers, and verify businesses.</p>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Businesses</CardTitle>
                    <CardDescription className="text-base font-medium">Click the actions menu to modify a listing.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Business Name</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Sector & Area</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Status</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Tier</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Joined</TableHead>
                                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs text-primary/40">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses?.map((biz) => (
                                <TableRow key={biz.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-primary text-base">{biz.name}</span>
                                            {biz.is_verified && <span className="text-[10px] text-emerald-600 font-extrabold uppercase mt-1 tracking-widest">Verified Partner</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-muted-foreground">{(biz.sectors as any)?.name || 'N/A'}</span>
                                            <span className="text-xs text-muted-foreground/60 font-medium">{(biz.areas as any)?.name || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="outline" className={`rounded-xl px-3 py-1 font-bold capitalize ${biz.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                biz.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {biz.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="secondary" className={`rounded-xl px-3 py-1 font-bold capitalize ${biz.package_tier === 'premium' ? 'bg-secondary/20 text-secondary-foreground' :
                                                biz.package_tier === 'enhanced' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-muted text-muted-foreground'
                                            }`}>
                                            {biz.package_tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {format(new Date(biz.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <BusinessActionsMenu business={biz} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
