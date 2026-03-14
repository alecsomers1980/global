'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Sparkles, Image as ImageIcon, Calendar, X, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { PLATFORM_LABELS, PLATFORM_COLORS, PLATFORM_CHAR_LIMITS, type Platform } from '@/lib/utils'

export default function ComposePage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [content, setContent] = useState('')
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([])
    const [scheduledAt, setScheduledAt] = useState('')
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState('')

    const supabase = createClient()
    const router = useRouter()

    // Unwrap params
    useState(() => {
        params.then(p => setWorkspaceId(p.id))
    })

    // Shortest platform limit selected
    const maxChars = selectedPlatforms.length > 0
        ? Math.min(...selectedPlatforms.map(p => PLATFORM_CHAR_LIMITS[p]))
        : 2200

    const handleGenerateCaption = async () => {
        if (!workspaceId) return
        setGenerating(true)
        setError('')

        try {
            const res = await fetch(`/api/ai/caption`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId,
                    topic: content || 'Something engaging about our business',
                    platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram']
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setContent(data.caption)
        } catch (err: any) {
            setError(err.message || 'Failed to generate caption')
        } finally {
            setGenerating(false)
        }
    }

    const handleSave = async (status: 'draft' | 'pending_approval' | 'scheduled') => {
        if (!content.trim() || selectedPlatforms.length === 0) {
            setError('Please write some content and select at least one platform')
            return
        }

        setLoading(true)
        setError('')

        const postDate = scheduledAt ? new Date(scheduledAt).toISOString() : null

        // If scheduling, it must be in the future
        if (status === 'scheduled' && postDate && new Date(postDate) <= new Date()) {
            setError('Scheduled time must be in the future')
            setLoading(false)
            return
        }

        const { error: dbError } = await supabase
            .from('posts')
            .insert({
                workspace_id: workspaceId,
                content,
                platforms: selectedPlatforms,
                status: status,
                scheduled_at: postDate
            } as any)

        if (dbError) {
            setError(dbError.message)
            setLoading(false)
            return
        }

        router.push(`/dashboard/workspaces/${workspaceId}/calendar`)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <Link href={`/dashboard/workspaces/${workspaceId}`}
                    className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                    style={{ color: '#5a5a7a' }}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to workspace
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Platforms */}
                    <div className="glass-card p-5">
                        <h2 className="text-sm font-semibold text-white mb-3">Target Platforms</h2>
                        <div className="flex flex-wrap gap-2">
                            {(['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube'] as Platform[]).map(p => {
                                const active = selectedPlatforms.includes(p)
                                return (
                                    <button key={p}
                                        onClick={() => {
                                            setSelectedPlatforms(prev =>
                                                prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                                            )
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                        style={{
                                            background: active ? `${PLATFORM_COLORS[p]}15` : '#13131a',
                                            color: active ? PLATFORM_COLORS[p] : '#5a5a7a',
                                            border: `1px solid ${active ? `${PLATFORM_COLORS[p]}40` : '#2a2a3d'}`
                                        }}>
                                        {PLATFORM_LABELS[p]}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Composer */}
                    <div className="glass-card p-0 overflow-hidden flex flex-col" style={{ minHeight: '320px' }}>
                        <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid #1a1a27', background: '#13131a' }}>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded-lg text-[#5a5a7a] hover:text-white transition-colors" title="Add Image/Video">
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={handleGenerateCaption}
                                disabled={generating}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                AI Caption
                            </button>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to share?"
                            className="flex-1 w-full p-4 text-sm text-white bg-transparent outline-none resize-none placeholder-[#3d3d5a]"
                        />

                        <div className="flex items-center justify-between p-3 text-[11px]" style={{ borderTop: '1px solid #1a1a27', background: '#13131a' }}>
                            <span style={{ color: content.length > maxChars ? '#f87171' : '#5a5a7a' }}>
                                {content.length} / {maxChars} characters
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h2 className="text-sm font-semibold text-white mb-3">Scheduling</h2>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4a4a6a' }} />
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-orange-500/30"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>
                    </div>

                    <div className="glass-card p-5 space-y-2">
                        <h2 className="text-sm font-semibold text-white mb-3">Publishing</h2>

                        <button
                            onClick={() => handleSave('scheduled')}
                            disabled={loading || !scheduledAt}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
                            style={{ background: '#34d399', color: '#064e3b' }}>
                            <Send className="w-4 h-4" />
                            Schedule Post
                        </button>

                        <button
                            onClick={() => handleSave('pending_approval')}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            style={{ background: '#fbbf24', color: '#78350f' }}>
                            Send for Approval
                        </button>

                        <button
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                            style={{ background: '#1a1a27', color: '#8a8aaa', border: '1px solid #2a2a3d' }}>
                            Save as Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
