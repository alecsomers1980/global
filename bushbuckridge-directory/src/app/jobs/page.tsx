import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { Briefcase, MapPin, Building, ArrowRight, Clock, UserCheck, Banknote } from 'lucide-react'
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
              <div className="space-y-6">
                {jobs?.map((job) => (
                  <Card
                    key={job.id}
                    className="group border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:bg-card/80 rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row gap-8 p-10 items-start md:items-center">
                      <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-110 transition-transform">
                        <Building className="h-10 w-10 text-primary/40" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-primary/40 uppercase tracking-widest">
                            {job.company || 'Local Business'}
                          </span>
                          <div className="h-1 w-1 rounded-full bg-primary/20" />
                          <span className="text-xs font-black text-primary/40 uppercase tracking-widest flex items-center">
                            <Clock className="h-3 w-3 mr-1" />{' '}
                            {formatDistanceToNow(new Date(job.created))} ago
                          </span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors">
                          <Link href={`/jobs/${job.slug || job.id}`} className="hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-bold text-muted-foreground">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-primary/40" />
                            {job.location || 'Bushbuckridge Area'}
                          </span>
                          <span className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-primary/40" />
                            {job.type || 'Full-time'}
                            {job.experience_level ? ` · ${job.experience_level}` : ''}
                          </span>
                          {job.salary && (
                            <span className="flex items-center">
                              <Banknote className="h-4 w-4 mr-2 text-primary/40" />
                              {job.salary}
                              {job.salary_period ? ` / ${job.salary_period}` : ''}
                            </span>
                          )}
                        </div>
                        {job.description && (
                          <p className="line-clamp-2 text-sm text-muted-foreground mt-2">
                            {job.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')}
                          </p>
                        )}
                      </div>
                      <div className="w-full pt-6 md:pt-0 flex flex-col gap-3">
                        <Button
                          size="lg"
                          className="h-16 w-full rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/10 transition-all active:scale-95"
                          asChild
                        >
                          <Link href={`/jobs/${job.slug || job.id}`}>
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
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
