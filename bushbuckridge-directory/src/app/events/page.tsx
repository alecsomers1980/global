import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, MapPin, ExternalLink } from 'lucide-react'

export default async function EventsPage() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true }) // Upcoming events first
        .gte('date', new Date().toISOString()) // Only future events

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Upcoming Events</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Discover networking opportunities, training workshops, and business seminars happening across Bushbuckridge.
                </p>
            </div>

            {error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">Failed to load events.</div>
            ) : events?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No upcoming events</h3>
                    <p className="text-muted-foreground">Check back later for new dates and gatherings.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((event) => (
                        <Card key={event.id} className="flex flex-col border-l-4 border-l-rose-500">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">
                                        {format(new Date(event.date), 'MMM d, yyyy')}
                                    </Badge>
                                    {event.is_featured && (
                                        <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                                    )}
                                </div>
                                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                <div className="flex items-center text-sm text-muted-foreground mt-2">
                                    <MapPin className="h-4 w-4 mr-1 shrink-0" />
                                    <span className="truncate">{event.venue}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <CalendarIcon className="h-4 w-4 mr-1 shrink-0" />
                                    <span>{format(new Date(event.date), 'h:mm a')}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {/* Description usually maps here; assuming partial contact info for now */}
                                    {event.contact_info}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button variant="outline" className="w-full" asChild>
                                    {/* Ideally this maps to real registration URLs if available */}
                                    <a href={`mailto:${event.contact_info}`}>RSVP / Enquire <ExternalLink className="h-3 w-3 ml-2" /></a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
