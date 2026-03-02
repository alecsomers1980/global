import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import SecondaryHeader from '@/components/SecondaryHeader'

export default async function SpotlightPage() {
    const supabase = await createClient()

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            businesses (
                id,
                name,
                logo_url,
                sectors ( name )
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-12 pb-24">
            <SecondaryHeader
                title="Business Spotlight"
                subtitle="Deep dives into the stories, people, and innovations driving the Bushbuckridge economy."
                badge="PREMIUM ARTICLES"
            />

            <div className="container mx-auto px-4 -mt-24 relative z-20">
                {error ? (
                    <div className="p-8 text-sm text-red-500 bg-red-50 rounded-[2rem] border border-red-200 shadow-sm mb-8 text-center">
                        Failed to load articles. Please refresh the page.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {posts?.map((post) => (
                            <Card key={post.id} className="group flex flex-col overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-[2.5rem]">
                                <div className="relative h-72 bg-muted overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={post.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop'}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <Badge className="absolute top-6 left-6 bg-secondary text-secondary-foreground font-bold px-4 py-1 rounded-full shadow-lg">
                                        {(post.businesses as any)?.sectors?.name || 'Venture'}
                                    </Badge>
                                </div>

                                <CardHeader className="px-8 pt-8 pb-4">
                                    <Link href={`/business/${(post.businesses as any)?.id}`} className="flex items-center gap-3 mb-4 group/author">
                                        <div className="h-10 w-10 rounded-full border-2 border-primary/20 overflow-hidden bg-white shadow-sm flex-shrink-0 group-hover/author:border-primary transition-colors">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={(post.businesses as any)?.logo_url || 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=200&auto=format&fit=crop'}
                                                alt={(post.businesses as any)?.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-muted-foreground truncate group-hover/author:text-primary transition-colors">{(post.businesses as any)?.name}</span>
                                    </Link>
                                    <CardTitle className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="px-8 flex-1">
                                    <p className="text-muted-foreground line-clamp-3 font-medium italic mb-6">
                                        {post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'}
                                    </p>
                                    <div className="flex items-center text-xs font-bold uppercase tracking-widest text-primary/40">
                                        <Calendar className="h-4 w-4 mr-1.5" />
                                        {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                                    </div>
                                </CardContent>

                                <CardFooter className="px-8 pb-10 pt-4">
                                    <Button className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl font-bold shadow-lg shadow-primary/10 transition-transform active:scale-95" asChild>
                                        <Link href={`/spotlight/${post.slug}`}>
                                            Read Full Article <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}

                        {(!posts || posts.length === 0) && (
                            <div className="col-span-full py-32 text-center bg-muted/30 rounded-[3rem] border border-dashed flex flex-col items-center justify-center">
                                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                    <Star className="h-10 w-10 text-primary/10" />
                                </div>
                                <h3 className="text-2xl font-bold">New Stories Coming Soon</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto font-medium mt-2">
                                    We're currently curating the next round of business success stories from the Bushbuckridge region.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
