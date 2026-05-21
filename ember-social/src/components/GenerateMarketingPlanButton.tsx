'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'

interface Props {
    workspaceSlug: string
    suggestedCount: number
}

export default function GenerateMarketingPlanButton({ workspaceSlug, suggestedCount }: Props) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ strategy_rationale: string; pillars: string[]; count: number } | null>(null)

    const handleGenerate = async () => {
        if (!window.confirm(`Generate a 30-day marketing plan? This creates ~${suggestedCount} draft posts for review.`)) return

        setLoading(true)
        setResult(null)
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
                    count: data.count
                })
                alert(`Marketing plan generated — ${data.count} posts ready to review`)
            } else {
                alert(`Generation failed: ${data.error || 'unknown'}`)
            }
        } catch (err: any) {
            alert(`Generation failed: ${err.message}`)
        } finally {
            setLoading(false)
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
                <div className="glass-card p-5 space-y-3"
                    style={{ border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-300">
                            {result.count} posts generated
                        </span>
                        <button onClick={() => setResult(null)} className="text-green-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
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
