import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, MapPin, Building, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function JobsPage() {
    const supabase = await createClient()

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Local Jobs</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Find employment opportunities from verified businesses operating in Bushbuckridge.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/buy-your-spot">Post a Job (Coming Soon)</Link>
                </Button>
            </div>

            {error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">Failed to load job listings.</div>
            ) : jobs?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No active job listings</h3>
                    <p className="text-muted-foreground">Local businesses haven't posted any jobs recently.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobs?.map((job) => (
                        <Card key={job.id} className="hover:border-primary/50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-4 p-6 items-start sm:items-center">
                                <div className="hidden sm:flex h-16 w-16 bg-muted rounded-lg items-center justify-center shrink-0">
                                    <Building className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="text-xl font-semibold"><Link href={`/jobs/${job.slug}`} className="hover:underline">{job.title}</Link></h3>
                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
                                        {/* Placeholder meta data for layout */}
                                        <span className="flex items-center"><Building className="h-3.5 w-3.5 mr-1" /> Local Business</span>
                                        <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> Bushbuckridge Area</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        Posted {formatDistanceToNow(new Date(job.created_at))} ago
                                    </span>
                                    <Button variant="outline" className="w-full sm:w-auto" asChild>
                                        <Link href={`mailto:${job.contact_info}`}>Apply via Email</Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
