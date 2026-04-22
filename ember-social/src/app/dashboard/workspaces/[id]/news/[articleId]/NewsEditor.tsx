'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Send, EyeOff, Trash2 } from 'lucide-react'

interface Props {
    article: any
    workspaceSlug: string
}

export default function NewsEditor({ article, workspaceSlug }: Props) {
    const router = useRouter()

    const [title, setTitle] = useState<string>(article.title ?? '')
    const [slug, setSlug] = useState<string>(article.slug ?? '')
    const [category, setCategory] = useState<string>(article.category ?? 'buying-guide')
    const [excerpt, setExcerpt] = useState<string>(article.excerpt ?? '')
    const [metaTitle, setMetaTitle] = useState<string>(article.meta_title ?? '')
    const [metaDescription, setMetaDescription] = useState<string>(article.meta_description ?? '')
    const [bodyMd, setBodyMd] = useState<string>(article.body_md ?? '')
    const [heroImageUrl, setHeroImageUrl] = useState<string>(article.hero_image_url ?? '')
    const [status, setStatus] = useState<string>(article.status ?? 'draft')
    const [busy, setBusy] = useState(false)
    const [msg, setMsg] = useState<string | null>(null)

    const articleId = article.id

    async function handleSave() {
        setBusy(true)
        setMsg(null)
        try {
            const res = await fetch(`/api/workspaces/news/${articleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    slug,
                    category,
                    excerpt,
                    meta_title: metaTitle,
                    meta_description: metaDescription,
                    body_md: bodyMd,
                    hero_image_url: heroImageUrl,
                    status,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data?.error || 'Save failed')
            setMsg('Saved ✓')
            router.refresh()
        } catch (e: any) {
            setMsg(e?.message || 'Save failed')
        } finally {
            setBusy(false)
            setTimeout(() => setMsg(null), 3000)
        }
    }

    async function handlePublishToggle(action: 'publish' | 'unpublish') {
        setBusy(true)
        setMsg(null)
        try {
            const res = await fetch(`/api/workspaces/news/${articleId}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data?.error || `${action} failed`)
            setStatus(data.status || (action === 'publish' ? 'published' : 'approved'))
            setMsg(action === 'publish' ? 'Published to client site ✓' : 'Unpublished')
            router.refresh()
        } catch (e: any) {
            setMsg(e?.message || `${action} failed`)
        } finally {
            setBusy(false)
            setTimeout(() => setMsg(null), 3000)
        }
    }

    async function handleDelete() {
        if (!confirm('Delete this article? This cannot be undone.')) return
        setBusy(true)
        try {
            const res = await fetch(`/api/workspaces/news/${articleId}`, { method: 'DELETE' })
            if (res.ok) {
                router.push(`/dashboard/workspaces/${workspaceSlug}/news`)
            }
        } finally {
            setBusy(false)
        }
    }

    const inputClass = 'w-full rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-orange-400/40'
    const inputStyle = { background: '#13131a', border: '1px solid #2a2a3d' }
    const labelClass = 'block text-xs uppercase tracking-widest mb-1'
    const labelStyle = { color: '#5a5a7a' }

    function statusPillClasses(s: string) {
        switch (s) {
            case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'approved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'pending_approval': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'draft': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest" style={{ color: '#5a5a7a' }}>Status</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusPillClasses(status)}`}>
                    {status}
                </span>
                {msg && <span className="text-xs text-orange-400 ml-auto">{msg}</span>}
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} style={labelStyle}>Slug</label>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} style={inputStyle} />
                </div>
                <div>
                    <label className={labelClass} style={labelStyle}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} style={inputStyle}>
                        <option value="buying-guide">Buying Guide</option>
                        <option value="local">Local</option>
                        <option value="model-review">Model Review</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>Hero Image URL</label>
                <div className="flex items-start gap-4">
                    <input type="text" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} className={inputClass} style={inputStyle} />
                    {heroImageUrl && (
                        <img
                            src={heroImageUrl}
                            alt="Hero preview"
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border"
                            style={{ borderColor: '#2a2a3d' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                    )}
                </div>
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>Excerpt</label>
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={`${inputClass} resize-none`} style={inputStyle} />
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>Meta Title</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} style={inputStyle} />
                <p className="mt-1 text-xs" style={{ color: '#5a5a7a' }}>
                    {metaTitle.length} characters{' '}
                    <span style={{ color: metaTitle.length >= 50 && metaTitle.length <= 60 ? '#4ade80' : '#f97316' }}>
                        (recommended 50–60)
                    </span>
                </p>
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>Meta Description</label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} style={inputStyle} />
                <p className="mt-1 text-xs" style={{ color: '#5a5a7a' }}>
                    {metaDescription.length} characters{' '}
                    <span style={{ color: metaDescription.length >= 140 && metaDescription.length <= 155 ? '#4ade80' : '#f97316' }}>
                        (recommended 140–155)
                    </span>
                </p>
            </div>

            <div>
                <label className={labelClass} style={labelStyle}>Body (Markdown)</label>
                <textarea
                    value={bodyMd}
                    onChange={(e) => setBodyMd(e.target.value)}
                    className={`${inputClass} resize-y`}
                    style={{ ...inputStyle, minHeight: '400px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: '#2a2a3d' }}>
                <button
                    onClick={handleSave}
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    Save changes
                </button>

                {status !== 'published' ? (
                    <button
                        onClick={() => handlePublishToggle('publish')}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                        style={{ background: '#2a2a3d' }}
                    >
                        <Send className="w-4 h-4" />
                        Publish to client site
                    </button>
                ) : (
                    <button
                        onClick={() => handlePublishToggle('unpublish')}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                        style={{ background: '#2a2a3d' }}
                    >
                        <EyeOff className="w-4 h-4" />
                        Unpublish
                    </button>
                )}

                <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-50 ml-auto"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    )
}
