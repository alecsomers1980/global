import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import SpotlightEditor from './SpotlightEditor'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function EditSpotlightPage({ params }: { params: Promise<{ business_id: string }> }) {
    await requireAdmin()
    const pb = await createClient()
    const resolvedParams = await params;
    
    // In next 15 pages the folder is [business_id] but the params name matches folder. 
    // Wait, the folder I'll create is [business_id]
    const businessId = resolvedParams.business_id

    let business = null
    let article = null

    try {
        business = await pb.collection('businesses').getOne(businessId)
        try {
            const articles = await pb.collection('spotlight_articles').getList(1, 1, { filter: `business_id = "${businessId}"` })
            if (articles.items.length > 0) {
                article = articles.items[0]
            }
        } catch (e) {
            // No article exists yet
        }
    } catch (e) {
        return <div className="p-8 text-red-500">Error loading data. Business might not exist.</div>
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-24">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full shadow-sm bg-white">
                    <Link href="/admin/spotlight">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-primary">Edit Spotlight</h1>
                    <p className="text-muted-foreground font-medium">Writing feature for: <strong className="text-foreground">{business.name}</strong></p>
                </div>
            </div>

            <SpotlightEditor businessId={business.id} initialArticle={article} />
        </div>
    )
}
