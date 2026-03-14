'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, Brain, Save, Loader2, Sparkles, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Intelligence = Database['public']['Tables']['client_intelligence']['Row']

export default function IntelligencePage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [intel, setIntel] = useState<Intelligence | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        params.then((p) => {
            setId(p.id)
            fetchIntel(p.id)
        })
    }, [params])

    const fetchIntel = async (workspaceId: string) => {
        const { data } = await supabase
            .from('client_intelligence')
            .select('*')
            .eq('workspace_id', workspaceId)
            .single()

        if (data) setIntel(data)
        setLoading(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!intel) return
        setSaving(true)

        await supabase
            .from('client_intelligence')
            .update({
                industry: intel.industry,
                target_audience: intel.target_audience,
                brand_voice: intel.brand_voice,
                goals: intel.goals,
                current_month_focus: intel.current_month_focus,
                key_messages: intel.key_messages,
                do_not_post: intel.do_not_post,
                last_updated_at: new Date().toISOString()
            } as never)
            .eq('id', intel.id)

        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/dashboard/workspaces/${id}`}
                        className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-white"
                        style={{ color: '#5a5a7a' }}>
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to workspace
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                            style={{ background: 'rgba(249,115,22,0.15)' }}>
                            <Brain className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Client Intelligence</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>
                                Teach the AI how to write and think like this client
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-5">
                        <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            Core Identity
                        </h2>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Industry / Niche</label>
                            <input
                                type="text"
                                value={intel?.industry || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, industry: e.target.value } : null)}
                                placeholder="e.g. Automotive Dealership, Commercial Construction"
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Target Audience</label>
                            <textarea
                                value={intel?.target_audience || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, target_audience: e.target.value } : null)}
                                placeholder="Who are we talking to? Describe their demographics and pain points."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all resize-none"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Brand Voice & Tone</label>
                            <textarea
                                value={intel?.brand_voice || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, brand_voice: e.target.value } : null)}
                                placeholder="e.g. Professional but approachable. Uses emojis sparingly. Never uses slang."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all resize-none"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Primary Goals</label>
                            <input
                                type="text"
                                value={intel?.goals || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, goals: e.target.value } : null)}
                                placeholder="e.g. Lead generation, brand awareness, recruitment"
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-5" style={{ border: '1px solid rgba(249,115,22,0.2)' }}>
                        <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-orange-400" />
                            Content Strategy
                        </h2>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider flex justify-between" style={{ color: '#9999bb' }}>
                                <span className="text-orange-400">Current Month Focus</span>
                            </label>
                            <textarea
                                value={intel?.current_month_focus || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, current_month_focus: e.target.value } : null)}
                                placeholder="What exactly should the AI promote this month? (Events, specific products, sales)"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                                style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)' }}
                            />
                            <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Update this monthly before generating the content calendar.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Key Brand Messages</label>
                            <textarea
                                value={intel?.key_messages?.join('\n') || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, key_messages: e.target.value.split('\n').filter(Boolean) } : null)}
                                placeholder="One message per line. e.g.&#10;Family owned since 1999&#10;Nationwide delivery available"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all resize-none"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>"Do Not Post" Rules</label>
                            <textarea
                                value={intel?.do_not_post?.join('\n') || ''}
                                onChange={e => setIntel(prev => prev ? { ...prev, do_not_post: e.target.value.split('\n').filter(Boolean) } : null)}
                                placeholder="One rule per line. e.g.&#10;Don't mention competitors&#10;Don't use political humour"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-red-500/30 transition-all resize-none"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
