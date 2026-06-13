import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import SubscriptionActionsMenu from './SubscriptionActionsMenu'

export default async function AdminSubscriptionsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await requireAdmin()
    const pb = await createClient()

    const resolvedParams = await searchParams
    const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

    let subscriptions: any[] = []
    try {
        subscriptions = await pb.collection('subscriptions').getFullList({
            expand: 'business',
        })

        if (q) {
            subscriptions = subscriptions.filter(sub => {
                const bizName = (sub.expand?.business?.name || '').toLowerCase()
                const tier = (sub.tier || '').toLowerCase()
                const status = (sub.status || '').toLowerCase()
                return bizName.includes(q) || tier.includes(q) || status.includes(q)
            })
        }
    } catch (e) {
        console.error('Failed to fetch subscriptions', e)
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary">Subscriptions & Billing</h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">Manage business packages and recurring billing status.</p>
                </div>
                <form method="get" className="flex items-center gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search subscriptions..."
                        className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
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
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Amount</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Start Date</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Renewal</TableHead>
                                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs text-primary/40">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions?.map((sub) => (
                                <TableRow key={sub.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8 font-bold text-primary">{sub.expand?.business?.name || 'Unknown'}</TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="outline" className="capitalize rounded-xl">{sub.tier}</Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="secondary" className={`capitalize rounded-xl ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-bold text-primary">
                                        {sub.amount_cents ? `R ${(sub.amount_cents / 100).toFixed(2)}` : '—'}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {sub.created ? format(new Date(sub.created), 'MMM d, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {sub.expires_at ? format(new Date(sub.expires_at), 'MMM d, yyyy') : 'No Expiry'}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <SubscriptionActionsMenu subscription={sub} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!subscriptions || subscriptions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground font-medium">No subscriptions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}