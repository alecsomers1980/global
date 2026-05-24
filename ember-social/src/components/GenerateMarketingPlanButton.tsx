'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X, Copy, ExternalLink, Check } from 'lucide-react'

interface Props {
    workspaceSlug: string
    suggestedCount: number
}

interface GenerationResult {
    strategy_rationale: string
    pillars: string[]
    count: number
    public_token: string | null
}

export default function GenerateMarketingPlanButton({ workspaceSlug, suggestedCount }: Props) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<GenerationResult | null>(null)
    const [copied, setCopied] = useState(false)

    const planUrl = result?.public_token && typeof window !== 'undefined'
        ? `${window.location.origin}/plan/${result.public_token}`
        : null

    const handleGenerate = async () => {
        if (!window.confirm(`Generate a 30-day marketing plan? This creates ~${suggestedCount} draft posts for review.`)) return

        setLoading(true)
        setResult(null)
        setCopied(false)
        try {
            const res = await fetch('/api/workspaces/campaign/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: workspaceSlug, durationDays: 30 })
            })
            const data = await res.json()
            if (data.ok) {
                setResult({
                    strategy_rationale: data.strategy_rationale,
                    pillars: data.pillars,
                    count: data.count,
                    public_token: data.public_token || null,
                })
            } else {
                alert(`Generation failed: ${data.error || 'unknown'}`)
            }
        } catch (err: any) {
            alert(`Generation failed: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!planUrl) return
        try {
            await navigator.clipboard.writeText(planUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard write can fail (insecure context etc.) — show the URL inline as fallback.
            window.prompt('Copy the share link manually:', planUrl)
        }
    }

    return (
        <div className="space-y-4">
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate Marketing Plan'}
            </button>

            {result && (
                <div className="glass-card p-5 space-y-4"
                    style={{ border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-300">
                            {result.count} posts generated
                        </span>
                        <button onClick={() => setResult(null)} className="text-green-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Shareable client link */}
                    {planUrl && (
                        <div className="rounded-xl p-3 space-y-2" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5a5a7a' }}>
                                Client review link
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="text-xs flex-1 truncate" style={{ color: '#e0e0f0' }}>{planUrl}</code>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-white/5 shrink-0"
                                    style={{ border: '1px solid #2a2a3d', color: copied ? '#34d399' : '#a0a0c0' }}>
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                                <a
                                    href={planUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 shrink-0 text-white"
                                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                                    <ExternalLink className="w-3.5 h-3.5" /> Open
                                </a>
                            </div>
                            <p className="text-[11px]" style={{ color: '#5a5a7a' }}>
                                Send this link to the client — no login required. They can comment, approve, request changes, and download a PDF.
                            </p>
                        </div>
                    )}

                    <p className="text-sm leading-relaxed" style={{ color: '#9090b0' }}>
                        {result.strategy_rationale}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {result.pillars.map((pillar, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
                                {pillar}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
