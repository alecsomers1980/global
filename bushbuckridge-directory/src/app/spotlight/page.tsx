import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Image as ImageIcon, ArrowRight } from 'lucide-react'

export default async function SpotlightPage() {
    const supabase = await createClient()

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
      id,
      title,
      slug,
      content,
      image_url,
      created_at,
      businesses ( name, sectors (name) )
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <Badge variant="secondary" className="mb-3">Editorial</Badge>
                    <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Spotlight</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        In-depth profiles, success stories, and features on the businesses driving growth in the Bushbuckridge region.
                    </p>
                </div>
            </div>

            {error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-lg">Failed to load articles.</div>
            ) : posts?.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No spotlight articles yet</h3>
                    <p className="text-muted-foreground">Check back soon for features on local businesses.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts?.map((post) => (
                        <Card key={post.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                            <div className="h-48 bg-muted relative flex items-center justify-center overflow-hidden">
                                {post.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                                )}
                            </div>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-center mb-2">
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {post.businesses ? (Array.isArray(post.businesses) ? (post.businesses as any[])[0]?.sectors?.name : (post.businesses as any)?.sectors?.name) || 'Local Business' : 'Local Business'}
                                    </Badge>
                                    <time className="text-xs text-muted-foreground">
                                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                                    </time>
                                </div>
                                <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                                    <Link href={`/spotlight/${post.slug}`}>{post.title}</Link>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {post.content.replace(/<[^>]*>?/gm, '')} {/* Strip basic HTML for excerpt */}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" className="w-full justify-between" asChild>
                                    <Link href={`/spotlight/${post.slug}`}>
                                        Read full story <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
