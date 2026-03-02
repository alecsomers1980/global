import { requireAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminEventsPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Events Management</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage all local events on the platform.</p>
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
