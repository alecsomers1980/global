'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, Calendar, AlertCircle, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { PLATFORM_COLORS } from '@/lib/utils'
import { MobileFramePreview } from '@/components/MobileFramePreview'

type PlatformKey = 'facebook' | 'instagram' | 'tiktok'

const PLATFORM_LIMITS: Record<PlatformKey, number> = { facebook: 600, instagram: 220, tiktok: 150 }
const DEFAULT_VARIANTS = {
    facebook: { content: '', hashtags: [] as string[] },
    instagram: { content: '', hashtags: [] as string[] },
    tiktok: { content: '', hashtags: [] as string[] },
}

export default function ComposePage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [activeTab, setActiveTab] = useState<PlatformKey>('facebook')
    const [platforms, setPlatforms] = useState<PlatformKey[]>(['facebook'])
    const [variants, setVariants] = useState<Record<PlatformKey, { content: string; hashtags: string[] }>>(DEFAULT_VARIANTS)
    const [firstComment, setFirstComment] = useState('')
    const [mediaUrls, setMediaUrls] = useState('')
    const [scheduledAt, setScheduledAt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPreview, setShowPreview] = useState(true)
    const [editPostId, setEditPostId] = useState<string | null>(null)
    const [brandKit, setBrandKit] = useState<any>(null)
    const [preloading, setPreloading] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            loadBrandKit(p.id)
        })
    }, [params])

    // Check for ?id= to load existing post
    useEffect(() => {
        const postId = searchParams.get('id')
        if (postId && workspaceId) loadPost(postId)
    }, [searchParams, workspaceId])

    const loadBrandKit = async (wsId: string) => {
        const { data } = await supabase
            .from('brand_kits')
            .select('logo_url, primary_color, accent_color')
            .eq('workspace_id', wsId)
            .maybeSingle()
        if (data) setBrandKit(data)
    }

    const loadPost = async (postId: string) => {
        setPreloading(true)
        const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single()
        if (data) {
            setEditPostId(postId)
            const post = data as any
            const plats = (post.platforms || ['facebook']) as PlatformKey[]
            setPlatforms(plats)
            if (plats.length > 0) setActiveTab(plats[0])

            const vars = post.variants || {}
            setVariants({
                facebook: { content: vars.facebook?.content || post.content || '', hashtags: vars.facebook?.hashtags || [] },
                instagram: { content: vars.instagram?.content || '', hashtags: vars.instagram?.hashtags || [] },
                tiktok: { content: vars.tiktok?.content || '', hashtags: vars.tiktok?.hashtags || [] },
            })

            if (post.first_comment) setFirstComment(post.first_comment)
            if (post.media_urls?.length) setMediaUrls(post.media_urls.join(', '))
            if (post.scheduled_at) {
                // Convert UTC ISO to local datetime-local value
                const d = new Date(post.scheduled_at)
                const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                setScheduledAt(local)
            }
        }
        setPreloading(false)
    }

    const togglePlatform = (p: PlatformKey) => {
        setPlatforms(prev => {
            if (prev.includes(p)) {
                const next = prev.filter(x => x !== p)
                if (next.length === 0) return prev // at least one
                if (activeTab === p) setActiveTab(next[0])
                return next
            }
            return [...prev, p]
        })
    }

    const updateVariant = (platform: PlatformKey, field: 'content' | 'hashtags', value: string) => {
        setVariants(prev => ({
            ...prev,
            [platform]: {
                ...prev[platform],
                [field]: field === 'hashtags'
                    ? value.split(',').map(h => h.trim()).filter(Boolean)
                    : value
            }
        }))
    }

    const charCount = variants[activeTab].content.length
    const charLimit = PLATFORM_LIMITS[activeTab]
    const charRatio = charCount / charLimit
    const charColor = charRatio > 1 ? '#f87171' : charRatio >= 0.9 ? '#fbbf24' : '#5a5a7a'

    const handleSave = async (status: 'draft' | 'pending_approval') => {
        // Validate at least one platform has content
        const hasContent = Object.values(variants).some(v => v.content.trim())
        if (!hasContent) {
            setError('Please write content for at least one platform')
            return
        }
        if (platforms.length === 0) {
            setError('Please select at least one platform')
            return
        }

        setLoading(true)
        setError('')

        const mediaUrlList = mediaUrls
            ? mediaUrls.split(',').map(u => u.trim()).filter(Boolean)
            : null

        const cleanVariants: Record<string, { content: string; hashtags: string[] }> = {}
        for (const p of platforms) {
            cleanVariants[p] = {
                content: variants[p].content,
                hashtags: variants[p].hashtags
            }
        }

        const payload: any = {
            variants: cleanVariants,
            platforms,
            media_urls: mediaUrlList,
            first_comment: firstComment.trim() || null,
        }

        // Content fallback for publish.ts
        if (cleanVariants.facebook?.content) {
            payload.content = cleanVariants.facebook.content
        } else if (cleanVariants.instagram?.content) {
            payload.content = cleanVariants.instagram.content
        } else if (cleanVariants.tiktok?.content) {
            payload.content = cleanVariants.tiktok.content
        }

        if (scheduledAt) {
            payload.scheduled_at = new Date(scheduledAt).toISOString()
        }

        if (editPostId) {
            // Update existing post
            const res = await fetch('/api/workspaces/posts/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: editPostId, ...payload, status }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Failed to update post')
                setLoading(false)
                return
            }
        } else {
            // Insert new post
            const { error: dbError } = await supabase
                .from('posts')
                .insert({
                    workspace_id: workspaceId,
                    content: payload.content || '',
                    variants: payload.variants,
                    platforms: payload.platforms,
                    media_urls: payload.media_urls,
                    first_comment: payload.first_comment,
                    scheduled_at: payload.scheduled_at || null,
                    status,
                } as any)

            if (dbError) {
                setError(dbError.message)
                setLoading(false)
                return
            }
        }

        router.push(`/dashboard/workspaces/${workspaceId}/calendar`)
    }

    if (preloading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const activeContent = variants[activeTab].content
    const activeHashtags = variants[activeTab].hashtags.join(', ')

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <Link href={`/dashboard/workspaces/${workspaceId}`}
                    className="flex items-center gap-1.5 text-sm transition-colors hover:text-white"
                    style={{ color: '#5a5a7a' }}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to workspace
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-white/5"
                        style={{ border: '1px solid #2a2a3d', color: '#5a5a7a' }}>
                        {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showPreview ? 'Hide' : 'Preview'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* LEFT: Editor */}
                <div className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Platform toggles */}
                    <div className="glass-card p-4">
                        <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3a3a5a' }}>Platforms</h2>
                        <div className="flex flex-wrap gap-2">
                            {(['facebook', 'instagram', 'tiktok'] as PlatformKey[]).map(p => {
                                const active = platforms.includes(p)
                                return (
                                    <button key={p} onClick={() => togglePlatform(p)}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                        style={{
                                            background: active ? `${PLATFORM_COLORS[p]}18` : '#13131a',
                                            color: active ? PLATFORM_COLORS[p] : '#5a5a7a',
                                            border: `1px solid ${active ? `${PLATFORM_COLORS[p]}40` : '#2a2a3d'}`
                                        }}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Per-platform tabs */}
                    <div className="glass-card p-0 overflow-hidden">
                        <div className="flex" style={{ borderBottom: '1px solid #1a1a27' }}>
                            {(['facebook', 'instagram', 'tiktok'] as PlatformKey[]).map(p => {
                                const enabled = platforms.includes(p)
                                return (
                                    <button key={p} onClick={() => enabled && setActiveTab(p)}
                                        disabled={!enabled}
                                        className="flex-1 py-3 text-xs font-semibold transition-all relative disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{
                                            color: activeTab === p && enabled ? PLATFORM_COLORS[p] : '#5a5a7a',
                                            borderBottom: activeTab === p && enabled ? `2px solid ${PLATFORM_COLORS[p]}` : '2px solid transparent',
                                        }}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Content textarea */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a3a5a' }}>
                                        Content ({activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})
                                    </label>
                                    <span className="text-[11px] font-medium" style={{ color: charColor }}>
                                        {charCount} / {charLimit}
                                    </span>
                                </div>
                                <textarea
                                    value={activeContent}
                                    onChange={e => updateVariant(activeTab, 'content', e.target.value)}
                                    placeholder={`Write your ${activeTab} post...`}
                                    rows={5}
                                    className="w-full p-3 rounded-xl text-sm text-white bg-[#13131a] border border-[#2a2a3d] outline-none resize-none placeholder:text-[#3d3d5a] focus:border-[#3a3a5a]"
                                />
                                {charRatio > 1 && (
                                    <p className="text-[11px] mt-1" style={{ color: '#f87171' }}>Over the {charLimit}-character limit</p>
                                )}
                            </div>

                            {/* Hashtags */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#3a3a5a' }}>
                                    Hashtags
                                </label>
                                <input
                                    value={activeHashtags}
                                    onChange={e => updateVariant(activeTab, 'hashtags', e.target.value)}
                                    placeholder="comma, separated, hashtags"
                                    className="w-full px-3 py-2 rounded-lg text-sm text-white bg-[#13131a] border border-[#2a2a3d] outline-none placeholder:text-[#3d3d5a] focus:border-[#3a3a5a]"
                                />
                            </div>

                            {/* Instagram first comment */}
                            {activeTab === 'instagram' && (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#3a3a5a' }}>
                                        First comment (Instagram only)
                                    </label>
                                    <textarea
                                        value={firstComment}
                                        onChange={e => setFirstComment(e.target.value)}
                                        placeholder="This comment will be posted immediately after the post goes live..."
                                        maxLength={500}
                                        rows={3}
                                        className="w-full p-3 rounded-xl text-sm text-white bg-[#13131a] border border-[#2a2a3d] outline-none resize-none placeholder:text-[#3d3d5a] focus:border-[#3a3a5a]"
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[10px] italic" style={{ color: '#5a5a7a' }}>
                                            Posted as the first comment after publish &mdash; keeps hashtags out of the caption. Max 500 chars.
                                        </span>
                                        <span className="text-[10px] font-medium ml-2 shrink-0" style={{ color: firstComment.length > 450 ? '#fbbf24' : '#5a5a7a' }}>
                                            {firstComment.length} / 500
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shared fields */}
                    <div className="glass-card p-4 space-y-4">
                        <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a3a5a' }}>Post Settings</h2>

                        {/* Media URLs */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#3a3a5a' }}>
                                Media URLs
                            </label>
                            <input
                                value={mediaUrls}
                                onChange={e => setMediaUrls(e.target.value)}
                                placeholder="comma, separated, image, urls"
                                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-[#13131a] border border-[#2a2a3d] outline-none placeholder:text-[#3d3d5a] focus:border-[#3a3a5a]"
                            />
                            <p className="text-[10px] mt-1 italic" style={{ color: '#5a5a7a' }}>
                                If the post was generated by the Marketing Plan, the AI-generated image is already attached &mdash; leave blank to keep it.
                            </p>
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#3a3a5a' }}>
                                Scheduled at
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4a4a6a' }} />
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-orange-500/30"
                                    style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                                />
                            </div>
                            <p className="text-[10px] mt-1 italic" style={{ color: '#5a5a7a' }}>
                                Posting window is 09:00&ndash;17:00 SAST.
                            </p>
                        </div>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-3 pb-8">
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:bg-white/5"
                            style={{ border: '1px solid #2a2a3d', color: '#a0a0c0' }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleSave('pending_approval')}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {editPostId ? 'Update Post' : 'Save & Submit'}
                        </button>
                    </div>
                </div>

                {/* RIGHT: Live preview — hidden on mobile unless toggled */}
                <div className={`space-y-4 pb-8 ${showPreview ? '' : 'hidden lg:block'}`}>
                    <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3a3a5a' }}>Live Preview</h2>

                    <div className="space-y-6 lg:sticky lg:top-24">
                        {platforms.includes('facebook') && (
                            <MobileFramePreview
                                platform="facebook"
                                content={variants.facebook.content}
                                hashtags={variants.facebook.hashtags}
                                mediaUrl={mediaUrls ? mediaUrls.split(',')[0].trim() : null}
                                brandKit={brandKit}
                            />
                        )}
                        {platforms.includes('instagram') && (
                            <MobileFramePreview
                                platform="instagram"
                                content={variants.instagram.content}
                                hashtags={variants.instagram.hashtags}
                                mediaUrl={mediaUrls ? mediaUrls.split(',')[0].trim() : null}
                                brandKit={brandKit}
                                firstComment={firstComment.trim() || null}
                            />
                        )}
                        {platforms.includes('tiktok') && (
                            <MobileFramePreview
                                platform="tiktok"
                                content={variants.tiktok.content}
                                hashtags={variants.tiktok.hashtags}
                                mediaUrl={mediaUrls ? mediaUrls.split(',')[0].trim() : null}
                                brandKit={brandKit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
