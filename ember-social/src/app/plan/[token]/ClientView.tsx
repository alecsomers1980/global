'use client'

import { useState, useEffect } from 'react'
import { Check, Clock, ChevronDown, ChevronUp, MessageSquare, Send, Calendar, List, ImageOff } from 'lucide-react'
import { PLATFORM_COLORS } from '@/lib/utils'

interface PostData {
    id: string
    scheduled_at: string
    pillar?: string | null
    tagline?: string | null
    tagline_accent?: string | null
    client_status?: string
    status: string
    variants?: any
    media_urls?: string[] | null
    rationale?: string | null
    psychology_note?: string | null
    regeneration_count?: number
    referred_to_agency?: boolean
    first_comment?: string | null
}

const MAX_AUTO_REGENERATIONS = 3

interface Props {
    posts: PostData[]
    token: string
    primaryColor: string
    dateRange: string
}

export function PlanView({ posts: initialPosts, token, primaryColor, dateRange }: Props) {
    const [view, setView] = useState<'list' | 'calendar'>('list')
    const [posts, setPosts] = useState<PostData[]>(initialPosts)

    const handleImageUpdate = (postId: string, mediaUrl: string, newCount: number) => {
        setPosts(prev => prev.map(p => p.id === postId
            ? { ...p, media_urls: [mediaUrl], regeneration_count: newCount }
            : p
        ))
    }

    function fmtPostDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    function fmtPostTime(iso: string) {
        return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    }

    function renderTagline(tagline: string | null, accent: string | null) {
        if (!tagline) return null
        const lines = tagline.split(' | ')
        return (
            <div className="mb-4">
                {lines.map((line, li) => {
                    const words = line.split(' ')
                    return (
                        <p key={li} className="text-lg font-black uppercase tracking-wider leading-tight">
                            {words.map((word, wi) => {
                                const clean = word.replace(/[^a-zA-Z0-9-]/g, '')
                                const isAccent = accent && clean.toLowerCase() === accent.toLowerCase()
                                return (
                                    <span key={wi}>
                                        {wi > 0 && ' '}
                                        <span style={isAccent ? { color: primaryColor } : { color: '#fff' }}>{word}</span>
                                    </span>
                                )
                            })}
                        </p>
                    )
                })}
            </div>
        )
    }

    function clientStatusBadge(status: string) {
        if (status === 'approved') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
                    <Check className="w-3 h-3" /> Approved
                </span>
            )
        }
        if (status === 'changes_requested') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Clock className="w-3 h-3" /> Changes Requested
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
                Pending
            </span>
        )
    }

    return (
        <>
            {/* View toggle */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setView('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'list' ? '' : 'hover:bg-white/5'}`}
                    style={view === 'list'
                        ? { background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}30` }
                        : { border: '1px solid #2a2a3d', color: '#5a5a7a' }
                    }>
                    <List className="w-3.5 h-3.5" /> List
                </button>
                <button
                    onClick={() => setView('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'calendar' ? '' : 'hover:bg-white/5'}`}
                    style={view === 'calendar'
                        ? { background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}30` }
                        : { border: '1px solid #2a2a3d', color: '#5a5a7a' }
                    }>
                    <Calendar className="w-3.5 h-3.5" /> Calendar
                </button>
            </div>

            {view === 'list' ? (
                /* List view */
                <div className="space-y-6">
                    {posts.map((post, i) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            index={i}
                            token={token}
                            primaryColor={primaryColor}
                            fmtPostDate={fmtPostDate}
                            fmtPostTime={fmtPostTime}
                            renderTagline={renderTagline}
                            clientStatusBadge={clientStatusBadge}
                            onImageUpdate={handleImageUpdate}
                        />
                    ))}
                </div>
            ) : (
                /* Calendar view */
                <CalendarView posts={posts} primaryColor={primaryColor} />
            )}
        </>
    )
}

function CalendarView({ posts, primaryColor }: { posts: PostData[]; primaryColor: string }) {
    const dates = posts.map(p => new Date(p.scheduled_at)).filter(d => !isNaN(d.getTime()))
    if (dates.length === 0) return <p className="text-sm text-[#5a5a7a]">No scheduled posts.</p>

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

    // Build month grid
    const year = minDate.getFullYear()
    const month = minDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()

    // Count posts per day
    const counts: Record<string, number> = {}
    for (const d of dates) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        counts[key] = (counts[key] || 0) + 1
    }

    const monthLabel = firstDay.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const cells: (number | null)[] = []
    for (let i = 0; i < startDayOfWeek; i++) cells.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d)

    return (
        <div className="glass-card p-5">
            <h2 className="text-lg font-bold text-white text-center mb-4">{monthLabel}</h2>
            <div className="grid grid-cols-7 gap-1">
                {dayNames.map(dn => (
                    <div key={dn} className="text-center text-[10px] font-semibold uppercase py-1" style={{ color: '#5a5a7a' }}>
                        {dn}
                    </div>
                ))}
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e${i}`} className="aspect-square" />
                    const dateKey = `${year}-${month}-${day}`
                    const count = counts[dateKey] || 0
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                    return (
                        <div key={day}
                            className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors"
                            style={{
                                background: count > 0 ? `${primaryColor}18` : (isToday ? '#1a1a27' : 'transparent'),
                                color: count > 0 ? primaryColor : (isToday ? '#fff' : '#5a5a7a'),
                                border: isToday ? `1px solid ${primaryColor}40` : '1px solid transparent',
                            }}>
                            <span className="text-xs">{day}</span>
                            {count > 0 && <span className="text-[10px] font-bold mt-0.5">{count}</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function PostCard({ post, index, token, primaryColor, fmtPostDate, fmtPostTime, renderTagline, clientStatusBadge, onImageUpdate }: {
    post: PostData
    index: number
    token: string
    primaryColor: string
    fmtPostDate: (iso: string) => string
    fmtPostTime: (iso: string) => string
    renderTagline: (t: string | null, a: string | null) => React.ReactNode
    clientStatusBadge: (s: string) => React.ReactNode
    onImageUpdate: (postId: string, mediaUrl: string, newCount: number) => void
}) {
    const variants = post.variants || {}
    const fbVariant = variants.facebook || {}
    const igVariant = variants.instagram || {}
    const tkVariant = variants.tiktok || {}
    const mediaUrl = post.media_urls?.[0] || null

    return (
        <div className="glass-card overflow-hidden">
            {/* Post header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ background: '#13131a', borderBottom: '1px solid #1a1a27' }}>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#5a5a7a' }}>
                        Post {index + 1}
                    </span>
                    {post.pillar && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase"
                            style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}30` }}>
                            {post.pillar}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" style={{ color: '#5a5a7a' }} />
                        <span className="text-[11px]" style={{ color: '#5a5a7a' }}>
                            {fmtPostDate(post.scheduled_at)} {fmtPostTime(post.scheduled_at)}
                        </span>
                    </div>
                    {clientStatusBadge(post.client_status || 'pending')}
                </div>
            </div>

            <div className="p-5 space-y-4">
                {post.tagline && renderTagline(post.tagline, post.tagline_accent)}

                {mediaUrl ? (
                    <div className="rounded-xl overflow-hidden" style={{ background: '#13131a' }}>
                        {/\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl)
                            ? <video controls playsInline preload="auto" className="w-full h-auto block">
                                <source src={mediaUrl} type="video/mp4" />
                              </video>
                            : <img src={mediaUrl} alt="" className="w-full h-auto block" />}
                    </div>
                ) : (
                    <div className="aspect-square rounded-xl flex items-center justify-center" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                        <ImageOff className="w-8 h-8 text-white/10" />
                    </div>
                )}

                {/* Platform tabs */}
                <div className="space-y-2">
                    {fbVariant.content && (
                        <div className="rounded-xl p-4" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                                    style={{ background: `${PLATFORM_COLORS.facebook}20`, color: PLATFORM_COLORS.facebook }}>
                                    Facebook
                                </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-white">{fbVariant.content}</p>
                            {fbVariant.hashtags?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {fbVariant.hashtags.map((h: string) => (
                                        <span key={h} className="text-[11px]" style={{ color: primaryColor }}>{h}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {igVariant.content && (
                        <details className="rounded-xl p-4 cursor-pointer group" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                            <summary className="flex items-center gap-2 list-none">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                                    style={{ background: `${PLATFORM_COLORS.instagram}20`, color: PLATFORM_COLORS.instagram }}>
                                    Instagram
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 group-open:hidden" style={{ color: '#5a5a7a' }} />
                                <ChevronUp className="w-3.5 h-3.5 hidden group-open:block" style={{ color: '#5a5a7a' }} />
                            </summary>
                            <div className="mt-2">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed text-white">{igVariant.content}</p>
                                {igVariant.hashtags?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {igVariant.hashtags.map((h: string) => (
                                            <span key={h} className="text-[11px]" style={{ color: primaryColor }}>{h}</span>
                                        ))}
                                    </div>
                                )}
                                {post.first_comment && (
                                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid #1a1a27' }}>
                                        <p className="text-xs italic" style={{ color: '#8a8aaa' }}>
                                            <span className="font-semibold not-italic" style={{ color: '#b0b0c0' }}>First comment: </span>
                                            {post.first_comment.length > 200 ? post.first_comment.slice(0, 200) + '...' : post.first_comment}
                                        </p>
                                        <span className="text-[9px] italic mt-0.5 block" style={{ color: '#5a5a7a' }}>
                                            Posted automatically after publish
                                        </span>
                                    </div>
                                )}
                            </div>
                        </details>
                    )}
                    {tkVariant.content && (
                        <details className="rounded-xl p-4 cursor-pointer group" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                            <summary className="flex items-center gap-2 list-none">
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                                    style={{ background: `${PLATFORM_COLORS.tiktok}20`, color: PLATFORM_COLORS.tiktok }}>
                                    TikTok
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 group-open:hidden" style={{ color: '#5a5a7a' }} />
                                <ChevronUp className="w-3.5 h-3.5 hidden group-open:block" style={{ color: '#5a5a7a' }} />
                            </summary>
                            <div className="mt-2">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed text-white">{tkVariant.content}</p>
                                {tkVariant.hashtags?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {tkVariant.hashtags.map((h: string) => (
                                            <span key={h} className="text-[11px]" style={{ color: primaryColor }}>{h}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </details>
                    )}
                </div>

                {post.psychology_note && (
                    <details className="mt-3 cursor-pointer group">
                        <summary className="text-xs font-semibold uppercase tracking-widest list-none" style={{ color: '#3a3a5a' }}>
                            Why this works
                        </summary>
                        <p className="text-xs italic mt-1" style={{ color: '#5a5a7a' }}>{post.psychology_note}</p>
                    </details>
                )}
                {post.rationale && (
                    <p className="text-xs italic mt-3" style={{ color: '#5a5a7a' }}>{post.rationale}</p>
                )}
            </div>

            {/* Client actions + comments */}
            <ClientActions post={post} token={token} primaryColor={primaryColor} onImageUpdate={onImageUpdate} />
        </div>
    )
}

function ClientActions({ post, token, primaryColor, onImageUpdate }: {
    post: PostData
    token: string
    primaryColor: string
    onImageUpdate: (postId: string, mediaUrl: string, newCount: number) => void
}) {
    const [localStatus, setLocalStatus] = useState<string>(post.client_status || 'pending')
    const [regenCount, setRegenCount] = useState<number>(post.regeneration_count || 0)
    const [referred, setReferred] = useState<boolean>(post.referred_to_agency || false)
    const [busy, setBusy] = useState<'approve' | 'request_changes' | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [showReason, setShowReason] = useState(false)
    const [reasonText, setReasonText] = useState('')

    const regenLeft = Math.max(0, MAX_AUTO_REGENERATIONS - regenCount)

    async function approve() {
        setBusy('approve')
        setErrorMsg(null)
        try {
            const res = await fetch(`/api/posts/${post.id}/client-action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, action: 'approve' }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.ok) setErrorMsg(data.error || 'Something went wrong.')
            else setLocalStatus('approved')
        } catch (err: any) {
            setErrorMsg(err?.message || 'Network error')
        }
        setBusy(null)
    }

    async function submitChangeRequest() {
        const reason = reasonText.trim()
        if (!reason) {
            setErrorMsg('Please describe what you would like changed.')
            return
        }
        setBusy('request_changes')
        setErrorMsg(null)
        try {
            const res = await fetch(`/api/posts/${post.id}/request-image-change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, reason }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.ok) {
                setErrorMsg(data.error || 'Something went wrong.')
            } else if (data.referred) {
                setReferred(true)
                setLocalStatus('changes_requested')
                setRegenCount(MAX_AUTO_REGENERATIONS)
                setShowReason(false)
                setReasonText('')
            } else {
                setRegenCount(data.regenerationsUsed)
                if (data.mediaUrl) onImageUpdate(post.id, data.mediaUrl, data.regenerationsUsed)
                setShowReason(false)
                setReasonText('')
            }
        } catch (err: any) {
            setErrorMsg(err?.message || 'Network error')
        }
        setBusy(null)
    }

    return (
        <div style={{ borderTop: '1px solid #1a1a27' }}>
            {localStatus === 'pending' && !referred && (
                <div className="flex flex-col gap-2 px-5 py-4" style={{ background: '#0d0d14' }}>
                    {showReason ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#5a5a7a' }}>
                                What would you like changed?
                            </p>
                            <p className="text-[11px]" style={{ color: '#5a5a7a' }}>
                                Be specific — e.g. "use a black 4x4 instead", "less people", "different background".
                                The image will be re-generated automatically.
                                {regenLeft > 0 && ` You have ${regenLeft} auto-regeneration${regenLeft === 1 ? '' : 's'} left before this is referred to the agency.`}
                            </p>
                            <textarea
                                value={reasonText}
                                onChange={(e) => setReasonText(e.target.value)}
                                placeholder="Describe your change…"
                                rows={3}
                                className="w-full rounded-xl p-3 text-sm text-white placeholder-[#3a3a5a] focus:outline-none focus:ring-2"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={busy !== null}
                                    onClick={() => { setShowReason(false); setReasonText(''); setErrorMsg(null) }}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
                                    style={{ border: '1px solid #2a2a3d', color: '#a0a0c0' }}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={busy !== null || !reasonText.trim()}
                                    onClick={submitChangeRequest}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
                                    style={{ background: primaryColor, color: '#0a0a0f' }}>
                                    {busy === 'request_changes' ? 'Re-generating image…' : 'Submit & re-generate'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={busy !== null}
                                    onClick={() => { setShowReason(true); setErrorMsg(null) }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
                                    style={{ border: '1px solid #2a2a3d', color: '#a0a0c0' }}>
                                    <MessageSquare className="w-4 h-4" /> Request Changes
                                </button>
                                <button
                                    type="button"
                                    disabled={busy !== null}
                                    onClick={approve}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
                                    style={{ background: '#34d399', color: '#064e3b' }}>
                                    <Check className="w-4 h-4" /> {busy === 'approve' ? 'Approving…' : 'Approve'}
                                </button>
                            </div>
                            {regenCount > 0 && (
                                <p className="text-[11px]" style={{ color: '#5a5a7a' }}>
                                    Image regenerated {regenCount} / {MAX_AUTO_REGENERATIONS} time{regenCount === 1 ? '' : 's'}.
                                </p>
                            )}
                        </div>
                    )}
                    {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
                </div>
            )}
            {localStatus === 'pending' && referred && (
                <div className="flex flex-col gap-2 px-5 py-4" style={{ background: '#0d0d14' }}>
                    <div className="px-4 py-2.5 rounded-xl text-xs flex items-center gap-2" style={{ background: 'rgba(251,191,36,0.06)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.15)' }}>
                        <Clock className="w-3.5 h-3.5" /> Image referred to agency for manual review.
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            disabled={busy !== null}
                            onClick={approve}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
                            style={{ background: '#34d399', color: '#064e3b' }}>
                            <Check className="w-4 h-4" /> {busy === 'approve' ? 'Approving…' : 'Approve'}
                        </button>
                    </div>
                    {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}
                </div>
            )}
            {localStatus === 'approved' && (
                <div className="px-5 py-3 text-xs flex items-center gap-2" style={{ background: 'rgba(52,211,153,0.06)', color: '#34d399' }}>
                    <Check className="w-3.5 h-3.5" /> Approved — thanks!
                </div>
            )}
            {localStatus === 'changes_requested' && (
                <div className="px-5 py-3 text-xs flex items-center gap-2" style={{ background: 'rgba(251,191,36,0.06)', color: '#fbbf24' }}>
                    <Clock className="w-3.5 h-3.5" /> Referred to the agency for manual review.
                </div>
            )}
            <CommentsSection postId={post.id} token={token} primaryColor={primaryColor} />
        </div>
    )
}

function CommentsSection({ postId, token, primaryColor }: { postId: string; token: string; primaryColor: string }) {
    const [feedback, setFeedback] = useState<any[]>([])
    const [loaded, setLoaded] = useState(false)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        if (!loaded) {
            fetch(`/api/posts/${postId}/feedback?token=${token}`)
                .then(r => r.json())
                .then(d => { if (d.feedback) setFeedback(d.feedback) })
                .catch(() => {})
                .finally(() => setLoaded(true))
        }
    }, [postId, token, loaded])

    function relativeTime(iso: string) {
        const diff = Date.now() - new Date(iso).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins} min ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs} hr ago`
        const days = Math.floor(hrs / 24)
        return `${days} day${days > 1 ? 's' : ''} ago`
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const fd = new FormData(form)
        const authorName = (fd.get('author_name') as string)?.trim() || 'Client'
        const comment = (fd.get('comment') as string)?.trim()
        if (!comment) return

        const res = await fetch(`/api/posts/${postId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, author_name: authorName, comment, role: 'client' }),
        })
        const data = await res.json()
        if (data.ok && data.feedback) {
            setFeedback([data.feedback, ...feedback])
            form.reset()
        }
    }

    return (
        <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a3a5a' }}>
                    Comments {feedback.length > 0 && `(${feedback.length})`}
                </h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-xs font-semibold transition-colors hover:text-white"
                    style={{ color: primaryColor }}>
                    {showForm ? 'Cancel' : 'Add comment'}
                </button>
            </div>

            {feedback.map((fb: any) => (
                <div key={fb.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: fb.author_role === 'agency' ? primaryColor : '#2a2a3d', color: fb.author_role === 'agency' ? '#0a0a0f' : '#8a8aaa' }}>
                        {(fb.author_name || fb.author_role)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{fb.author_name || fb.author_role}</span>
                            <span className="text-[10px]" style={{ color: '#5a5a7a' }}>{relativeTime(fb.created_at)}</span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: '#b0b0c0' }}>{fb.comment}</p>
                    </div>
                </div>
            ))}

            {showForm && (
                <form onSubmit={handleSubmit} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                        <input name="author_name" placeholder="Your name" maxLength={100}
                            className="w-full bg-[#13131a] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#5a5a7a] focus:outline-none focus:border-[#3a3a5a]" />
                        <textarea name="comment" placeholder="Add a comment..." required maxLength={2000} rows={2}
                            className="w-full bg-[#13131a] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#5a5a7a] focus:outline-none focus:border-[#3a3a5a] resize-none" />
                    </div>
                    <button type="submit"
                        className="shrink-0 p-2.5 rounded-lg transition-colors hover:opacity-90"
                        style={{ background: primaryColor, color: '#0a0a0f' }}>
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}
        </div>
    )
}
