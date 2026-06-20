import { createClient } from '@/utils/pocketbase/server'
import { notFound } from 'next/navigation'
import { format, isPast } from 'date-fns'
import { ArrowLeft, MapPin, Building2, CalendarDays, FileText, CheckCircle2, Download, ExternalLink, AlertCircle, Sparkles, Info, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'
import GalleryLightbox from '@/components/GalleryLightbox'
import type { Metadata } from 'next'
import { buildMetadata, pbFileUrl } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { breadcrumbLd } from '@/lib/structured-data'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const pb = await createClient()
  try {
    const opp: any = await pb.collection('opportunities').getOne(id)
    return buildMetadata({
      title: opp.title,
      description: opp.description || `${opp.title} — tender, funding or training opportunity in Bushbuckridge.`,
      path: `/opportunities/${id}`,
      image: pbFileUrl(opp, opp.image),
      type: 'article',
    })
  } catch {
    return buildMetadata({ title: 'Opportunity', path: `/opportunities/${id}` })
  }
}

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'Funding': return 'bg-emerald-500 text-white shadow-emerald-500/20'
    case 'Tenders': return 'bg-sky-500 text-white shadow-sky-500/20'
    case 'Training': return 'bg-violet-500 text-white shadow-violet-500/20'
    case 'Grants': return 'bg-amber-500 text-white shadow-amber-500/20'
    default: return 'bg-slate-500 text-white'
  }
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const pb = await createClient()

  let opp: any
  try {
    opp = await pb.collection('opportunities').getOne(id)
  } catch {
    notFound()
  }

  const deadline = opp.deadline ? new Date(opp.deadline) : null
  const isClosed = deadline ? isPast(deadline) : false
  const daysUntilClose = deadline && !isClosed
    ? (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    : null
  const isClosingSoon = daysUntilClose !== null && daysUntilClose <= 3

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
  const attachmentUrl = opp.attachment
    ? `${pbUrl}/api/files/${opp.collectionId}/${opp.id}/${opp.attachment}`
    : null
  const fileUrl = (f: string) => `${pbUrl}/api/files/${opp.collectionId}/${opp.id}/${f}`
  const mainImage = opp.image ? fileUrl(opp.image) : null
  const galleryImages: string[] = (Array.isArray(opp.gallery) ? opp.gallery : opp.gallery ? [opp.gallery] : []).map(fileUrl)

  return (
    <div className="flex flex-col gap-12 pb-24">
      <JsonLd data={breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Opportunities', path: '/opportunities' },
        { name: opp.title, path: `/opportunities/${opp.id}` },
      ])} />
      <SecondaryHeader
        title={opp.title}
        subtitle={opp.organization || 'Available Opportunity'}
        badge="OPPORTUNITY"
        backgroundImage={mainImage || "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2000&auto=format&fit=crop"}
      />

      <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-4xl">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Opportunities
        </Link>

        {isClosed && (
          <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-black text-sm">This opportunity has closed. The deadline has passed.</p>
          </div>
        )}

        {isClosingSoon && !isClosed && (
          <div className="flex items-center gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl mb-6 text-amber-700 animate-pulse">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-black text-sm">
              Closing very soon — deadline is {deadline ? format(deadline, 'MMMM d, yyyy') : ''}. Act now.
            </p>
          </div>
        )}

        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-10 space-y-10">

            {galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5">Gallery</h3>
                <GalleryLightbox images={galleryImages} businessName={opp.title} />
              </div>
            )}

            {/* Top metadata */}
            <div className="flex flex-wrap gap-3 items-center">
              <Badge className={`${getCategoryColor(opp.category)} font-black px-4 py-1.5 rounded-full border-0 shadow-lg`}>
                {opp.category}
              </Badge>
              {opp.value && (
                <Badge className="bg-emerald-500 text-white font-black px-4 py-1.5 rounded-full border-0 shadow-emerald-500/20 shadow-lg">
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> {opp.value}
                </Badge>
              )}
              {opp.location && (
                <Badge variant="secondary" className="font-black px-4 py-1.5 rounded-full">
                  <MapPin className="h-3.5 w-3.5 mr-1.5" /> {opp.location}
                </Badge>
              )}
              {opp.reference_number && (
                <span className="text-xs font-black text-primary/40 uppercase tracking-widest ml-auto">
                  Ref: {opp.reference_number}
                </span>
              )}
            </div>

            {/* Organization & deadline */}
            <div className="flex flex-wrap gap-6 text-sm font-bold text-muted-foreground">
              {opp.organization && (
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary/40" />
                  {opp.organization}
                </span>
              )}
              {deadline && (
                <span className={`flex items-center gap-2 ${isClosed ? 'text-red-500 line-through' : ''}`}>
                  <CalendarDays className="h-4 w-4 text-primary/40" />
                  Deadline: {format(deadline, 'MMM d, yyyy')}
                </span>
              )}
            </div>

            <div className="border-t border-border/50" />

            {/* Description */}
            {opp.description && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary/40" /> Overview
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: opp.description }}
                />
              </div>
            )}

            {/* Eligibility */}
            {opp.eligibility && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary/40" /> Eligibility
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: opp.eligibility }}
                />
              </div>
            )}

            {/* Required Documents */}
            {opp.required_documents && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary/40" /> Required Documents
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: opp.required_documents }}
                />
              </div>
            )}

            {/* How to Apply */}
            {opp.how_to_apply && (
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary/40" /> How to Apply
                </h2>
                <div
                  className="text-muted-foreground leading-relaxed text-sm [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: opp.how_to_apply }}
                />
              </div>
            )}

            {/* Contact Info */}
            {opp.contact_info && (
              <div className="bg-primary/5 rounded-3xl p-8 space-y-3 border border-primary/5">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary/40" /> Contact
                </h2>
                <div
                  className="text-muted-foreground text-sm font-bold [&_strong]:font-bold [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: opp.contact_info }}
                />
              </div>
            )}

            {/* CTA row */}
            {(attachmentUrl || opp.link) && (
              <div className="flex flex-wrap gap-4 pt-2">
                {attachmentUrl && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-2xl font-black border-primary/10"
                    disabled={isClosed}
                    asChild={!isClosed}
                  >
                    {!isClosed ? (
                      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-5 w-5" /> Download Document
                      </a>
                    ) : (
                      <span><Download className="mr-2 h-5 w-5" /> Download Document</span>
                    )}
                  </Button>
                )}
                {opp.link && (
                  <Button
                    size="lg"
                    className="h-14 px-8 rounded-2xl font-black shadow-lg shadow-primary/10 transition-all active:scale-95"
                    disabled={isClosed}
                    asChild={!isClosed}
                  >
                    {!isClosed ? (
                      <a href={opp.link} target="_blank" rel="noopener noreferrer">
                        Apply / Visit <ExternalLink className="ml-2 h-5 w-5" />
                      </a>
                    ) : (
                      <span>Apply / Visit <ExternalLink className="ml-2 h-5 w-5" /></span>
                    )}
                  </Button>
                )}
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
