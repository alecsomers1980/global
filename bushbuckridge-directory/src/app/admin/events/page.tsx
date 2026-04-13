import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminEventsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await requireAdmin()
    const pb = await createClient()

    const resolvedParams = await searchParams
    const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

    let events: any[] = []
    try {
        events = await pb.collection('events').getFullList({
            sort: '-date',
        })
        
        if (q) {
            events = events.filter(ev => 
                (ev.title || '').toLowerCase().includes(q) ||
                (ev.venue || '').toLowerCase().includes(q)
            )
        }
    } catch (e) {
        console.error('Failed to fetch events', e)
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary">Events Management</h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">Manage all local events on the platform.</p>
                </div>
                <form method="get" className="flex items-center gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search events..."
                        className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Events</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Title</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Date</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Venue</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Featured</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events?.map((ev) => (
                                <TableRow key={ev.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8 font-bold text-primary">{ev.title}</TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {format(new Date(ev.date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">{ev.venue}</TableCell>
                                    <TableCell className="py-6 px-4">
                                        {ev.is_featured ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 shadow-none font-bold">Featured</Badge> : <span className="text-muted-foreground/30">-</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!events || events.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground font-medium">No events found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
