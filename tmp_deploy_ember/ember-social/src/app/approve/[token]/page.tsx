import { createServerSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Flame, Check, MessageSquare, AlertCircle } from 'lucide-react'
import { formatDateTime, PLATFORM_COLORS } from '@/lib/utils'

export default async function ApprovePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const supabase = await createServerSupabaseClient()

    // First, try to match a per-post approval_token
    const { data: posts } = await supabase
        .from('posts')
        .select('id, content, platforms, scheduled_at, status, workspaces(name, logo_url)')
        .eq('approval_token', token)
        .order('scheduled_at', { ascending: true })

    if (posts && posts.length > 0) {
        const workspaceName = (posts[0] as any).workspaces?.name

        return (
            <div className="min-h-screen bg-[#0a0a0f] text-[#e2e2f0]" style={{ fontFamily: 'var(--font-sans)' }}>
                <header className="sticky top-0 z-10 glass-card rounded-none px-6 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid #1a1a27', background: 'rgba(10,10,15,0.8)' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg ember-glow"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                            <Flame className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm leading-none">Content Review</p>
                            <p className="text-[10px] leading-none mt-1" style={{ color: '#5a5a7a' }}>{workspaceName}</p>
                        </div>
                    </div>
                    <div className="text-sm font-medium" style={{ color: '#8a8aaa' }}>
                        {posts.length} post{posts.length !== 1 ? 's' : ''} to review
                    </div>
                </header>

                <main className="max-w-3xl mx-auto p-6 space-y-8 pb-32">
                    <div className="text-center py-6">
                        <h1 className="text-2xl font-bold text-white mb-2">Review your upcoming posts</h1>
                        <p className="text-sm" style={{ color: '#5a5a7a' }}>
                            Please review the content below. You can approve each post or request changes.
                            Approved posts will be scheduled automatically.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {posts.map((post: any, i: number) => (
                            <div key={post.id} className="glass-card overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3" style={{ background: '#13131a', borderBottom: '1px solid #1a1a27' }}>
                                    <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#5a5a7a' }}>Post {i + 1}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            {post.platforms.map((p: string) => (
                                                <span key={p} className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                                                    style={{ background: `${PLATFORM_COLORS[p as keyof typeof PLATFORM_COLORS]}15`, color: PLATFORM_COLORS[p as keyof typeof PLATFORM_COLORS] }}>
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                        <span style={{ color: '#2a2a3d' }}>|</span>
                                        <span className="text-xs font-medium text-white">
                                            {post.scheduled_at ? formatDateTime(post.scheduled_at) : 'Unscheduled'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>

                                    {post.status === 'approved' && (
                                        <div className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 text-green-500 text-sm font-semibold border border-green-500/20">
                                            <Check className="w-4 h-4" /> Approved
                                        </div>
                                    )}

                                    {post.status === 'draft' && (
                                        <div className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/10 text-orange-500 text-sm font-semibold border border-orange-500/20">
                                            <MessageSquare className="w-4 h-4" /> Changes Requested
                                        </div>
                                    )}

                                    {post.status === 'pending_approval' && (
                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <form action={async () => {
                                                'use server'
                                                const sb = await createServerSupabaseClient()
                                                await sb.from('posts').update({ status: 'draft' } as never).eq('id', post.id)
                                            }}>
                                                <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5"
                                                    style={{ border: '1px solid #2a2a3d', color: '#a0a0c0' }}>
                                                    <MessageSquare className="w-4 h-4" /> Request Change
                                                </button>
                                            </form>

                                            <form action={async () => {
                                                'use server'
                                                const sb = await createServerSupabaseClient()
                                                await sb.from('posts').update({ status: 'approved' } as never).eq('id', post.id)
                                            }}>
                                                <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                                                    style={{ background: '#34d399', color: '#064e3b' }}>
                                                    <Check className="w-4 h-4" /> Approve Post
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        )
    }

    // Check if token matches a campaign_batches.public_token (new batch tokens)
    const { data: batch } = await supabase
        .from('campaign_batches')
        .select('public_token')
        .eq('public_token', token)
        .maybeSingle()

    if (batch) {
        redirect(`/plan/${token}`)
    }

    // Token not found anywhere
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0f]">
            <div className="glass-card max-w-md w-full p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500/50 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Link Expired or Invalid</h1>
                <p className="text-sm" style={{ color: '#5a5a7a' }}>
                    This approval link is no longer valid. The posts may have already been approved or the link was copied incorrectly.
                </p>
            </div>
        </div>
    )
}
