'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, Palette, Save, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type BrandKit = Database['public']['Tables']['brand_kits']['Row']

const FONT_OPTIONS = [
    'Inter',
    'Montserrat',
    'Playfair Display',
    'Roboto',
    'Poppins',
    'Open Sans',
    'Space Grotesk',
    'DM Sans',
]

const DEFAULT_KIT: Omit<BrandKit, 'id' | 'workspace_id' | 'created_at' | 'updated_at'> = {
    logo_url: null,
    primary_color: '#f97316',
    secondary_color: '#1a1a27',
    accent_color: '#fbbf24',
    font_preference: 'Inter',
    watermark_url: null,
}

export default function BrandKitPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState('')
    const [kit, setKit] = useState(DEFAULT_KIT)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setId(p.id)
            fetchKit(p.id)
        })
    }, [params])

    const fetchKit = async (workspaceId: string) => {
        const { data } = await supabase
            .from('brand_kits' as any)
            .select('*')
            .eq('workspace_id', workspaceId)
            .single()

        const row = data as any
        if (row) {
            setKit({
                logo_url: row.logo_url,
                primary_color: row.primary_color,
                secondary_color: row.secondary_color,
                accent_color: row.accent_color,
                font_preference: row.font_preference,
                watermark_url: row.watermark_url,
            })
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        try {
            const res = await fetch('/api/brand-kit/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: id, brandKit: kit }),
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (error: any) {
            console.error('Save failed:', error)
            alert('Failed to save brand kit: ' + error.message)
        } finally {
            setSaving(false)
        }
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
            {/* Header */}
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
                            <Palette className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Brand Kit</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>
                                Visual identity for post previews and branding
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                    style={{ background: saved ? 'linear-gradient(135deg, #34d399, #059669)' : 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Eye className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Brand Kit'}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Visual Identity */}
                <div className="glass-card p-6 space-y-5">
                    <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                        <Palette className="w-4 h-4 text-orange-400" />
                        Visual Identity
                    </h2>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Logo URL</label>
                        <input
                            type="url"
                            value={kit.logo_url || ''}
                            onChange={e => setKit(prev => ({ ...prev, logo_url: e.target.value || null }))}
                            placeholder="https://example.com/logo.png"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                        />
                        {kit.logo_url && (
                            <div className="mt-2 flex items-center gap-3">
                                <img src={kit.logo_url} alt="Logo preview" className="w-10 h-10 rounded-lg object-contain" style={{ background: '#0a0a0f' }} />
                                <span className="text-[10px]" style={{ color: '#5a5a7a' }}>Preview</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Watermark URL</label>
                        <input
                            type="url"
                            value={kit.watermark_url || ''}
                            onChange={e => setKit(prev => ({ ...prev, watermark_url: e.target.value || null }))}
                            placeholder="https://example.com/watermark.png (optional)"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Font Preference</label>
                        <select
                            value={kit.font_preference}
                            onChange={e => setKit(prev => ({ ...prev, font_preference: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-orange-500/30 transition-all appearance-none cursor-pointer"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }}>
                            {FONT_OPTIONS.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Right: Brand Colors */}
                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-5" style={{ border: '1px solid rgba(249,115,22,0.2)' }}>
                        <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ background: kit.primary_color }} />
                                <div className="w-3 h-3 rounded-full" style={{ background: kit.secondary_color }} />
                                <div className="w-3 h-3 rounded-full" style={{ background: kit.accent_color }} />
                            </div>
                            Brand Colors
                        </h2>

                        {([
                            { label: 'Primary Color', key: 'primary_color' as const, hint: 'Main brand color — used for accents and highlights' },
                            { label: 'Secondary Color', key: 'secondary_color' as const, hint: 'Background or supporting color' },
                            { label: 'Accent Color', key: 'accent_color' as const, hint: 'Call-to-action and emphasis color' },
                        ]).map(({ label, key, hint }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>{label}</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-lg cursor-pointer border-2 border-transparent hover:border-white/20 transition-all"
                                            style={{ background: kit[key] }}>
                                            <input
                                                type="color"
                                                value={kit[key]}
                                                onChange={e => setKit(prev => ({ ...prev, [key]: e.target.value }))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={kit[key]}
                                        onChange={e => setKit(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white font-mono placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                                        style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                                    />
                                </div>
                                <p className="text-[10px]" style={{ color: '#4a4a6a' }}>{hint}</p>
                            </div>
                        ))}
                    </div>

                    {/* Live Preview swatch */}
                    <div className="glass-card p-6">
                        <h2 className="font-semibold text-white mb-4">Live Preview</h2>
                        <div className="rounded-xl overflow-hidden" style={{ border: `3px solid ${kit.accent_color}` }}>
                            <div className="p-4" style={{ background: kit.secondary_color }}>
                                <div className="flex items-center gap-3 mb-3">
                                    {kit.logo_url ? (
                                        <img src={kit.logo_url} alt="" className="w-8 h-8 rounded-full object-contain" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full" style={{ background: kit.primary_color }} />
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: kit.primary_color, fontFamily: kit.font_preference }}>Brand Name</p>
                                        <p className="text-[10px]" style={{ color: '#8a8aaa' }}>Sample post preview</p>
                                    </div>
                                </div>
                                <p className="text-xs mb-3" style={{ color: '#c0c0d0', fontFamily: kit.font_preference }}>
                                    This is how your brand colors and font will appear in post previews across platforms.
                                </p>
                                <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                                    style={{ background: kit.primary_color }}>
                                    Call to Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
