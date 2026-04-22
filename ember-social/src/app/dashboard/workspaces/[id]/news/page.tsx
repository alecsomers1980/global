import { createServerSupabaseClient } from '@/lib/supabase/client'
import { isUuid } from '@/lib/resolve-workspace'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Newspaper, ExternalLink } from 'lucide-react'
import NewsActionBar from './NewsActionBar'
import NewsClientSettings from './NewsClientSettings'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id: rawId } = await params
    const supabase = await createServerSupabaseClient()

    const lookupColumn = isUuid(rawId) ? 'id' : 'slug'
    const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('id, slug, name, client_supabase_url, client_supabase_service_key, client_site_url, client_news_table')
        .eq(lookupColumn, rawId)
        .single()

    const workspace = workspaceData as any
    if (!workspace) notFound()

    const slug = workspace.slug || rawId

    const { data: articlesData } = await supabase
        .from('news_articles')
        .select('id, title, slug, category, status, hero_image_url, published_at, remote_synced_at, created_at')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })

    const articles = (articlesData as any[]) ?? []

    const categoryColors: Record<string, string> = {
        'buying-guide': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        'local': 'bg-green-500/20 text-green-400 border border-green-500/30',
        'model-review': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    }

    const statusColors: Record<string, string> = {
        'draft': 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
        'pending_approval': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        'approved': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        'published': 'bg-green-500/20 text-green-400 border border-green-500/30',
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Link
                href={`/dashboard/workspaces/${slug}`}
                className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                style={{ color: '#5a5a7a' }}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to workspace
            </Link>

            <div className="flex items-center gap-3">
                <Newspaper className="h-7 w-7" style={{ color: '#f97316' }} />
                <h1 className="text-2xl font-bold text-white">
                    Latest News — {workspace.name}
                </h1>
            </div>

            <NewsActionBar workspaceId={slug} />

            {articles.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Newspaper className="h-10 w-10 mx-auto mb-3" style={{ color: '#5a5a7a' }} />
                    <p className="text-base font-medium text-white">No articles yet</p>
                    <p className="mt-1 text-sm" style={{ color: '#8a8aaa' }}>
                        Generate your first one.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {articles.map((article: any) => (
                        <div key={article.id} className="glass-card p-4">
                            <div className="flex items-start gap-4">
                                <div
                                    className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg"
                                    style={{ background: '#1a1a27' }}
                                >
                                    {article.hero_image_url ? (
                                        <img
                                            src={article.hero_image_url}
                                            alt={article.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <Newspaper className="h-6 w-6" style={{ color: '#5a5a7a' }} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-semibold text-white truncate">
                                            {article.title}
                                        </h3>
                                        {article.remote_synced_at && (
                                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                                <ExternalLink className="h-3 w-3" />
                                                Synced to client site
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryColors[article.category] || 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'}`}>
                                            {article.category}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColors[article.status] || 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'}`}>
                                            {article.status}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs" style={{ color: '#5a5a7a' }}>
                                        Created {formatDate(article.created_at)}
                                    </p>
                                </div>

                                <Link
                                    href={`/dashboard/workspaces/${slug}/news/${article.id}`}
                                    className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                                    style={{
                                        background: 'rgba(249,115,22,0.1)',
                                        color: '#f97316',
                                        border: '1px solid rgba(249,115,22,0.25)',
                                    }}
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewsClientSettings
                workspaceId={workspace.id}
                initial={{
                    client_supabase_url: workspace.client_supabase_url,
                    client_supabase_service_key: workspace.client_supabase_service_key,
                    client_site_url: workspace.client_site_url,
                    client_news_table: workspace.client_news_table,
                }}
            />
        </div>
    )
}
