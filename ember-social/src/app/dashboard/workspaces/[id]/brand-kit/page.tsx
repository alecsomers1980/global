'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, Palette, Save, Loader2, Eye, Globe, Upload } from 'lucide-react'
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

const DEFAULT_KIT = {
    logo_url: null as string | null,
    primary_color: '#f97316',
    secondary_color: '#1a1a27',
    accent_color: '#fbbf24',
    font_preference: 'Inter',
    watermark_url: null as string | null,
}

export default function BrandKitPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState('')
    const [kit, setKit] = useState(DEFAULT_KIT)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [analyzeStatus, setAnalyzeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [websiteUrl, setWebsiteUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
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

    const handleAnalyze = async () => {
        if (!websiteUrl.trim()) return
        setAnalyzing(true)
        setAnalyzeStatus(null)
        try {
            const res = await fetch('/api/ai/analyze-brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: websiteUrl }),
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            const applied: string[] = []
            if (data.primary_color) applied.push('primary color')
            if (data.secondary_color) applied.push('secondary color')
            if (data.accent_color) applied.push('accent color')
            if (data.font_preference) applied.push('font')
            if (data.logo_url) applied.push('logo')

            setKit(prev => ({
                ...prev,
                ...(data.primary_color && { primary_color: data.primary_color }),
                ...(data.secondary_color && { secondary_color: data.secondary_color }),
                ...(data.accent_color && { accent_color: data.accent_color }),
                ...(data.font_preference && { font_preference: data.font_preference }),
                ...(data.logo_url && { logo_url: data.logo_url }),
            }))

            if (applied.length > 0) {
                setAnalyzeStatus({ type: 'success', message: `Detected: ${applied.join(', ')}. Review below and click Save.` })
            } else {
                setAnalyzeStatus({ type: 'error', message: 'Could not extract brand details from this website. Try a different URL.' })
            }
        } catch (error: any) {
            console.error('Analysis failed:', error)
            setAnalyzeStatus({ type: 'error', message: error.message || 'Analysis failed. Please try again.' })
        } finally {
            setAnalyzing(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('workspaceId', id)
            formData.append('type', 'logo')

            const res = await fetch('/api/brand-kit/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setKit(prev => ({ ...prev, logo_url: data.url }))
        } catch (error: any) {
            console.error('Upload failed:', error)
            alert('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
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

            {/* Extract Brand Identity from Website */}
            <div className="glass-card p-6 border-dashed border-orange-500/30">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-orange-400" />
                    <h2 className="font-semibold text-white">Extract Brand Identity</h2>
                </div>
                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="Enter client website URL (e.g. https://everestmotoring.co.za)"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAnalyze() }}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                        style={{ background: '#0a0a0f', border: '1px solid #1a1a27' }}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !websiteUrl.trim()}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center gap-2"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {analyzing ? 'Analyzing...' : 'Analyze Site'}
                    </button>
                </div>
                {analyzeStatus && (
                    <div className="mt-3 px-4 py-2.5 rounded-xl text-sm" style={{
                        background: analyzeStatus.type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        border: `1px solid ${analyzeStatus.type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        color: analyzeStatus.type === 'success' ? '#34d399' : '#f87171',
                    }}>
                        {analyzeStatus.message}
                    </div>
                )}
                <p className="text-[10px] mt-2" style={{ color: '#4a4a6a' }}>
                    AI will detect colors, fonts, and logo from the website. You can adjust anything after extraction.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Visual Identity */}
                <div className="glass-card p-6 space-y-5">
                    <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                        <Palette className="w-4 h-4 text-orange-400" />
                        Visual Identity
                    </h2>

                    {/* Logo with upload */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Logo</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={kit.logo_url || ''}
                                onChange={e => setKit(prev => ({ ...prev, logo_url: e.target.value || null }))}
                                placeholder="https://example.com/logo.png"
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                                style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
                                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {uploading ? '...' : 'Upload'}
                            </button>
                        </div>
                        {kit.logo_url && (
                            <div className="mt-2 flex items-center gap-3 p-2 rounded-lg" style={{ background: '#0a0a0f' }}>
                                <img src={kit.logo_url} alt="Logo preview" className="h-10 max-w-[120px] rounded-lg object-contain" />
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

                    {/* Live Preview */}
                    <div className="glass-card p-6">
                        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-orange-400" />
                            Live Preview
                        </h2>
                        <div className="rounded-xl overflow-hidden" style={{ border: `3px solid ${kit.accent_color}` }}>
                            <div className="p-4" style={{ background: kit.secondary_color }}>
                                <div className="flex items-center gap-3 mb-3">
                                    {kit.logo_url ? (
                                        <img src={kit.logo_url} alt="" className="h-8 max-w-[80px] rounded-full object-contain" />
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

                        {/* Color swatches */}
                        <div className="flex gap-2 mt-4">
                            {[
                                { label: 'Primary', color: kit.primary_color },
                                { label: 'Secondary', color: kit.secondary_color },
                                { label: 'Accent', color: kit.accent_color },
                            ].map(({ label, color }) => (
                                <div key={label} className="flex-1 text-center">
                                    <div className="w-full h-8 rounded-lg mb-1" style={{ background: color, border: '1px solid #2a2a3d' }} />
                                    <span className="text-[9px]" style={{ color: '#4a4a6a' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
