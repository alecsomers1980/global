'use client'

import { PLATFORM_COLORS } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

interface Props {
    platform: 'facebook' | 'instagram' | 'tiktok'
    content: string
    hashtags: string[]
    mediaUrl: string | null
    brandKit?: { logo_url?: string | null; primary_color?: string; accent_color?: string } | null
    firstComment?: string | null
}

function truncate(text: string, max: number): { text: string; truncated: boolean } {
    if (text.length <= max) return { text, truncated: false }
    return { text: text.slice(0, max) + '...', truncated: true }
}

export function MobileFramePreview({ platform, content, hashtags, mediaUrl, brandKit, firstComment }: Props) {
    const accent = brandKit?.primary_color || brandKit?.accent_color || '#f97316'
    const logoUrl = brandKit?.logo_url || null
    const color = PLATFORM_COLORS[platform] || '#8a8aaa'
    const isIg = platform === 'instagram'

    const maxContent = platform === 'facebook' ? 180 : platform === 'instagram' ? 125 : 80
    const displayContent = content
        ? truncate(content, maxContent)
        : { text: 'Write your post content...', truncated: false }

    const hashtagsStr = hashtags.length > 0 ? hashtags.join(' ') : ''

    return (
        <div className="flex flex-col items-center">
            {/* Label */}
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5 px-2 py-0.5 rounded"
                style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                {platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'TikTok'}
            </span>

            {/* Phone frame */}
            <div className="w-[260px] rounded-[24px] p-2"
                style={{ background: '#1a1a24', border: '3px solid #2a2a34', boxShadow: '0 0 0 1px #3a3a4a, 0 20px 40px -8px rgba(0,0,0,0.5)' }}>
                {/* Notch */}
                <div className="flex justify-center mb-1.5">
                    <div className="w-16 h-3 rounded-full" style={{ background: '#0a0a0f' }} />
                </div>

                {/* Screen area */}
                <div className="rounded-[16px] overflow-hidden flex flex-col text-xs" style={{ background: platform === 'tiktok' ? '#000' : '#0d0d14', minHeight: '320px' }}>
                    {/* Platform header */}
                    <div className="flex items-center gap-2 px-2.5 py-2 shrink-0"
                        style={{ borderBottom: `1px solid ${platform === 'tiktok' ? '#1a1a1a' : '#1a1a27'}` }}>
                        {logoUrl ? (
                            <img src={logoUrl} alt="" className="w-6 h-6 rounded-full object-cover border"
                                style={{ borderColor: isIg ? accent : 'transparent', borderWidth: isIg ? 2 : 0 }} />
                        ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                                style={{ background: isIg ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' : accent, color: '#fff' }}>
                                {platform[0].toUpperCase()}
                            </div>
                        )}
                        <span className="text-[10px] font-semibold text-white truncate">
                            {isIg ? 'account' : 'Page Name'}
                        </span>
                    </div>

                    {/* Media — 4:5 aspect, uncropped */}
                    {mediaUrl ? (
                        <div className="relative aspect-[4/5] bg-black">
                            <img src={mediaUrl} alt="" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="aspect-[4/5] flex items-center justify-center" style={{ background: platform === 'tiktok' ? '#111' : '#13131a' }}>
                            <span className="text-[9px]" style={{ color: '#3a3a5a' }}>No image</span>
                        </div>
                    )}

                    {/* Content area */}
                    <div className="px-2.5 py-2 space-y-1.5 flex-1">
                        {/* Caption */}
                        <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: platform === 'tiktok' ? '#d0d0d0' : '#c0c0d0' }}>
                            <span className="font-semibold text-white">{isIg ? 'account ' : ''}</span>
                            {displayContent.text}
                        </p>

                        {/* Hashtags */}
                        {hashtagsStr && (
                            <p className="text-[10px] leading-relaxed" style={{ color: accent }}>{hashtagsStr}</p>
                        )}

                        {/* "See more" indicator */}
                        {displayContent.truncated && (
                            <span className="text-[9px]" style={{ color: '#5a5a7a' }}>... see more</span>
                        )}

                        {/* First comment (IG only) */}
                        {isIg && firstComment && (
                            <div className="mt-1.5 pt-1.5" style={{ borderTop: '1px solid #1a1a27' }}>
                                <p className="text-[11px] leading-relaxed" style={{ color: '#8a8aaa' }}>
                                    <span className="font-semibold" style={{ color: '#b0b0c0' }}>account </span>
                                    {firstComment.length > 120 ? firstComment.slice(0, 120) + '...' : firstComment}
                                </p>
                                <span className="text-[8px] italic mt-0.5 block" style={{ color: '#4a4a6a' }}>
                                    First comment * posted automatically
                                </span>
                            </div>
                        )}

                        {/* Empty first comment hint (IG only) */}
                        {isIg && !firstComment && (
                            <div className="mt-1.5 pt-1.5" style={{ borderTop: '1px solid #1a1a27' }}>
                                <span className="text-[8px] italic" style={{ color: '#3a3a5a' }}>
                                    First comment not set
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Platform footer */}
                    <div className="px-2.5 py-1.5 flex items-center gap-4 shrink-0" style={{ borderTop: `1px solid ${platform === 'tiktok' ? '#1a1a1a' : '#1a1a27'}` }}>
                        <MessageCircle className="w-3 h-3" style={{ color: '#3a3a5a' }} />
                        <span className="text-[9px]" style={{ color: '#3a3a5a' }}>
                            {platform === 'facebook' ? 'Like' : platform === 'instagram' ? 'View all comments' : 'Comments'}
                        </span>
                    </div>
                </div>

                {/* Home bar */}
                <div className="flex justify-center mt-1.5 pb-0.5">
                    <div className="w-10 h-1 rounded-full" style={{ background: '#2a2a34' }} />
                </div>
            </div>
        </div>
    )
}
