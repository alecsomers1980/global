'use client'

import { useState } from 'react'
import { Check, RotateCcw, Clock, Image as ImageIcon, Play, Facebook, Youtube, Instagram, Loader2 } from 'lucide-react'
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@/lib/utils'
import type { Database } from '@/types/database'

type BrandKit = Database['public']['Tables']['brand_kits']['Row']

interface PostPreviewCardProps {
    post: {
        id: string
        content: string
        media_urls: string[] | null
        platforms: string[]
        scheduled_at: string | null
        status: string
        created_at?: string
    }
    brandKit?: BrandKit | null
    showActions?: boolean
    onApprove?: (postId: string) => Promise<void> | void
    onReject?: (postId: string) => Promise<void> | void
}

const STATUS_DOT: Record<string, string> = {
    draft: '#6b7280',
    pending_approval: '#fbbf24',
    approved: '#34d399',
    scheduled: '#60a5fa',
    publishing: '#a78bfa',
    published: '#34d399',
    failed: '#f87171',
}

const STATUS_LABEL: Record<string, string> = {
    draft: 'Draft',
    pending_approval: 'Awaiting Approval',
    approved: 'Approved',
    scheduled: 'Scheduled',
    publishing: 'Publishing',
    published: 'Published',
    failed: 'Failed',
}

const PLATFORM_ICONS: Record<string, typeof Facebook> = {
    facebook: Facebook,
    youtube: Youtube,
    instagram: Instagram,
}

function isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url)
}

function PlatformMockup({ platform, content, mediaUrl, brandKit }: {
    platform: string
    content: string
    mediaUrl?: string | null
    brandKit?: BrandKit | null
}) {
    const accent = brandKit?.primary_color || '#f97316'
    const truncated = content.length > 180 ? content.slice(0, 180) + '...' : content

    if (platform === 'facebook') {
        return (
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a27', border: '1px solid #2a2a3d' }}>
                {/* FB header */}
                <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ borderBottom: '1px solid #2a2a3d' }}>
                    {brandKit?.logo_url ? (
                        <img src={brandKit.logo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: accent }}>
                            <Facebook className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-semibold text-white">Page Name</p>
                        <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Just now</p>
                    </div>
                </div>
                {/* Content */}
                <div className="px-3 py-2.5">
                    <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#c0c0d0' }}>{truncated}</p>
                </div>
                {/* Media */}
                {mediaUrl && (
                    <div className="relative aspect-video" style={{ background: '#13131a' }}>
                        {isImageUrl(mediaUrl) ? (
                            <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-10 h-10 text-white/40" />
                            </div>
                        )}
                    </div>
                )}
                {/* Engagement bar */}
                <div className="flex items-center justify-between px-3 py-2" style={{ borderTop: '1px solid #2a2a3d' }}>
                    <span className="text-[10px]" style={{ color: '#5a5a7a' }}>Like</span>
                    <span className="text-[10px]" style={{ color: '#5a5a7a' }}>Comment</span>
                    <span className="text-[10px]" style={{ color: '#5a5a7a' }}>Share</span>
                </div>
                <div className="px-3 pb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: PLATFORM_COLORS.facebook }}>Facebook</span>
                </div>
            </div>
        )
    }

    if (platform === 'instagram') {
        return (
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a27', border: '1px solid #2a2a3d' }}>
                {/* IG header */}
                <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ borderBottom: '1px solid #2a2a3d' }}>
                    {brandKit?.logo_url ? (
                        <img src={brandKit.logo_url} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: `2px solid ${accent}` }} />
                    ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                            <Instagram className="w-3.5 h-3.5 text-white" />
                        </div>
                    )}
                    <p className="text-xs font-semibold text-white">account</p>
                </div>
                {/* Media area (square) */}
                <div className="relative aspect-square" style={{ background: '#13131a' }}>
                    {mediaUrl && isImageUrl(mediaUrl) ? (
                        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                    ) : mediaUrl ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-10 h-10 text-white/40" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-white/10" />
                        </div>
                    )}
                </div>
                {/* Caption */}
                <div className="px-3 py-2.5">
                    <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: '#c0c0d0' }}>
                        <span className="font-semibold text-white">account </span>{truncated}
                    </p>
                </div>
                <div className="px-3 pb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: PLATFORM_COLORS.instagram }}>Instagram</span>
                </div>
            </div>
        )
    }

    if (platform === 'youtube') {
        return (
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a27', border: '1px solid #2a2a3d' }}>
                {/* Thumbnail (16:9) */}
                <div className="relative aspect-video" style={{ background: '#13131a' }}>
                    {mediaUrl && isImageUrl(mediaUrl) ? (
                        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-14 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,0,0,0.9)' }}>
                                <Play className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                </div>
                {/* Video info */}
                <div className="flex gap-2.5 px-3 py-2.5">
                    {brandKit?.logo_url ? (
                        <img src={brandKit.logo_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FF0000' }}>
                            <Youtube className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-white line-clamp-2">{content.split('\n')[0]}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#5a5a7a' }}>Channel Name</p>
                    </div>
                </div>
                <div className="px-3 pb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: PLATFORM_COLORS.youtube }}>YouTube</span>
                </div>
            </div>
        )
    }

    // Generic fallback for linkedin, tiktok, etc.
    return (
        <div className="rounded-xl overflow-hidden p-3" style={{ background: '#1a1a27', border: '1px solid #2a2a3d' }}>
            <p className="text-xs leading-relaxed whitespace-pre-wrap mb-2" style={{ color: '#c0c0d0' }}>{truncated}</p>
            {mediaUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden" style={{ background: '#13131a' }}>
                    {isImageUrl(mediaUrl) ? (
                        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/40" />
                        </div>
                    )}
                </div>
            )}
            <div className="mt-2">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || '#8a8aaa' }}>
                    {PLATFORM_LABELS[platform as keyof typeof PLATFORM_LABELS] || platform}
                </span>
            </div>
        </div>
    )
}

export function PostPreviewCard({ post, brandKit, showActions, onApprove, onReject }: PostPreviewCardProps) {
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const accent = brandKit?.accent_color || '#f97316'
    const firstMedia = post.media_urls?.[0] || null

    const handleApprove = async () => {
        if (!onApprove) return
        setActionLoading('approve')
        await onApprove(post.id)
        setActionLoading(null)
    }

    const handleReject = async () => {
        if (!onReject) return
        setActionLoading('reject')
        await onReject(post.id)
        setActionLoading(null)
    }

    return (
        <div className="glass-card overflow-hidden" style={{ borderLeft: `4px solid ${accent}` }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3" style={{ background: '#13131a', borderBottom: '1px solid #1a1a27' }}>
                <div className="flex items-center gap-3">
                    {brandKit?.logo_url ? (
                        <img src={brandKit.logo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                        <div className="w-6 h-6 rounded-full" style={{ background: accent }} />
                    )}
                    <div className="flex items-center gap-2">
                        {post.platforms.map(p => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
                                style={{ background: `${PLATFORM_COLORS[p as keyof typeof PLATFORM_COLORS] || '#6b7280'}20`, color: PLATFORM_COLORS[p as keyof typeof PLATFORM_COLORS] || '#8a8aaa' }}>
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {post.scheduled_at && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" style={{ color: '#5a5a7a' }} />
                            <span className="text-[11px]" style={{ color: '#5a5a7a' }}>
                                {new Date(post.scheduled_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}{' '}
                                {new Date(post.scheduled_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_DOT[post.status] || '#6b7280' }} />
                        <span className="text-[11px] font-medium" style={{ color: STATUS_DOT[post.status] || '#6b7280' }}>
                            {STATUS_LABEL[post.status] || post.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content + Platform mockups */}
            <div className="p-5">
                {/* Full content text */}
                <div className="mb-5 p-4 rounded-xl" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3a3a5a' }}>Post Content</p>
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>

                {/* Media gallery */}
                {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#3a3a5a' }}>Media ({post.media_urls.length})</p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {post.media_urls.map((url, i) => (
                                <div key={i} className="w-24 h-24 rounded-lg overflow-hidden shrink-0" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                                    {isImageUrl(url) ? (
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white/30" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Platform previews */}
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3a3a5a' }}>Platform Previews</p>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(post.platforms.length, 3)}, 1fr)` }}>
                    {post.platforms.map(p => (
                        <PlatformMockup
                            key={p}
                            platform={p}
                            content={post.content}
                            mediaUrl={firstMedia}
                            brandKit={brandKit}
                        />
                    ))}
                </div>
            </div>

            {/* Action buttons */}
            {showActions && post.status === 'pending_approval' && (
                <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #1a1a27', background: '#0d0d14' }}>
                    <button
                        onClick={handleReject}
                        disabled={actionLoading !== null}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:bg-white/5"
                        style={{ border: '1px solid #2a2a3d', color: '#a0a0c0' }}>
                        {actionLoading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        Request Changes
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={actionLoading !== null}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-green-500/20"
                        style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}>
                        {actionLoading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Approve
                    </button>
                </div>
            )}

            {/* Already actioned indicator */}
            {showActions && post.status === 'approved' && (
                <div className="flex items-center justify-center gap-2 px-5 py-3" style={{ borderTop: '1px solid #1a1a27', background: 'rgba(52,211,153,0.05)' }}>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Approved</span>
                </div>
            )}

            {showActions && post.status === 'draft' && (
                <div className="flex items-center justify-center gap-2 px-5 py-3" style={{ borderTop: '1px solid #1a1a27', background: 'rgba(107,114,128,0.05)' }}>
                    <RotateCcw className="w-4 h-4" style={{ color: '#6b7280' }} />
                    <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Changes Requested</span>
                </div>
            )}
        </div>
    )
}
