'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewWorkspacePage() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('workspaces')
            .insert({ name: name.trim(), slug } as any)
            .select()
            .single()

        if (error || !data) {
            setError(error?.message || 'Failed to create workspace')
            setLoading(false)
            return
        }

        const workspaceData = data as any

        // Create default client intelligence record
        await supabase.from('client_intelligence').insert({ workspace_id: workspaceData.id } as any)

        router.push(`/dashboard/workspaces/${workspaceData.id}`)
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Link href="/dashboard/workspaces"
                className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
                style={{ color: '#5a5a7a' }}>
                <ArrowLeft className="w-4 h-4" />
                Back to clients
            </Link>

            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(249,115,22,0.15)' }}>
                        <Building2 className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Add New Client</h1>
                        <p className="text-sm" style={{ color: '#5a5a7a' }}>Create a workspace to manage their social media</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" style={{ color: '#9999bb' }}>Client / Business Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g. Spanslab, Everest Motoring"
                            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                        />
                        {slug && (
                            <p className="text-xs" style={{ color: '#3a3a5a' }}>
                                Workspace URL: <span style={{ color: '#5a5a7a' }}>/{slug}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link href="/dashboard/workspaces"
                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-colors"
                            style={{ background: '#1a1a27', color: '#6a6a8a' }}>
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {loading ? 'Creating...' : 'Create Workspace'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-5 space-y-2" style={{ borderTop: '1px solid #1a1a27' }}>
                    <p className="text-xs font-medium" style={{ color: '#4a4a6a' }}>What happens next:</p>
                    {['Connect their social media accounts (Facebook, Instagram, LinkedIn...)',
                        'Complete the Client Intelligence questionnaire so AI can write in their voice',
                        'Generate your first AI content calendar'].map((step, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                                    style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
                                    {i + 1}
                                </span>
                                <p className="text-xs" style={{ color: '#4a4a6a' }}>{step}</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
