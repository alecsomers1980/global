'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, Key, Plus, Trash2, Copy, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

interface ApiKey {
    id: string
    name: string
    key_prefix: string
    created_at: string
    last_used_at: string | null
}

export default function ApiKeysPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchKeys(p.id)
        })
    }, [params])

    const fetchKeys = async (id: string) => {
        const { data } = await supabase
            .from('workspace_api_keys')
            .select('id, name, key_prefix, created_at, last_used_at')
            .eq('workspace_id', id)
            .order('created_at', { ascending: false })

        if (data) setKeys(data as ApiKey[])
        setLoading(false)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyName.trim()) return
        setCreating(true)

        // In a real app, the server creates the hashed key and returns the raw key ONCE.
        // For this UI mockup, we simulate creation.
        const res = await fetch('/api/keys/create', {
            method: 'POST',
            body: JSON.stringify({ workspaceId, name: newKeyName })
        })

        if (res.ok) {
            const data = await res.json()
            setNewlyCreatedKey(data.rawKey) // Only showed once!
            setNewKeyName('')
            fetchKeys(workspaceId)
        }

        setCreating(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Revoke this API Key? Any apps using it will lose access immediately.')) return

        await supabase.from('workspace_api_keys').delete().eq('id', id)
        fetchKeys(workspaceId)
    }

    const handleCopy = () => {
        if (!newlyCreatedKey) return
        navigator.clipboard.writeText(newlyCreatedKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Link href={`/dashboard/workspaces/${workspaceId}`}
                        className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-white"
                        style={{ color: '#5a5a7a' }}>
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to workspace
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                            style={{ background: 'rgba(249,115,22,0.15)' }}>
                            <Key className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">API Keys</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>Create triggers from external apps (like Everest Motoring)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <form onSubmit={handleCreate} className="glass-card p-5 space-y-4">
                        <h2 className="font-semibold text-white">Generate New Key</h2>
                        <div className="space-y-1.5">
                            <label className="text-xs" style={{ color: '#9999bb' }}>Key Name</label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={e => setNewKeyName(e.target.value)}
                                placeholder="e.g. Everest Website Trigger"
                                required
                                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-orange-500/50"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating || !newKeyName.trim()}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: '#f97316' }}>
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Create Key
                        </button>
                    </form>

                    <div className="p-4 rounded-xl text-xs" style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', color: '#fba96c' }}>
                        <p className="font-semibold mb-1">How to use API triggers:</p>
                        <p className="mb-2">Send a POST request to `/api/trigger` with your API key in the Authorization header.</p>
                        <code className="block p-2 rounded bg-black/50 overflow-x-auto text-[10px]">
                            {`POST /api/trigger
Authorization: Bearer es_...

{
  "content": "New vehicle listed...",
  "platforms": ["facebook", "instagram"]
}`}
                        </code>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    {newlyCreatedKey && (
                        <div className="p-5 rounded-xl border" style={{ background: '#0a0a0f', borderColor: '#34d399' }}>
                            <h3 className="text-sm font-semibold text-white mb-1">Save your new API key!</h3>
                            <p className="text-xs mb-3" style={{ color: '#5a5a7a' }}>This is the only time it will be shown. If you lose it, you must generate a new one.</p>
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={newlyCreatedKey}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-mono text-white"
                                    style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                                />
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2.5 rounded-lg flex items-center justify-center transition-colors"
                                    style={{ background: copied ? '#34d399' : '#1a1a27', color: copied ? '#064e3b' : '#fff' }}>
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <button
                                onClick={() => setNewlyCreatedKey(null)}
                                className="mt-3 text-xs w-full py-2 hover:bg-white/5 rounded-lg text-[#5a5a7a] transition-colors">
                                I have saved this key safely
                            </button>
                        </div>
                    )}

                    <div className="glass-card p-0 overflow-hidden">
                        <div className="p-5" style={{ borderBottom: '1px solid #1a1a27' }}>
                            <h2 className="font-semibold text-white">Active Keys</h2>
                        </div>

                        {keys.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: '#5a5a7a' }}>No API keys created yet.</div>
                        ) : (
                            <div className="divide-y divide-[#1a1a27]">
                                {keys.map(key => (
                                    <div key={key.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div>
                                            <h3 className="text-sm font-medium text-white mb-1">{key.name}</h3>
                                            <div className="flex items-center gap-3 text-xs" style={{ color: '#5a5a7a' }}>
                                                <code className="px-1.5 py-0.5 rounded bg-black/30 text-[#8a8aaa] font-mono">{key.key_prefix}...</code>
                                                <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(key.id)}
                                            className="p-2 rounded-lg text-[#5a5a7a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Revoke key">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
