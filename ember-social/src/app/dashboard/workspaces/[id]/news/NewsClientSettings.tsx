'use client'

import { useCallback, useState } from 'react'
import { Eye, EyeOff, Save, Check, PlugZap, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
    workspaceId: string
    initial: {
        client_supabase_url?: string | null
        client_supabase_service_key?: string | null
        client_site_url?: string | null
        client_news_table?: string | null
    }
}

export default function NewsClientSettings({ workspaceId, initial }: Props) {
    const [clientSiteUrl, setClientSiteUrl] = useState(initial.client_site_url ?? '')
    const [clientSupabaseUrl, setClientSupabaseUrl] = useState(initial.client_supabase_url ?? '')
    const [clientSupabaseServiceKey, setClientSupabaseServiceKey] = useState(initial.client_supabase_service_key ?? '')
    const [clientNewsTable, setClientNewsTable] = useState(initial.client_news_table ?? 'news_posts')
    const [showKey, setShowKey] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ ok: boolean; checks?: Array<{ name: string; ok: boolean; detail?: string }>; error?: string } | null>(null)

    const handleSave = useCallback(async () => {
        setSaving(true)
        setSaved(false)
        setError(null)
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_site_url: clientSiteUrl,
                    client_supabase_url: clientSupabaseUrl,
                    client_supabase_service_key: clientSupabaseServiceKey,
                    client_news_table: clientNewsTable,
                }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data?.error || 'Failed to save settings')
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            setError(err?.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }, [workspaceId, clientSiteUrl, clientSupabaseUrl, clientSupabaseServiceKey, clientNewsTable])

    const handleTest = useCallback(async () => {
        setTesting(true)
        setTestResult(null)
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/test-client`, { method: 'POST' })
            const data = await res.json().catch(() => ({}))
            setTestResult(data)
        } catch (err: any) {
            setTestResult({ ok: false, error: err?.message || 'Test failed' })
        } finally {
            setTesting(false)
        }
    }, [workspaceId])

    const inputStyle = { background: '#13131a', border: '1px solid #2a2a3d' }
    const inputClass = 'w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-orange-400/40'
    const labelClass = 'block text-xs uppercase tracking-widest mb-1'
    const labelStyle = { color: '#5a5a7a' }

    return (
        <div className="glass-card p-5">
            <div className="mb-4">
                <h2 className="text-base font-semibold text-white">Client site connection</h2>
                <p className="text-xs mt-0.5" style={{ color: '#8a8aaa' }}>
                    Ember-Social pushes approved articles directly into the client&apos;s Supabase.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className={labelClass} style={labelStyle}>Client site URL</label>
                    <input
                        type="text"
                        value={clientSiteUrl}
                        onChange={(e) => setClientSiteUrl(e.target.value)}
                        placeholder="https://everestmotoring.co.za"
                        className={inputClass}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelClass} style={labelStyle}>Supabase URL</label>
                    <input
                        type="text"
                        value={clientSupabaseUrl}
                        onChange={(e) => setClientSupabaseUrl(e.target.value)}
                        placeholder="https://<ref>.supabase.co"
                        className={inputClass}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label className={labelClass} style={labelStyle}>Service role key</label>
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={clientSupabaseServiceKey}
                            onChange={(e) => setClientSupabaseServiceKey(e.target.value)}
                            placeholder="eyJ..."
                            className={`${inputClass} pr-11`}
                            style={inputStyle}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            aria-label={showKey ? 'Hide key' : 'Show key'}
                        >
                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className={labelClass} style={labelStyle}>News table name</label>
                    <input
                        type="text"
                        value={clientNewsTable}
                        onChange={(e) => setClientNewsTable(e.target.value)}
                        placeholder="news_posts"
                        className={inputClass}
                        style={inputStyle}
                    />
                </div>
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving…' : 'Save settings'}
                </button>

                <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: '#2a2a3d' }}
                >
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" />}
                    {testing ? 'Testing…' : 'Test connection'}
                </button>

                {saved && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                        <Check className="w-4 h-4" />
                        Saved
                    </span>
                )}
                {error && (
                    <span className="text-sm text-red-400">{error}</span>
                )}
            </div>

            {testResult && (
                <div
                    className="mt-4 rounded-lg p-4 text-sm"
                    style={{
                        background: testResult.ok ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${testResult.ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        {testResult.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-medium ${testResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                            {testResult.ok ? 'Connection healthy' : 'Connection failed'}
                        </span>
                    </div>
                    {testResult.error && (
                        <p className="text-xs text-red-400 mb-2">{testResult.error}</p>
                    )}
                    {testResult.checks && (
                        <ul className="space-y-1">
                            {testResult.checks.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs">
                                    {c.ok ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    <span className="text-white">{c.name}</span>
                                    {c.detail && (
                                        <span style={{ color: '#8a8aaa' }}>— {c.detail}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
