'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { STATUS_COLORS } from '@/lib/utils'

interface Post {
    id: string
    content: string
    platforms: string[]
    scheduled_at: string | null
    status: string
}

// Fetch every status the calendar should surface. The /api/workspaces/posts
// endpoint defaults to pending/draft/approved only — the calendar wants the
// full lifecycle so users can see scheduled/publishing/published/failed too.
const ALL_STATUSES = [
    'draft',
    'pending_approval',
    'approved',
    'scheduled',
    'publishing',
    'published',
    'failed',
].join(',')

export default function CalendarPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchPosts(p.id)
        })
    }, [params])

    const fetchPosts = async (id: string) => {
        // Go through the API so slug-based URLs resolve to the workspace UUID.
        // A direct supabase query from the browser using `params.id` would
        // filter by slug (e.g. 'everest-motoring') and miss every post.
        try {
            const res = await fetch(`/api/workspaces/posts?workspaceId=${encodeURIComponent(id)}&statuses=${ALL_STATUSES}`)
            const data = await res.json()
            if (data.posts) {
                const sorted = [...data.posts].sort((a: Post, b: Post) => {
                    if (!a.scheduled_at && !b.scheduled_at) return 0
                    if (!a.scheduled_at) return 1
                    if (!b.scheduled_at) return -1
                    return a.scheduled_at.localeCompare(b.scheduled_at)
                })
                setPosts(sorted as Post[])
            }
        } catch (err) {
            console.error('Calendar: failed to fetch posts', err)
        }
        setLoading(false)
    }

    const handleGenerateMonth = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/workspaces/campaign/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId, durationDays: 30 })
            })
            const data = await res.json()
            if (data.ok) {
                alert(`Generated ${data.count} posts`)
                fetchPosts(workspaceId)
            } else {
                alert(`Generation failed: ${data.error || 'unknown'}`)
            }
        } catch (err: any) {
            alert(`Generation failed: ${err.message}`)
        } finally {
            setGenerating(false)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/dashboard/workspaces/${workspaceId}`}
                        className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-white"
                        style={{ color: '#5a5a7a' }}>
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to workspace
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                            style={{ background: 'rgba(249,115,22,0.15)' }}>
                            <CalendarIcon className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>Manage upcoming posts</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateMonth}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-400 transition-all hover:bg-white/5 disabled:opacity-50"
                        style={{ border: '1px solid rgba(249,115,22,0.3)' }}>
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Auto-Fill Month (AI)
                    </button>
                    <Link href={`/dashboard/workspaces/${workspaceId}/compose`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        <Plus className="w-4 h-4" />
                        Manual Post
                    </Link>
                </div>
            </div>

            <div className="glass-card p-6 min-h-[400px]">
                {posts.length === 0 ? (
                    <div className="text-center py-24">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-[#2a2a3d]" />
                        <h3 className="text-lg font-semibold text-white mb-2">Calendar is empty</h3>
                        <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#5a5a7a' }}>
                            Create a single post manually, or let the Client Intelligence engine generate a full 30-day strategy automatically.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map(post => (
                            <div key={post.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/5"
                                style={{ border: '1px solid #1a1a27', background: '#13131a' }}>

                                <div className="w-32 shrink-0">
                                    <p className="text-sm font-semibold text-white">
                                        {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Unscheduled'}
                                    </p>
                                    {post.scheduled_at && (
                                        <p className="text-xs" style={{ color: '#5a5a7a' }}>
                                            {new Date(post.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>

                                <div className="hidden sm:block w-px h-10" style={{ background: '#2a2a3d' }} />

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white mb-1.5 line-clamp-2">{post.content}</p>
                                    <div className="flex items-center gap-2">
                                        {post.platforms.map(p => (
                                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
                                                style={{ background: '#2a2a3d', color: '#8a8aaa' }}>
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <span className="badge"
                                        style={{
                                            background: `${STATUS_COLORS[post.status as keyof typeof STATUS_COLORS]?.split(' ')[0].replace('bg-', '') || '#6b7280'}15`,
                                            color: STATUS_COLORS[post.status as keyof typeof STATUS_COLORS]?.split(' ')[1].replace('text-', '') || '#6b7280'
                                        }}>
                                        <div className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'currentColor' }} />
                                        {post.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
