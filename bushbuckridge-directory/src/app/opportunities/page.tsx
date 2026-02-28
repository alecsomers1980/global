import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, isPast } from 'date-fns'
import { Briefcase, AlertCircle, Download, ExternalLink } from 'lucide-react'

export default async function OpportunitiesPage() {
    const supabase = await createClient()

    const { data: opps, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('deadline', { ascending: true })

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Funding': return 'bg-green-100 text-green-700 hover:bg-green-200'
            case 'Tenders': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            case 'Training': return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Business Opportunities</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Browse active tenders, funding applications, and business support programs available to enterprises in the region.
                </p>
            </div>

            {error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">Failed to load opportunities.</div>
            ) : opps?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No active opportunities</h3>
                    <p className="text-muted-foreground">We continually update this section as new tenders and funding become available.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opps?.map((opp) => {
                        const closingSoon = opp.deadline && !isPast(new Date(opp.deadline)) &&
                            (new Date(opp.deadline).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000)
                        const closed = opp.deadline && isPast(new Date(opp.deadline))

                        return (
                            <Card key={opp.id} className={`flex flex-col ${closed ? 'opacity-60 saturate-50' : ''}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <Badge className={`${getCategoryColor(opp.category)} border-0`}>{opp.category}</Badge>
                                        {closingSoon && (
                                            <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                                <AlertCircle className="h-3 w-3 mr-1" /> Closing Soon
                                            </span>
                                        )}
                                        {closed && (
                                            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full border">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{opp.title}</CardTitle>

                                    {opp.deadline && (
                                        <div className="text-sm font-medium mt-2">
                                            Deadline: <span className={closed ? 'text-red-500 line-through' : 'text-foreground'}>
                                                {format(new Date(opp.deadline), 'MMM d, yyyy - h:mm a')}
                                            </span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        {opp.contact_info}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0 gap-2">
                                    {opp.attachment_url && (
                                        <Button variant="secondary" className="flex-1 border" disabled={closed} asChild>
                                            <a href={opp.attachment_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" /> Doc
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="outline" className="flex-1" disabled={closed}>
                                        Apply <ExternalLink className="h-3 w-3 ml-2" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
