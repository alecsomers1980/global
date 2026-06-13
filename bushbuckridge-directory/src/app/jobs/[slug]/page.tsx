import { createClient } from '@/utils/pocketbase/server'
import { notFound } from 'next/navigation'
import { format, isPast } from 'date-fns'
import { ArrowLeft, ArrowRight, MapPin, Building, Clock, Banknote, UserCheck, CalendarDays, Phone, Mail, User, FileText, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'
import { formatDistanceToNow } from 'date-fns'

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pb = await createClient()

  let job: any
  try {
    job = await pb.collection('jobs').getFirstListItem(`slug = "${slug}"`)
  } catch {
    notFound()
  }

  const closingDate = job.closing_date ? new Date(job.closing_date) : null
  const isClosed = closingDate ? isPast(closingDate) : false
  const daysUntilClose = closingDate && !isClosed
    ? (closingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    : null
  const isClosingSoon = daysUntilClose !== null && daysUntilClose <= 7

  const applyHref = job.contact_email
    ? `mailto:${job.contact_email}`
    : job.contact_info
    ? `mailto:${job.contact_info}`
    : null

  return (
    <div className="flex flex-col gap-12 pb-24">
      <SecondaryHeader
        title={job.title}
        subtitle={`${job.company || 'Local Business'} · ${job.location || 'Bushbuckridge Area'}`}
        badge="JOB LISTING"
        backgroundImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-4xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>

        {isClosed && (
          <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-black text-sm">This job listing has closed. Applications are no longer being accepted.</p>
          </div>
        )}

        {isClosingSoon && !isClosed && (
          <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl mb-6 text-amber-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-black text-sm">
              Closing soon — deadline is {closingDate ? format(closingDate, 'MMMM d, yyyy') : ''}. Apply before it's too late.
            </p>
          </div>
        )}

        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-10 space-y-10">

            {/* Metadata row */}
            <div className="flex flex-wrap gap-3 items-center">
              {job.type && (
                <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-full border-0">
                  {job.type}
                </Badge>
              )}
              {job.experience_level && (
                <Badge variant="secondary" className="font-black px-4 py-1.5 rounded-full">
                  {job.experience_level}
                </Badge>
              )}
              {job.salary && (
                <Badge className="bg-emerald-500 text-white font-black px-4 py-1.5 rounded-full border-0 shadow-emerald-500/20 shadow-lg">
                  <Banknote className="h-3.5 w-3.5 mr-1.5" />
                  {job.salary}{job.salary_period ? ` / ${job.salary_period}` : ''}
                </Badge>
              )}
              <span className="text-xs font-black text-primary/40 uppercase tracking-widest flex items-center ml-auto">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Posted {formatDistanceToNow(new Date(job.created))} ago
              </span>
            </div>

            {/* Key details chips */}
            <div className="flex flex-wrap gap-6 text-sm font-bold text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/40" />
                  {job.location}
                </span>
              )}
              {job.company && (
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary/40" />
                  {job.company}
                </span>
              )}
              {job.positions && (
                <span className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary/40" />
                  {job.positions} position{job.positions > 1 ? 's' : ''} available
                </span>
              )}
              {closingDate && (
                <span className={`flex items-center gap-2 ${isClosed ? 'text-red-500 line-through' : ''}`}>
                  <CalendarDays className="h-4 w-4 text-primary/40" />
                  Closes {format(closingDate, 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <div className="border-t border-border/50" />

            {/* Description */}
            {job.description && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary/40" /> Overview
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-base [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary/40" /> Responsibilities
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                />
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary/40" /> Requirements
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </div>
            )}

            {/* How to Apply */}
            {job.how_to_apply && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary/40" /> How to Apply
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: job.how_to_apply }}
                />
              </div>
            )}

            {/* Contact block */}
            {(job.contact_name || job.contact_number || job.contact_email) && (
              <div className="bg-primary/5 rounded-3xl p-8 space-y-4 border border-primary/5">
                <h2 className="text-lg font-black tracking-tight">Contact Information</h2>
                {job.contact_name && (
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <User className="h-4 w-4 text-primary/40" />
                    {job.contact_name}
                  </div>
                )}
                {job.contact_number && (
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Phone className="h-4 w-4 text-primary/40" />
                    <a href={`tel:${job.contact_number}`} className="hover:text-primary transition-colors">
                      {job.contact_number}
                    </a>
                  </div>
                )}
                {job.contact_email && (
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <Mail className="h-4 w-4 text-primary/40" />
                    <a href={`mailto:${job.contact_email}`} className="hover:text-primary transition-colors">
                      {job.contact_email}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-4 pt-2">
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/10 transition-all active:scale-95"
                disabled={isClosed || !applyHref}
                asChild={!isClosed && !!applyHref}
              >
                {!isClosed && applyHref ? (
                  <a href={applyHref}>
                    Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                ) : (
                  <span>
                    {isClosed ? 'Applications Closed' : 'Apply Now'} <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-2xl font-black border-primary/10"
                asChild
              >
                <Link href="/jobs">
                  <ArrowLeft className="mr-2 h-5 w-5" /> All Jobs
                </Link>
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
