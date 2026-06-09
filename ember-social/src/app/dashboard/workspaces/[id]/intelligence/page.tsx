'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, Brain, Save, Loader2, Sparkles, MessageSquare, Globe, Wand2, Plus, Check, X, Minus, Box } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Intelligence = Database['public']['Tables']['client_intelligence']['Row']

export default function IntelligencePage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [intel, setIntel] = useState<Intelligence | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [websiteUrl, setWebsiteUrl] = useState('')
    const [campaign, setCampaign] = useState<any>(null)
    const [scanning, setScanning] = useState(false)
    const [scanResults, setScanResults] = useState<any>(null)
    const [scanBanner, setScanBanner] = useState<string | null>(null)
    const [contentSource, setContentSource] = useState<any>(null)
    const [businessArchetype, setBusinessArchetype] = useState<string>('product')
    const [archetypeSaving, setArchetypeSaving] = useState(false)
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [contactWebsiteUrl, setContactWebsiteUrl] = useState('')
    const [contactLocation, setContactLocation] = useState('')
    const [defaultHashtags, setDefaultHashtags] = useState('')
    const [sellYourCarUrl, setSellYourCarUrl] = useState('')
    const [contactSaving, setContactSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        params.then((p) => {
            setId(p.id)
            fetchIntel(p.id)
        })
    }, [params])

    const fetchIntel = async (workspaceId: string) => {
        try {
            const res = await fetch(`/api/workspaces/intelligence?workspaceId=${encodeURIComponent(workspaceId)}`)
            const data = await res.json()
            if (data.intel) setIntel(data.intel)
            if (data.contentSource) setContentSource(data.contentSource)
            if (data.businessArchetype) setBusinessArchetype(data.businessArchetype)
            if (data.contactPhone) setContactPhone(data.contactPhone)
            if (data.contactEmail) setContactEmail(data.contactEmail)
            if (data.websiteUrl) setContactWebsiteUrl(data.websiteUrl)
            if (data.location) setContactLocation(data.location)
            if (data.defaultHashtags?.length) setDefaultHashtags(data.defaultHashtags.join(', '))
            if (data.sellYourCarUrl) setSellYourCarUrl(data.sellYourCarUrl)
        } catch (err) {
            console.error('fetchIntel failed:', err)
        }
        setLoading(false)
    }

    const handleAnalyze = async () => {
        if (!websiteUrl) return
        setAnalyzing(true)
        try {
            const res = await fetch('/api/ai/analyze-website', {
                method: 'POST',
                body: JSON.stringify({ url: websiteUrl })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setIntel(prev => {
                const base = prev || {
                    id: '',
                    workspace_id: id,
                    industry: '',
                    target_audience: '',
                    brand_voice: '',
                    goals: '',
                    current_month_focus: '',
                    key_messages: [],
                    do_not_post: [],
                    last_updated_at: new Date().toISOString()
                }
                return {
                    ...base,
                    industry: data.industry || base.industry,
                    target_audience: data.target_audience || base.target_audience,
                    brand_voice: data.brand_voice || base.brand_voice,
                    goals: data.goals || base.goals,
                    key_messages: data.key_messages || base.key_messages
                } as Intelligence
            })
        } catch (error: any) {
            console.error('Analysis failed:', error)
            alert(error.message || 'Analysis failed. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleGenerateCampaign = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/ai/campaign', {
                method: 'POST',
                body: JSON.stringify({ workspaceId: id })
            })
            const data = await res.json()
            setCampaign(data)
        } catch (error) {
            console.error('Campaign generation failed:', error)
        } finally {
            setGenerating(false)
        }
    }

    const handleScanAll = async () => {
        if (!websiteUrl) return
        setScanning(true)
        setScanResults(null)
        setScanBanner(null)
        try {
            const res = await fetch('/api/workspaces/intake/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: id, websiteUrl })
            })
            const data = await res.json()
            setScanResults(data)

            const ready: string[] = []
            if (data.brand === 'ok') ready.push('brand')
            if (data.website === 'ok') ready.push('website')
            if (data.social === 'ok') ready.push('social')
            if (ready.length > 0) {
                setScanBanner(`Scan complete — ${ready.join('|')} ready.`)
            }

            // Re-fetch intel after scan
            fetchIntel(id)
        } catch (error: any) {
            console.error('Scan failed:', error)
            setScanResults({ brand: 'failed', website: 'failed', social: 'failed', results: {} })
        } finally {
            setScanning(false)
        }
    }

    const handleArchetypeChange = async (value: string) => {
        setBusinessArchetype(value)
        setArchetypeSaving(true)
        try {
            await fetch(`/api/workspaces/${id}/archetype`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archetype: value })
            })
        } catch (err) {
            console.error('archetype save failed:', err)
        }
        setArchetypeSaving(false)
    }

    const handleContactSave = async () => {
        setContactSaving(true)
        try {
            const hashtags = defaultHashtags
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            await fetch(`/api/workspaces/intelligence?workspaceId=${encodeURIComponent(id)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contactPhone: contactPhone || null,
                    contactEmail: contactEmail || null,
                    websiteUrl: contactWebsiteUrl || null,
                    location: contactLocation || null,
                    defaultHashtags: hashtags.length > 0 ? hashtags : null,
                    sellYourCarUrl: sellYourCarUrl || null,
                })
            })
        } catch (err) {
            console.error('contact save failed:', err)
        }
        setContactSaving(false)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!intel) return
        setSaving(true)

        try {
            const res = await fetch('/api/ai/save-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: id, intel })
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)

            // Refresh content to get the real ID if it was a new record
            fetchIntel(id)
        } catch (error: any) {
            console.error('Save failed:', error)
            alert('Failed to save profile: ' + error.message)
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleGenerateCampaign}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:bg-white/10"
                        style={{ border: '1px solid #2a2a3d', background: '#1a1a27' }}>
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Generate Strategy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Scan brand + social */}
            <div className="glass-card p-6" style={{ border: '1px solid rgba(249,115,22,0.25)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="w-4 h-4 text-orange-400" />
                    <h2 className="font-semibold text-white">Scan brand + social</h2>
                </div>
                <div className="flex gap-2 mb-3">
                    <input
                        type="url"
                        placeholder="Enter client website URL (e.g. https://everestmotoring.co.za)"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                        style={{ background: '#0a0a0f', border: '1px solid #1a1a27' }}
                    />
                    <button
                        onClick={handleScanAll}
                        disabled={scanning || !websiteUrl}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/20"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {scanning ? 'Scanning...' : 'Scan brand + social'}
                    </button>
                </div>
                <p className="text-[10px]" style={{ color: '#4a4a6a' }}>
                    Analyses the website for brand identity, business DNA, and scans connected Facebook &amp; Instagram accounts for posting history.
                </p>

                {/* Progress card */}
                {scanning && (
                    <div className="mt-4 p-4 rounded-xl space-y-2" style={{ background: '#0a0a0f', border: '1px solid #1a1a27' }}>
                        {['brand', 'website', 'social'].map(scan => (
                            <div key={scan} className="flex items-center justify-between text-sm">
                                <span className="capitalize" style={{ color: '#9090b0' }}>{scan} scan</span>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Results card */}
                {scanResults && !scanning && (
                    <div className="mt-4 p-4 rounded-xl space-y-2" style={{ background: '#0a0a0f', border: '1px solid #1a1a27' }}>
                        {[
                            { key: 'brand', label: 'Brand' },
                            { key: 'website', label: 'Website' },
                            { key: 'social', label: 'Social' }
                        ].map(({ key, label }) => {
                            const status: string = scanResults[key] || 'failed'
                            return (
                                <div key={key} className="flex items-center justify-between text-sm">
                                    <span style={{ color: '#9090b0' }}>{label} scan</span>
                                    {status === 'ok' ? (
                                        <span className="flex items-center gap-1 text-green-400">
                                            <Check className="w-3.5 h-3.5" />
                                        </span>
                                    ) : status === 'skipped' ? (
                                        <span className="flex items-center gap-1" style={{ color: '#5a5a7a' }}>
                                            <Minus className="w-3.5 h-3.5" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-400">
                                            <X className="w-3.5 h-3.5" />
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Dismissible success banner */}
            {scanBanner && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#bbf7d0' }}>
                    <span>{scanBanner}</span>
                    <button onClick={() => setScanBanner(null)} className="text-green-300 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content source (read-only) */}
            <div className="glass-card p-6" style={{ border: '1px solid #1a1a27' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Box className="w-4 h-4 text-orange-400" />
                    <h2 className="font-semibold text-white">Content source</h2>
                </div>
                {contentSource?.type ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white capitalize">{contentSource.type}</span>
                            {contentSource.type === 'vehicles' && contentSource.table && (
                                <span className="text-xs" style={{ color: '#5a5a7a' }}>
                                    &middot; {contentSource.table} table &middot; up to 40 active vehicles
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm" style={{ color: '#5a5a7a' }}>Text-only</p>
                )}
                <p className="text-[10px] mt-3" style={{ color: '#3a3a5a' }}>
                    Set via SQL — <code className="text-[10px]" style={{ color: '#4a4a6a' }}>update workspaces set content_source = '...'</code> — see docs/roadmap/day-5-inventory-aware-variants.md.
                </p>
            </div>

            {/* Pomelli Style Analysis */}
            <div className="glass-card p-6 border-dashed border-orange-500/30">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-orange-400" />
                    <h2 className="font-semibold text-white">Extract Business DNA (Pomelli AI)</h2>
                </div>
                <div className="flex gap-2">
                    <input
                        type="url"
                        placeholder="Enter client website URL (e.g. https://everestmotoring.co.za)"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                        style={{ background: '#0a0a0f', border: '1px solid #1a1a27' }}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing || !websiteUrl}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze Site'}
                    </button>
                </div>
                <p className="text-[10px] mt-2" style={{ color: '#4a4a6a' }}>
                    This will automatically populate the Industry, Audience, and Brand Voice sections using Google Pomelli-inspired AI models.
                </p>
            </div>

            {/* Business archetype */}
            <div className="glass-card p-6" style={{ border: '1px solid #1a1a27' }}>
                <div className="flex items-center gap-2 mb-3">
                    <Box className="w-4 h-4 text-orange-400" />
                    <h2 className="font-semibold text-white">Business archetype</h2>
                    {archetypeSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />}
                </div>
                <select
                    value={businessArchetype}
                    onChange={e => handleArchetypeChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer"
                    style={{ background: '#13131a', border: '1px solid #2a2a3d' }}>
                    <option value="product">Product / Inventory</option>
                    <option value="service">Service / Professional</option>
                    <option value="hospitality">Hospitality / Lodge</option>
                    <option value="education">Education / School</option>
                    <option value="creator">Creator / Personal Brand</option>
                </select>
                <p className="text-[10px] mt-2" style={{ color: '#4a4a6a' }}>
                    Determines the mix of content pillars the marketing-plan generator uses. Change this if the client's business doesn't fit Product/Inventory (e.g. a law firm should be Service, a lodge Hospitality).
                </p>
            </div>

            {/* Contact details */}
            <div className="glass-card p-6" style={{ border: '1px solid #1a1a27' }}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-orange-400" />
                        <h2 className="font-semibold text-white">Contact details</h2>
                    </div>
                    <button
                        onClick={handleContactSave}
                        disabled={contactSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        {contactSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {contactSaving ? 'Saving...' : 'Save contact'}
                    </button>
                </div>
                <p className="text-[10px] mb-4" style={{ color: '#4a4a6a' }}>
                    Used to populate the contact strip in generated Facebook posts and spec-card images. Leave blank to omit.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Phone</label>
                        <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                            placeholder="e.g. 013 854 0600"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Email</label>
                        <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                            placeholder="e.g. info@dealership.co.za"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Website URL</label>
                        <input type="url" value={contactWebsiteUrl} onChange={e => setContactWebsiteUrl(e.target.value)}
                            placeholder="e.g. https://everestmotoring.co.za"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Location</label>
                        <input type="text" value={contactLocation} onChange={e => setContactLocation(e.target.value)}
                            placeholder="e.g. White River, Mpumalanga"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Default Hashtags</label>
                        <input type="text" value={defaultHashtags} onChange={e => setDefaultHashtags(e.target.value)}
                            placeholder="e.g. #EverestMotoring, #WhiteRiver, #PreOwnedCars"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
                        <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Comma-separated. The generator picks 3-8 per post from this pool.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9999bb' }}>Sell Your Car URL</label>
                        <input type="url" value={sellYourCarUrl} onChange={e => setSellYourCarUrl(e.target.value)}
                            placeholder="e.g. https://everestmotoring.co.za/value-my-car"
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            style={{ background: '#13131a', border: '1px solid #2a2a3d' }} />
                        <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Used as the CTA link on "Sell your car" posts.</p>
                    </div>
                </div>
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

            {/* Campaign Result Section */}
            {campaign && (
                <div className="glass-card p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-orange-400" />
                            Next 30 Days Strategy
                        </h2>
                        <button onClick={() => setCampaign(null)} className="text-xs text-[#5a5a7a] hover:text-white">Clear</button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaign.pillars?.map((pillar: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl space-y-3" style={{ background: '#13131a', border: '1px solid #1a1a27' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-orange-400" style={{ background: 'rgba(249,115,22,0.1)' }}>
                                        {i + 1}
                                    </div>
                                    <h3 className="font-semibold text-white text-sm">{pillar.title}</h3>
                                </div>
                                <p className="text-xs" style={{ color: '#5a5a7a' }}>{pillar.description}</p>
                                <div className="space-y-2 pt-2">
                                    {pillar.post_ideas?.map((idea: string, j: number) => (
                                        <div key={j} className="flex gap-2 group cursor-pointer">
                                            <div className="mt-1 w-3 h-3 rounded-full border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                                                <Plus className="w-2 h-2 text-orange-400 opacity-0 group-hover:opacity-100" />
                                            </div>
                                            <p className="text-[11px] flex-1 leading-relaxed" style={{ color: '#9090b0' }}>{idea}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <p className="text-[11px] text-[#3a3a5a] text-center max-w-md">
                            Click a post idea to draft it automatically using the client's brand voice.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
