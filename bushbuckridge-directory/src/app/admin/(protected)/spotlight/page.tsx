import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

export default async function SpotlightAdminPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    await requireAdmin()
    const pb = await createClient()
    const currentYear = new Date().getFullYear()

    const resolvedParams = await searchParams
    const q = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : ''

    let businesses: any[] = []
    let spotlights: Record<string, any[]> = {}

    try {
        businesses = await pb
            .collection('businesses')
            .getFullList({ filter: 'package_tier = "pro-business"', sort: '-created' })

        if (q) {
            businesses = businesses.filter((b) =>
                (b.name || '').toLowerCase().includes(q)
            )
        }

        const articles = await pb.collection('spotlight_articles').getFullList()
        spotlights = {}
        articles.forEach((article) => {
            const bid = article.business_id
            if (!spotlights[bid]) spotlights[bid] = []
            spotlights[bid].push(article)
        })
    } catch (e) {
        return (
            <div className="p-8 text-red-500 bg-red-50 rounded-xl">
                Error loading spotlight data: {String(e)}
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-primary">Spotlight Articles</h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">
                        Manage quarterly articles for Pro Business listings.
                    </p>
                </div>
                <form method="get" className="flex items-center gap-2">
                    <input
                        name="q"
                        defaultValue={q}
                        placeholder="Search businesses..."
                        className="flex h-12 w-full md:w-64 rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button
                        type="submit"
                        className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem]">
                <CardHeader>
                    <CardTitle className="text-2xl font-black">Pro Business Listings</CardTitle>
                    <CardDescription className="text-base font-medium">
                        Each listing is entitled to one spotlight article per quarter (4 per year).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {businesses.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            {q ? `No Pro Business listings match "${q}".` : 'No Pro Business listings found.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business Name</TableHead>
                                    <TableHead>Listing Status</TableHead>
                                    <TableHead>Articles ({currentYear})</TableHead>
                                    <TableHead>Published</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {businesses.map((biz) => {
                                    const bizArticles = spotlights[biz.id] || []
                                    const yearArticles = bizArticles.filter(
                                        (a) => a.year === currentYear
                                    )
                                    const count = yearArticles.length
                                    const publishedCount = yearArticles.filter(
                                        (a) => a.status === 'published'
                                    ).length

                                    return (
                                        <TableRow key={biz.id}>
                                            <TableCell className="font-medium">
                                                {biz.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        biz.status === 'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {biz.status || 'inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-sm">
                                                    {count} / 4
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {publishedCount}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/spotlight/${biz.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Manage Articles
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
