import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

export default async function SpotlightAdminPage() {
    await requireAdmin()
    const pb = await createClient()

    let businesses: any[] = []
    let spotlights: Record<string, any> = {}

    try {
        businesses = await pb.collection('businesses').getFullList({
            filter: 'package_tier = "pro-business"',
            sort: '-created'
        })
        const articles = await pb.collection('spotlight_articles').getFullList()
        articles.forEach(article => {
            spotlights[article.business_id] = article
        })
    } catch (e) {
        return <div className="p-8 text-red-500 bg-red-50 rounded-xl">Error loading spotlight data: {String(e)}</div>
    }

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-primary">Spotlight Articles</h1>
                <p className="text-muted-foreground font-medium mt-2 text-lg">Manage full-page spotlight features for Pro Business partners.</p>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-white/50">
                    <CardTitle className="text-2xl font-black">Pro Business Listings</CardTitle>
                    <CardDescription className="text-base font-medium">Select a Pro Business partner to write or edit their spotlight article.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-primary/5">
                                <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-xs text-primary/40">Business Name</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Listing Status</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Article Status</TableHead>
                                <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-xs text-primary/40">Layout Profile</TableHead>
                                <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs text-primary/40">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses?.map((biz) => {
                                const article = spotlights[biz.id]
                                const isPublished = article?.status === 'published'
                                return (
                                <TableRow key={biz.id} className="hover:bg-primary/5 transition-colors border-primary/5">
                                    <TableCell className="py-6 px-8 font-bold text-primary text-base">{biz.name}</TableCell>
                                    <TableCell className="py-6 px-4">
                                        <Badge variant="outline" className={`rounded-xl px-3 py-1 font-bold capitalize ${biz.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{biz.status}</Badge>
                                    </TableCell>
                                    <TableCell className="py-6 px-4">
                                        {!article ? (
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold">Needs Drafting</Badge>
                                        ) : isPublished ? (
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Published</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">Draft / Pending</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-6 px-4 font-medium text-muted-foreground uppercase text-xs tracking-widest">{article?.layout ? article.layout.replace('_', ' ') : 'None'}</TableCell>
                                    <TableCell className="py-6 px-8 text-right">
                                        <Button size="sm" className="font-bold rounded-xl" asChild>
                                            <Link href={`/admin/spotlight/${biz.id}`}><Edit className="h-4 w-4 mr-2" /> {article ? 'Edit Article' : 'Write Article'}</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                            {businesses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground font-bold">No Pro Business listings found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}