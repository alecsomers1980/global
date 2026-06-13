import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import SpotlightEditor from './SpotlightEditor'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil } from 'lucide-react'

export default async function BusinessSpotlightPage({
    params,
    searchParams,
}: {
    params: Promise<{ business_id: string }>
    searchParams: Promise<{ year?: string; quarter?: string }>
}) {
    await requireAdmin()
    const pb = await createClient()
    const { business_id: businessId } = await params
    const sp = await searchParams
    const currentYear = new Date().getFullYear()
    const year = parseInt(sp.year || '') || currentYear
    const quarter = sp.quarter || ''

    let business: any = null
    let articles: any[] = []
    try {
        business = await pb.collection('businesses').getOne(businessId)
    } catch (e) {
        return (
            <div className="p-8 text-red-500 bg-red-50 rounded-xl">
                Error loading data. Business might not exist.
            </div>
        )
    }

    try {
        articles = await pb
            .collection('spotlight_articles')
            .getFullList({ filter: `business_id = "${businessId}"` })
    } catch (_) {
        articles = []
    }

    // If a specific quarter is requested (and it is a valid Q1–Q4), show the editor for that quarter.
    const validQuarters = ['Q1', 'Q2', 'Q3', 'Q4']
    const selectedQuarter = validQuarters.includes(quarter) ? quarter : ''

    if (selectedQuarter) {
        const article = articles.find(
            (a) => a.quarter === selectedQuarter && Number(a.year) === year
        )

        return (
            <div className="space-y-8 max-w-5xl mx-auto pb-24">
                <Link
                    href={`/admin/spotlight/${businessId}?year=${year}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to quarters
                </Link>

                <div>
                    <h1 className="text-3xl font-bold">{business.name}</h1>
                    <p className="text-muted-foreground">
                        Editing {selectedQuarter} · {year}
                    </p>
                </div>

                <SpotlightEditor
                    businessId={business.id}
                    quarter={selectedQuarter}
                    year={year}
                    initialArticle={article || undefined}
                />
            </div>
        )
    }

    // Overview: year selector + quarterly grid
    const yearOptions = [currentYear - 1, currentYear, currentYear + 1]

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-24">
            <Link
                href="/admin/spotlight"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Spotlight Admin
            </Link>

            <div>
                <h1 className="text-3xl font-bold">Spotlight Articles — {business.name}</h1>
            </div>

            {/* Year selector */}
            <div className="flex gap-2">
                {yearOptions.map((y) => (
                    <Link key={y} href={`?year=${y}`}>
                        <Button
                            variant={y === year ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-full"
                        >
                            {y}
                        </Button>
                    </Link>
                ))}
            </div>

            {/* Quarter cards grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {validQuarters.map((q) => {
                    const article = articles.find(
                        (a) => a.quarter === q && Number(a.year) === year
                    )
                    const quarterRanges: Record<string, string> = {
                        Q1: 'Jan–Mar',
                        Q2: 'Apr–Jun',
                        Q3: 'Jul–Sep',
                        Q4: 'Oct–Dec',
                    }

                    return (
                        <Card
                            key={q}
                            className="border-0 shadow-xl bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden"
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <span>
                                        {q} — {quarterRanges[q]}
                                    </span>
                                    {article ? (
                                        <Badge
                                            variant={
                                                article.status === 'published'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {article.status === 'published'
                                                ? 'Published'
                                                : 'Draft'}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Not created</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">
                                    {article?.title || business.name}
                                </p>
                                {article?.layout && (
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                        {article.layout.replace('_', ' ')} layout
                                    </p>
                                )}
                                <div className="mt-4">
                                    <Link
                                        href={`?quarter=${q}&year=${year}`}
                                    >
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Pencil className="mr-2 h-4 w-4" />
                                            {article ? 'Edit' : 'Write'}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}