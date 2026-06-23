import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, MapPin, Building, ArrowRight, Clock, Banknote } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'

export default async function JobsPage() {
  const pb = await createClient()
  let jobs: any[] = []
  let error = false
  try {
    const records = await pb.collection('jobs').getList(1, 50, {})
    jobs = records.items
  } catch (e) {
    console.error('Failed to fetch jobs', e)
    error = true
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      <SecondaryHeader
        title="Local Career Opportunities"
        subtitle="Find employment opportunities from verified businesses operating in the Bushbuckridge region."
        badge="JOBS PORTAL"
        backgroundImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop"
      />
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            {error ? (
              <div className="p-8 text-sm text-red-500 bg-red-50 rounded-[2rem] border border-red-200 shadow-sm text-center">
                Failed to load job listings. Please refresh the page.
              </div>
            ) : jobs?.length === 0 ? (
              <div className="text-center py-32 bg-card/60 backdrop-blur-xl rounded-[3.5rem] border border-dashed flex flex-col items-center justify-center">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                  <Briefcase className="h-10 w-10 text-primary/20" />
                </div>
                <h3 className="text-2xl font-black text-primary">No active listings</h3>
                <p className="text-muted-foreground max-w-sm mx-auto font-medium mt-2">
                  Local businesses haven't posted any jobs recently. Check back soon.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-8">
                {jobs?.map((job) => (
                  <Card key={job.id} className="group flex flex-col overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-[2.5rem]">
                    <CardHeader className="p-8 pb-6">
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <Badge className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full border-0">{job.type || 'Full-time'}</Badge>
                        <span className="text-xs font-black text-primary/40 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(job.created))} ago
                        </span>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={`/jobs/${job.slug || job.id}`} className="hover:text-primary transition-colors">{job.title}</Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Building className="h-4 w-4" /> {job.company || 'Local Business'}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location || 'Bushbuckridge Area'}</span>
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <Banknote className="h-3.5 w-3.5" />
                            {job.salary}{job.salary_period ? ` / ${job.salary_period}` : ''}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex-1">
                      {job.description && (
                        <p className="text-muted-foreground font-medium leading-relaxed line-clamp-3">
                          {job.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="p-8 pt-0 gap-4 flex-col">
                      <Button className="h-14 w-full bg-primary hover:bg-primary/90 rounded-2xl font-black shadow-lg shadow-primary/10 transition-all active:scale-95" asChild>
                        <Link href={`/jobs/${job.slug || job.id}`}>
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <aside className="lg:w-96 space-y-8">
            <div className="bg-primary/5 backdrop-blur-xl border border-primary/5 p-10 rounded-[2.5rem] sticky top-32">
              <h3 className="text-2xl font-black tracking-tight text-primary mb-6">
                Employer Services
              </h3>
              <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                Are you a local business looking for talent? Post your job openings here to reach local candidates.
              </p>
              <Button
                variant="outline"
                className="w-full h-16 rounded-2xl font-black border-primary/10 bg-white/50"
                asChild
              >
                <Link href="/employer-services">Post a Job Opening</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
