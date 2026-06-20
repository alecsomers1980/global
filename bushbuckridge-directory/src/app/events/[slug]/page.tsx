import { createClient } from '@/utils/pocketbase/server'
import { notFound } from 'next/navigation'
import { format, isPast } from 'date-fns'
import { ArrowLeft, ArrowRight, MapPin, Clock, Ticket, CalendarDays, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import SecondaryHeader from '@/components/SecondaryHeader'
import GalleryLightbox from '@/components/GalleryLightbox'
import type { Metadata } from 'next'
import { buildMetadata, pbFileUrl } from '@/lib/seo'
import JsonLd from '@/components/JsonLd'
import { eventLd, breadcrumbLd } from '@/lib/structured-data'

async function findEvent(slug: string) {
  const pb = await createClient()
  try {
    return await pb.collection('events').getFirstListItem(`slug = "${slug}"`)
  } catch {
    try {
      return await pb.collection('events').getOne(slug)
    } catch {
      return null
    }
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event: any = await findEvent(slug)
  if (!event) return buildMetadata({ title: 'Event', path: `/events/${slug}` })
  return buildMetadata({
    title: event.title,
    description: event.description || `${event.title} — community event in Bushbuckridge.`,
    path: `/events/${event.slug || slug}`,
    image: pbFileUrl(event, event.image),
    type: 'article',
  })
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const pb = await createClient()

  let event: any
  try {
    event = await pb.collection('events').getFirstListItem(`slug = "${slug}"`)
  } catch {
    // fall back to id for events created before slugs existed
    try {
      event = await pb.collection('events').getOne(slug)
    } catch {
      notFound()
    }
  }

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL
  const fileUrl = (f: string) => `${pbUrl}/api/files/${event.collectionId}/${event.id}/${f}`
  const mainImage = event.image ? fileUrl(event.image) : null
  const galleryImages: string[] = (Array.isArray(event.gallery) ? event.gallery : event.gallery ? [event.gallery] : []).map(fileUrl)

  const eventDate = event.date ? new Date(event.date) : null
  const isOver = eventDate ? isPast(eventDate) : false

  const contact = event.contact_info || ''
  const isEmail = /@/.test(contact)
  const ctaHref = isEmail ? `mailto:${contact}` : contact ? `tel:${contact.replace(/\s/g, '')}` : null

  return (
    <div className="flex flex-col gap-12 pb-24">
      <JsonLd data={[
        eventLd(event),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
          { name: event.title, path: `/events/${event.slug || event.id}` },
        ]),
      ]} />
      <SecondaryHeader
        title={event.title}
        subtitle={[event.venue, eventDate ? format(eventDate, 'EEEE, MMMM d, yyyy') : null].filter(Boolean).join(' · ')}
        badge="COMMUNITY EVENT"
        backgroundImage={mainImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop'}
      />

      <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-4xl">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>

        {isOver && (
          <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl mb-6 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-black text-sm">This event has already taken place.</p>
          </div>
        )}

        <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden">
          <CardContent className="p-10 space-y-10">

            {galleryImages.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5">Gallery</h3>
                <GalleryLightbox images={galleryImages} businessName={event.title} />
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 items-center">
              {event.is_featured && (
                <Badge className="bg-secondary text-secondary-foreground font-black px-4 py-1.5 rounded-full border-0">Featured</Badge>
              )}
              <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-full border-0">
                {event.cost || 'Free Entry'}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {eventDate && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5">
                  <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Date</p>
                    <p className="font-black text-sm">{format(eventDate, 'd MMM yyyy')}</p>
                  </div>
                </div>
              )}
              {event.time && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Time</p>
                    <p className="font-black text-sm">{event.time}</p>
                  </div>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Venue</p>
                    <p className="font-black text-sm">{event.venue}</p>
                  </div>
                </div>
              )}
            </div>

            {event.description && (
              <div>
                <h3 className="text-sm font-black text-primary/30 uppercase tracking-[0.2em] mb-5">About this event</h3>
                <div
                  className="text-muted-foreground/90 leading-relaxed font-medium text-lg [&_b]:font-bold [&_strong]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {contact && (
              <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-secondary/10 border border-secondary/20">
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                  <Ticket className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Bookings & Enquiries</p>
                  <p className="font-black text-primary">{contact}</p>
                </div>
              </div>
            )}

            {ctaHref && !isOver && (
              <Button className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3" asChild>
                <a href={ctaHref}>Secure Your Spot <ArrowRight className="h-6 w-6" /></a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
