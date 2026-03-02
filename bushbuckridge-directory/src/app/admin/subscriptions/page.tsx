import { requireAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminSubscriptionsPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select(`
            id, tier, start_date, end_date, auto_renew, status, created_at,
            businesses (name)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Subscriptions & Billing</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage business packages and recurring billing status.</p>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Subscriptions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Business</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Tier</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Status</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Start Date</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Renewal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions?.map((sub) => (
                                <TableRow key={sub.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8 font-bold text-primary">{(sub.businesses as any)?.name || 'Unknown'}</TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="outline" className="capitalize rounded-xl">{sub.tier}</Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="secondary" className={`capitalize rounded-xl ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {format(new Date(sub.start_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {sub.auto_renew ? 'Auto' : 'Manual'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!subscriptions || subscriptions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground font-medium">No subscriptions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
