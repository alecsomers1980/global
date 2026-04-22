import { createServerSupabaseClient } from '@/lib/supabase/client'
import { isUuid } from '@/lib/resolve-workspace'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NewsEditor from './NewsEditor'

export const dynamic = 'force-dynamic'

export default async function Page({
    params,
}: {
    params: Promise<{ id: string; articleId: string }>
}) {
    const { id, articleId } = await params
    const supabase = await createServerSupabaseClient()

    const lookupColumn = isUuid(id) ? 'id' : 'slug'
    const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('id, slug, name')
        .eq(lookupColumn, id)
        .single()

    const workspace = workspaceData as any
    if (!workspace) notFound()

    const { data: articleData } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single()

    const article = articleData as any
    if (!article) notFound()
    if (article.workspace_id !== workspace.id) notFound()

    const slug = workspace.slug || id

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link
                href={`/dashboard/workspaces/${slug}/news`}
                className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                style={{ color: '#5a5a7a' }}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to News
            </Link>

            <h1 className="text-2xl font-bold text-white">Edit Article</h1>

            <div className="glass-card p-6">
                <NewsEditor article={article} workspaceSlug={slug} />
            </div>
        </div>
    )
}
