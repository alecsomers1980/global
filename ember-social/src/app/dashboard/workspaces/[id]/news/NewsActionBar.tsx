'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
    workspaceId: string
}

export default function NewsActionBar({ workspaceId }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState('auto')
    const [toast, setToast] = useState(false)

    async function handleGenerate() {
        setLoading(true)
        try {
            const body: Record<string, string> = { workspaceId }
            if (category !== 'auto') body.category = category

            const res = await fetch('/api/workspaces/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()

            if (!res.ok || data.error) {
                alert(data.error || 'Failed to generate article')
                return
            }

            router.refresh()
            setToast(true)
            setTimeout(() => setToast(false), 3000)
        } catch (err: any) {
            alert(err?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-card p-4 flex items-center gap-3 flex-wrap">
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="px-3 py-2 rounded-lg text-sm font-medium text-white outline-none focus:ring-2 focus:ring-orange-400/40 disabled:opacity-50"
                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
            >
                <option value="auto">Auto (rotate)</option>
                <option value="buying-guide">Buying Guide</option>
                <option value="local">Local</option>
                <option value="model-review">Model Review</option>
            </select>

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Generating…' : 'Generate article'}
            </button>

            {toast && (
                <span className="text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg">
                    Article generated ✓
                </span>
            )}
        </div>
    )
}
