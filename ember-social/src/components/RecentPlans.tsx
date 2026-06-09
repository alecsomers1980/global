'use client'

import { useState } from 'react'
import { Link2, Copy, ExternalLink, Check, Trash2, Loader2 } from 'lucide-react'

interface Batch {
    id: string
    public_token: string
    schedule_pattern?: string | null
    created_at: string
    duration_days?: number | null
}

interface Props {
    batches: Batch[]
}

const PATTERN_LABELS: Record<string, string> = {
    tue_thu_sat: 'Tue / Thu / Sat',
    mon_wed_fri: 'Mon / Wed / Fri',
}

export default function RecentPlans({ batches }: Props) {
    const [copiedToken, setCopiedToken] = useState<string | null>(null)
    const [localBatches, setLocalBatches] = useState<Batch[]>(batches)
    const [deleting, setDeleting] = useState<string | null>(null)

    const handleDelete = async (batchId: string) => {
        if (!confirm('Delete this plan? Posts will be kept but unlinked from the batch.')) return
        setDeleting(batchId)
        try {
            const res = await fetch('/api/workspaces/campaign/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batchId }),
            })
            if (res.ok) {
                setLocalBatches(prev => prev.filter(b => b.id !== batchId))
            } else {
                const data = await res.json()
                alert(data.error || 'Delete failed')
            }
        } catch (err: any) {
            alert(err.message || 'Delete failed')
        }
        setDeleting(null)
    }

    if (!localBatches || localBatches.length === 0) {
        return (
            <div className="glass-card p-5">
                <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-orange-400" />
                    Client Review Links
                </h2>
                <p className="text-sm" style={{ color: '#5a5a7a' }}>
                    Generate a marketing plan to create a shareable client review link.
                </p>
            </div>
        )
    }

    const copy = async (token: string) => {
        const url = `${window.location.origin}/plan/${token}`
        try {
            await navigator.clipboard.writeText(url)
            setCopiedToken(token)
            setTimeout(() => setCopiedToken(prev => (prev === token ? null : prev)), 2000)
        } catch {
            window.prompt('Copy the share link manually:', url)
        }
    }

    return (
        <div className="glass-card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Link2 className="w-4 h-4 text-orange-400" />
                Client Review Links
            </h2>
            <div className="space-y-2">
                {localBatches.map(batch => {
                    const url = typeof window !== 'undefined'
                        ? `${window.location.origin}/plan/${batch.public_token}`
                        : `/plan/${batch.public_token}`
                    const created = new Date(batch.created_at).toLocaleDateString('en-ZA', {
                        day: 'numeric', month: 'short', year: 'numeric',
                    })
                    const pattern = batch.schedule_pattern ? PATTERN_LABELS[batch.schedule_pattern] || batch.schedule_pattern : null
                    const isCopied = copiedToken === batch.public_token

                    return (
                        <div key={batch.id} className="rounded-lg p-3 space-y-2"
                            style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-[11px]" style={{ color: '#5a5a7a' }}>
                                    <span>{created}</span>
                                    {pattern && (
                                        <>
                                            <span>·</span>
                                            <span className="font-semibold" style={{ color: '#a0a0c0' }}>{pattern}</span>
                                        </>
                                    )}
                                    {batch.duration_days && (
                                        <>
                                            <span>·</span>
                                            <span>{batch.duration_days} days</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <code className="text-[11px] block truncate" style={{ color: '#9090b0' }}>{url}</code>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copy(batch.public_token)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors hover:bg-white/5"
                                    style={{ border: '1px solid #2a2a3d', color: isCopied ? '#34d399' : '#a0a0c0' }}>
                                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {isCopied ? 'Copied' : 'Copy'}
                                </button>
                                <a
                                    href={`/plan/${batch.public_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors hover:bg-orange-500/10"
                                    style={{ border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
                                    <ExternalLink className="w-3 h-3" /> Open
                                </a>
                                <a
                                    href={`/api/workspaces/campaign/pdf?token=${batch.public_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors hover:bg-white/5"
                                    style={{ border: '1px solid #2a2a3d', color: '#a0a0c0' }}>
                                    PDF
                                </a>
                                <button
                                    onClick={() => handleDelete(batch.id)}
                                    disabled={deleting !== null}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                    style={{ border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                                    {deleting === batch.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
