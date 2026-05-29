import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import JobActionsMenu from './JobActionsMenu'
import JobsClientWrapper from './JobsClientWrapper'

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const pb = await createClient()

  const resolvedParams = await searchParams
  const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

  let jobs: any[] = []
  try {
    jobs = await pb.collection('jobs').getFullList()
    if (q) {
      jobs = jobs.filter(
        (job) =>
          (job.title || '').toLowerCase().includes(q) ||
          (job.contact_info || '').toLowerCase().includes(q)
      )
    }
  } catch (e) {
    console.error('Failed to fetch jobs', e)
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Jobs Hub</h1>
          <p className="text-muted-foreground font-medium mt-2 text-lg">Manage local job listings posted by businesses.</p>
        </div>
        <div className="flex items-center gap-3">
          <form method="get" className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search jobs..."
              className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
              Search
            </button>
          </form>
          <JobsClientWrapper />
        </div>
      </div>

      <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
          <CardTitle className="text-2xl font-black">All Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/5">
                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Job Title</TableHead>
                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Company & Location</TableHead>
                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Type</TableHead>
                <TableHead className="py-6 px-4 w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs?.map((job) => (
                <TableRow key={job.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                  <TableCell className="py-6 px-8 font-bold text-primary">{job.title}</TableCell>
                  <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                    {[job.company, job.location].filter(Boolean).join(' — ') || '—'}
                  </TableCell>
                  <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">{job.type || '—'}</TableCell>
                  <TableCell className="py-6 px-4">
                    <JobActionsMenu job={job} />
                  </TableCell>
                </TableRow>
              ))}
              {(!jobs || jobs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground font-medium">No jobs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
