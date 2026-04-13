import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminOpportunitiesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await requireAdmin()
    const pb = await createClient()

    const resolvedParams = await searchParams
    const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

    let opps: any[] = []
    try {
        opps = await pb.collection('opportunities').getFullList()
        
        if (q) {
            opps = opps.filter(opp => 
                (opp.title || '').toLowerCase().includes(q) ||
                (opp.category || '').toLowerCase().includes(q)
            )
        }
    } catch (e) {
        console.error('Failed to fetch opportunities', e)
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary">Opportunities</h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">Manage tenders, funding, and business support opportunities.</p>
                </div>
                <form method="get" className="flex items-center gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search opportunities..."
                        className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Title</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Category</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Deadline</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {opps?.map((opp) => (
                                <TableRow key={opp.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8 font-bold text-primary">{opp.title}</TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="outline" className="rounded-xl">{opp.category}</Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {opp.deadline ? format(new Date(opp.deadline), 'MMM d, yyyy') : 'No Deadline'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!opps || opps.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground font-medium">No opportunities found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
