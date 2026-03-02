import { requireAdmin } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default async function AdminSpotlightPage() {
    await requireAdmin()
    const supabase = await createClient()

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id, title, slug, created_at,
            businesses(name)
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Spotlight Articles</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage featured PR articles and business stories.</p>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">All Articles</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Article Title</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Linked Business</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Published</TableHead>
                                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs text-primary/40">Live Link</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts?.map((post) => (
                                <TableRow key={post.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8 font-bold text-primary">{post.title}</TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">{(post.businesses as any)?.name || 'None'}</TableCell>
                                    <TableCell className="py-6 px-4 text-sm font-medium text-muted-foreground">
                                        {format(new Date(post.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <Link href={`/spotlight/${post.slug}`} target="_blank" className="inline-flex items-center text-xs font-bold text-primary hover:text-secondary transition-colors">
                                            View <ExternalLink className="h-3 w-3 ml-1" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!posts || posts.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground font-medium">No spotlight articles found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
