'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, Wifi, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { PLATFORM_LABELS, PLATFORM_COLORS, type Platform } from '@/lib/utils'

interface SocialAccount {
    id: string
    platform: Platform
    account_name: string
    account_id: string
    token_expires_at: string | null
}

const PLATFORMS: { id: Platform; label: string; description: string }[] = [
    { id: 'facebook', label: 'Facebook Page', description: 'Publish to business pages' },
    { id: 'instagram', label: 'Instagram Business', description: 'Publish posts, reels, stories' },
    { id: 'linkedin', label: 'LinkedIn Company', description: 'Publish to company pages' },
    { id: 'tiktok', label: 'TikTok Business', description: 'Publish video content' },
    { id: 'youtube', label: 'YouTube Channel', description: 'Publish videos and shorts' },
]

export default function PlatformsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [accounts, setAccounts] = useState<SocialAccount[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchAccounts(p.id)
        })
    }, [params])

    const fetchAccounts = async (id: string) => {
        const { data } = await supabase
            .from('social_accounts')
            .select('id, platform, account_name, account_id, token_expires_at')
            .eq('workspace_id', id)

        if (data) setAccounts(data as SocialAccount[])
        setLoading(false)
    }

    const handleConnect = async (platform: Platform) => {
        if (platform === 'facebook') {
            window.location.href = `/api/auth/facebook/init?workspaceId=${workspaceId}`
        } else {
            alert(`Connecting to ${PLATFORM_LABELS[platform]} - Authorization flow will be implemented in Phase 2.`)
        }
    }

    const handleDisconnect = async (id: string) => {
        if (!confirm('Are you sure you want to disconnect this account? Scheduled posts may fail.')) return

        await supabase.from('social_accounts').delete().eq('id', id)
        fetchAccounts(workspaceId)
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
                            <Wifi className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Platform Connections</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>Connect social media accounts to enable publishing</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {PLATFORMS.map(({ id, label, description }) => {
                    const connectedAccount = accounts.find(a => a.platform === id)
                    const isExpiringSoon = connectedAccount?.token_expires_at
                        ? new Date(connectedAccount.token_expires_at).getTime() < Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
                        : false

                    return (
                        <div key={id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                            style={{ border: connectedAccount ? `1px solid ${PLATFORM_COLORS[id]}40` : '1px solid #1a1a27' }}>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                                    style={{ background: `${PLATFORM_COLORS[id]}15`, color: PLATFORM_COLORS[id] }}>
                                    {label.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-0.5 flex items-center gap-2">
                                        {label}
                                        {connectedAccount && <CheckCircle className="w-4 h-4 text-green-400" />}
                                    </h3>
                                    <p className="text-sm" style={{ color: '#5a5a7a' }}>
                                        {connectedAccount ? connectedAccount.account_name : description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {connectedAccount ? (
                                    <>
                                        {isExpiringSoon && (
                                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Re-authenticate soon
                                            </div>
                                        )}
                                        <button onClick={() => handleDisconnect(connectedAccount.id)}
                                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                                            style={{ color: '#8a8aaa', border: '1px solid #2a2a3d' }}>
                                            Disconnect
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => handleConnect(id)}
                                        className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
                                        style={{ background: PLATFORM_COLORS[id] }}>
                                        <Plus className="w-4 h-4" />
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
