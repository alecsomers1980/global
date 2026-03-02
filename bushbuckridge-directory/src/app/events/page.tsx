import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, MapPin, ExternalLink, Ticket, Sparkles, ArrowRight } from 'lucide-react'
import SecondaryHeader from '@/components/SecondaryHeader'

export default async function EventsPage() {
    const supabase = await createClient()

    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true }) // Upcoming events first
        .gte('date', new Date().toISOString()) // Only future events

    return (
        <div className="flex flex-col gap-12 pb-24">
            <SecondaryHeader
                title="Upcoming Events"
                subtitle="Discover networking opportunities, training workshops, and business seminars happening across Bushbuckridge."
                badge="LOCAL GATHERINGS"
                backgroundImage="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="container mx-auto px-4 -mt-24 relative z-20">
                {error ? (
                    <div className="p-8 text-sm text-red-500 bg-red-50 rounded-[2rem] border border-red-200 shadow-sm text-center">
                        Failed to load events. Please refresh the page.
                    </div>
                ) : events?.length === 0 ? (
                    <div className="text-center py-32 bg-card/60 backdrop-blur-xl rounded-[3.5rem] border border-dashed flex flex-col items-center justify-center">
                        <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                            <CalendarIcon className="h-10 w-10 text-primary/20" />
                        </div>
                        <h3 className="text-2xl font-black text-primary">No upcoming events</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto font-medium mt-2">
                            Check back later for new dates and gatherings in the Bushbuckridge region.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {events?.map((event) => (
                            <Card key={event.id} className="group flex flex-col overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-[2.5rem]">
                                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="h-6 w-6 text-secondary" />
                                </div>

                                <div className="relative h-72 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop'}')` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute top-6 left-6 flex flex-col items-center justify-center h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white shadow-xl">
                                        <span className="text-2xl font-black leading-none">{format(new Date(event.date), 'dd')}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(event.date), 'MMM')}</span>
                                    </div>
                                    <Badge className="absolute top-6 right-6 bg-secondary text-secondary-foreground font-black px-4 py-1.5 rounded-full shadow-lg">
                                        {event.cost || 'Free Entry'}
                                    </Badge>
                                </div>

                                <CardHeader className="p-8 pb-4 relative -mt-8 bg-transparent">
                                    <div className="bg-card p-6 rounded-[2rem] shadow-xl border border-border/50">
                                        <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1 mb-4">
                                            {event.title}
                                        </CardTitle>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center text-sm font-bold text-muted-foreground/80">
                                                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center mr-3 shrink-0">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                            <div className="flex items-center text-sm font-bold text-muted-foreground/80">
                                                <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center mr-3 shrink-0">
                                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <span>{format(new Date(event.date), 'h:mm a')} • {format(new Date(event.date), 'yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-8 flex-1 mt-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-secondary/5 rounded-2xl">
                                            <Ticket className="h-5 w-5 text-secondary" />
                                        </div>
                                        <p className="text-muted-foreground line-clamp-3 font-medium italic leading-relaxed pt-1">
                                            {event.contact_info}
                                        </p>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-8 pt-4">
                                    <Button className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3" asChild>
                                        <a href={`mailto:${event.contact_info}`}>
                                            Secure Your Spot <ArrowRight className="h-6 w-6" />
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
