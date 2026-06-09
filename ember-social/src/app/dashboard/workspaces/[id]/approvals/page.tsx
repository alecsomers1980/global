'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ShieldCheck, Loader2, ClipboardList, MessageSquare, ChevronDown, ChevronUp, Send, User } from 'lucide-react'
import Link from 'next/link'
import { PostPreviewCard } from '@/components/PostPreviewCard'
import type { Database } from '@/types/database'

type BrandKit = Database['public']['Tables']['brand_kits']['Row']

interface Post {
    id: string
    content: string
    media_urls: string[] | null
    platforms: string[]
    scheduled_at: string | null
    status: string
    approval_token: string | null
    created_at: string
    client_status?: string
    campaign_batch_id?: string | null
    batch_token?: string | null
    feedback_count?: number
    psychology_note?: string | null
}

type FilterTab = 'pending' | 'changes' | 'approved'

export default function ApprovalsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [posts, setPosts] = useState<Post[]>([])
    const [brandKit, setBrandKit] = useState<BrandKit | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<FilterTab>('pending')
    const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set())
    const [feedbackData, setFeedbackData] = useState<Record<string, any[]>>({})
    const [feedbackLoading, setFeedbackLoading] = useState<Set<string>>(new Set())
    const [replyText, setReplyText] = useState<Record<string, string>>({})
    const [replySubmitting, setReplySubmitting] = useState<Set<string>>(new Set())

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchData(p.id)
        })
    }, [params])

    const fetchData = async (id: string) => {
        try {
            const res = await fetch(`/api/workspaces/posts?workspaceId=${id}`)
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            if (data.posts) setPosts(data.posts as Post[])
            if (data.brandKit) setBrandKit(data.brandKit)
        } catch (err) {
            console.error('Failed to fetch posts:', err)
        }
        setLoading(false)
    }

    const handleApprove = async (postId: string) => {
        await fetch('/api/workspaces/posts/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, status: 'approved' }),
        })
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'approved' } : p))
    }

    const handleReject = async (postId: string) => {
        await fetch('/api/workspaces/posts/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, status: 'draft' }),
        })
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'draft' } : p))
    }

    const handleRegenerateImage = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/regenerate-image`, { method: 'POST' })
            const data = await res.json()
            if (!data.ok) {
                alert(`Regenerate failed: ${data.error || 'unknown'}`)
                return
            }
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, media_urls: [data.mediaUrl] } : p))
        } catch (err: any) {
            alert(`Regenerate error: ${err.message}`)
        }
    }

    const handleDelete = async (postId: string) => {
        try {
            const res = await fetch('/api/workspaces/posts/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
            })
            if (!res.ok) {
                const data = await res.json()
                alert(`Delete failed: ${data.error || 'Unknown error'}`)
                return
            }
            setPosts(prev => prev.filter(p => p.id !== postId))
        } catch (err: any) {
            alert(`Delete error: ${err.message}`)
        }
    }

    const handlePostNow = async (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'publishing' } : p))

        try {
            const res = await fetch('/api/workspaces/posts/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId }),
            })
            const data = await res.json()

            if (!res.ok) {
                alert(`Publishing failed: ${data.error || 'Unknown error'}`)
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'failed' } : p))
                return
            }

            const summary = (data.results || [])
                .map((r: any) => `${r.platform} (${r.account_name}): ${r.success ? 'OK' : 'FAILED - ' + r.error}`)
                .join('\n')

            alert(data.allSuccess
                ? `Published successfully!\n\n${summary}`
                : data.success
                    ? `Partially published:\n\n${summary}`
                    : `Publishing failed:\n\n${summary}`
            )

            setPosts(prev => prev.map(p => p.id === postId
                ? { ...p, status: data.success ? 'published' : 'failed' }
                : p
            ))
        } catch (err: any) {
            alert(`Publishing error: ${err.message}`)
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'failed' } : p))
        }
    }

    const toggleFeedback = async (postId: string, batchToken: string | null) => {
        if (expandedFeedback.has(postId)) {
            setExpandedFeedback(prev => {
                const next = new Set(prev)
                next.delete(postId)
                return next
            })
            return
        }

        setExpandedFeedback(prev => new Set(prev).add(postId))

        if (!feedbackData[postId] && batchToken) {
            setFeedbackLoading(prev => new Set(prev).add(postId))
            try {
                const res = await fetch(`/api/posts/${postId}/feedback?token=${batchToken}`)
                const data = await res.json()
                if (data.feedback) {
                    setFeedbackData(prev => ({ ...prev, [postId]: data.feedback }))
                }
            } catch (err) {
                console.error('Failed to fetch feedback:', err)
            }
            setFeedbackLoading(prev => {
                const next = new Set(prev)
                next.delete(postId)
                return next
            })
        }
    }

    const submitAgencyReply = async (postId: string, batchToken: string | null) => {
        const text = (replyText[postId] || '').trim()
        if (!text || !batchToken) return

        setReplySubmitting(prev => new Set(prev).add(postId))
        try {
            const res = await fetch(`/api/posts/${postId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: batchToken, comment: text, role: 'agency', author_name: 'Agency' }),
            })
            const data = await res.json()
            if (data.ok) {
                setFeedbackData(prev => ({
                    ...prev,
                    [postId]: [data.feedback, ...(prev[postId] || [])]
                }))
                setReplyText(prev => ({ ...prev, [postId]: '' }))
                // Update count
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, feedback_count: (p.feedback_count || 0) + 1 } : p
                ))
            }
        } catch (err) {
            console.error('Failed to submit reply:', err)
        }
        setReplySubmitting(prev => {
            const next = new Set(prev)
            next.delete(postId)
            return next
        })
    }

    const relativeTime = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins} min ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs} hr ago`
        const days = Math.floor(hrs / 24)
        return `${days} day${days > 1 ? 's' : ''} ago`
    }

    const filteredPosts = posts.filter(p => {
        if (activeTab === 'pending') return p.status === 'pending_approval'
        if (activeTab === 'changes') return p.status === 'draft'
        if (activeTab === 'approved') return p.status === 'approved'
        return true
    })

    const pendingCount = posts.filter(p => p.status === 'pending_approval').length
    const changesCount = posts.filter(p => p.status === 'draft').length
    const approvedCount = posts.filter(p => p.status === 'approved').length

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'pending', label: 'Pending', count: pendingCount },
        { key: 'changes', label: 'Changes Requested', count: changesCount },
        { key: 'approved', label: 'Recently Approved', count: approvedCount },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
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
                        <ShieldCheck className="w-full h-full text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Content Approvals</h1>
                        <p className="text-sm" style={{ color: '#5a5a7a' }}>
                            Review and approve pending posts
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={activeTab === key
                            ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }
                            : { background: '#1a1a27', color: '#5a5a7a', border: '1px solid #2a2a3d' }
                        }>
                        {label}
                        {count > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                style={activeTab === key
                                    ? { background: 'rgba(249,115,22,0.2)', color: '#f97316' }
                                    : { background: '#2a2a3d', color: '#5a5a7a' }
                                }>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Posts list */}
            {filteredPosts.length === 0 ? (
                <div className="glass-card p-6 min-h-[300px]">
                    <div className="text-center py-24">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-[#2a2a3d]" />
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {activeTab === 'pending' && 'No posts awaiting approval'}
                            {activeTab === 'changes' && 'No posts with change requests'}
                            {activeTab === 'approved' && 'No recently approved posts'}
                        </h3>
                        <p className="text-sm max-w-sm mx-auto" style={{ color: '#5a5a7a' }}>
                            {activeTab === 'pending' && 'When posts are submitted via the API or composed for review, they will appear here.'}
                            {activeTab === 'changes' && 'Posts that you request changes on will appear here for the team to revise.'}
                            {activeTab === 'approved' && 'Posts you approve will show here before they are scheduled for publishing.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredPosts.map(post => (
                        <div key={post.id}>
                            <PostPreviewCard
                                post={post}
                                brandKit={brandKit}
                                showActions={true}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onPostNow={handlePostNow}
                                onDelete={handleDelete}
                                onRegenerateImage={handleRegenerateImage}
                            />

                            {/* Client status + feedback badge row */}
                            <div className="flex items-center justify-between px-5 py-2 -mt-2 rounded-b-xl"
                                style={{ background: '#0d0d14', border: '1px solid #1a1a27', borderTop: 'none' }}>
                                <div className="flex items-center gap-2">
                                    {post.client_status === 'approved' && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                                            Client: Approved
                                        </span>
                                    )}
                                    {post.client_status === 'changes_requested' && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                            Client: Changes Requested
                                        </span>
                                    )}
                                    {(!post.client_status || post.client_status === 'pending') && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                            Client: Pending
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => toggleFeedback(post.id, post.batch_token || null)}
                                    className="flex items-center gap-1.5 text-xs transition-colors hover:text-white px-2 py-1 rounded"
                                    style={{ color: post.feedback_count ? '#f97316' : '#5a5a7a' }}>
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {post.feedback_count ? `${post.feedback_count} comment${post.feedback_count > 1 ? 's' : ''}` : 'Comments'}
                                    {expandedFeedback.has(post.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                            </div>

                            {/* Expandable comments panel */}
                            {expandedFeedback.has(post.id) && (
                                <div className="rounded-b-xl px-5 py-4 space-y-3"
                                    style={{ background: '#0d0d14', border: '1px solid #1a1a27', borderTop: 'none' }}>
                                    {feedbackLoading.has(post.id) ? (
                                        <div className="flex items-center gap-2 py-4">
                                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                                            <span className="text-xs" style={{ color: '#5a5a7a' }}>Loading comments...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {(feedbackData[post.id] || []).map((fb: any) => (
                                                <div key={fb.id} className="flex gap-2.5">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                                                        style={{
                                                            background: fb.author_role === 'agency' ? '#f97316' : '#2a2a3d',
                                                            color: fb.author_role === 'agency' ? '#fff' : '#8a8aaa'
                                                        }}>
                                                        {(fb.author_name || fb.author_role)[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-white">{fb.author_name || fb.author_role}</span>
                                                            <span className="text-[10px]" style={{ color: '#5a5a7a' }}>{relativeTime(fb.created_at)}</span>
                                                            {fb.author_role === 'agency' && (
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400">Agency</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm mt-0.5" style={{ color: '#b0b0c0' }}>{fb.comment}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(feedbackData[post.id] || []).length === 0 && (
                                                <p className="text-xs py-2" style={{ color: '#5a5a7a' }}>No comments yet.</p>
                                            )}

                                            {/* Agency reply form */}
                                            <div className="flex gap-2 items-start pt-2" style={{ borderTop: '1px solid #1a1a27' }}>
                                                <div className="flex-1">
                                                    <textarea
                                                        value={replyText[post.id] || ''}
                                                        onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        placeholder="Reply as agency..."
                                                        maxLength={2000}
                                                        rows={2}
                                                        className="w-full bg-[#13131a] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#5a5a7a] focus:outline-none focus:border-[#3a3a5a] resize-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => submitAgencyReply(post.id, post.batch_token || null)}
                                                    disabled={replySubmitting.has(post.id) || !(replyText[post.id] || '').trim()}
                                                    className="shrink-0 p-2.5 rounded-lg transition-colors hover:opacity-90 disabled:opacity-40"
                                                    style={{ background: '#f97316', color: '#fff' }}>
                                                    {replySubmitting.has(post.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
