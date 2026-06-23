import { Fragment } from 'react'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import EnquiryActionsMenu from './EnquiryActionsMenu'

const TYPE_LABELS: Record<string, string> = {
    general: 'General',
    buy_spot: 'Buy Your Spot',
    employer_services: 'Employer Services',
}

const STATUS_STYLES: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    resolved: 'bg-muted text-muted-foreground border-border',
}

function stripHtml(value: string): string {
    return value
        .replace(/<\/(p|div|br)\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

export default async function AdminEnquiriesPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await requireAdmin()
    const pb = await createClient()

    const resolvedParams = await searchParams
    const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

    let enquiries: any[] = []
    try {
        enquiries = await pb.collection('enquiries').getFullList({ sort: '-created' })

        if (q) {
            enquiries = enquiries.filter((e) => {
                const haystack = `${e.business_name || ''} ${e.contact_person || ''} ${e.email || ''} ${TYPE_LABELS[e.type] || e.type}`.toLowerCase()
                return haystack.includes(q)
            })
        }
    } catch (e) {
        console.error('Failed to fetch enquiries', e)
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary">Enquiries</h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">Job posting requests, general enquiries and listing signups.</p>
                </div>
                <form method="get" className="flex items-center gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search enquiries..."
                        className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Enquiries</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Type</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">From</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Contact</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Status</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Received</TableHead>
                                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs text-primary/40">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enquiries?.map((enq) => {
                                const details = enq.details ? stripHtml(enq.details) : ''
                                return (
                                    <Fragment key={enq.id}>
                                        <TableRow className="hover:bg-primary/5 transition-colors border-0 align-top">
                                            <TableCell className="pt-6 pb-3 px-8">
                                                <Badge variant="outline" className="rounded-xl font-bold">{TYPE_LABELS[enq.type] || enq.type}</Badge>
                                            </TableCell>
                                            <TableCell className="pt-6 pb-3 px-4 font-bold text-primary">
                                                {enq.business_name || enq.contact_person || '—'}
                                            </TableCell>
                                            <TableCell className="pt-6 pb-3 px-4 text-sm font-medium text-muted-foreground">
                                                <div>{enq.contact_person}</div>
                                                <div>{enq.email}</div>
                                                <div>{enq.phone}</div>
                                            </TableCell>
                                            <TableCell className="pt-6 pb-3 px-4">
                                                <Badge variant="outline" className={`capitalize rounded-xl font-bold ${STATUS_STYLES[enq.status] || ''}`}>
                                                    {enq.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pt-6 pb-3 px-4 text-sm font-medium text-muted-foreground">
                                                {enq.created ? format(new Date(enq.created), 'MMM d, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell className="pt-6 pb-3 px-8 text-right">
                                                <EnquiryActionsMenu enquiry={enq} />
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-primary/5 transition-colors border-primary/5">
                                            <TableCell colSpan={6} className="pt-0 pb-6 px-8">
                                                <div className="text-[11px] font-black uppercase tracking-widest text-primary/40 mb-1.5">Details</div>
                                                <p className="text-sm font-medium text-muted-foreground whitespace-pre-wrap max-w-3xl">
                                                    {details || '—'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                )
                            })}
                            {(!enquiries || enquiries.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground font-medium">No enquiries found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
