'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Wifi, Plus, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
    { id: 'google_business', label: 'Google Business Profile', description: 'Publish local posts to Google Maps & Search' },
    { id: 'linkedin', label: 'LinkedIn Company', description: 'Publish to company pages' },
    { id: 'tiktok', label: 'TikTok Business', description: 'Publish video content' },
    { id: 'youtube', label: 'YouTube Channel', description: 'Publish videos and shorts' },
]

// Platforms with OAuth flows implemented
const SUPPORTED_PLATFORMS: Platform[] = ['facebook', 'instagram', 'google_business', 'youtube', 'tiktok']

export default function PlatformsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [accounts, setAccounts] = useState<SocialAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [disconnecting, setDisconnecting] = useState<string | null>(null)
    const searchParams = useSearchParams()

    const success = searchParams.get('success')
    const error = searchParams.get('error')

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchAccounts(p.id)
        })
    }, [params])

    const fetchAccounts = async (id: string) => {
        try {
            const res = await fetch(`/api/auth/social-accounts?workspaceId=${id}`)
            const data = await res.json()
            if (data.accounts) setAccounts(data.accounts)
        } catch (err) {
            console.error('Failed to fetch accounts:', err)
        }
        setLoading(false)
    }

    const handleConnect = (platform: Platform) => {
        if (platform === 'facebook') {
            window.location.href = `/api/auth/facebook/init?workspaceId=${workspaceId}`
        } else if (platform === 'instagram') {
            window.location.href = `/api/auth/instagram/init?workspaceId=${workspaceId}`
        } else if (platform === 'google_business') {
            window.location.href = `/api/auth/gbp/init?workspaceId=${workspaceId}`
        } else if (platform === 'youtube') {
            window.location.href = `/api/auth/youtube/init?workspaceId=${workspaceId}`
        } else if (platform === 'tiktok') {
            window.location.href = `/api/auth/tiktok/init?workspaceId=${workspaceId}`
        } else {
            alert(`${PLATFORM_LABELS[platform]} connection coming soon.`)
        }
    }

    const handleSwitchAccount = (platform: Platform) => {
        if (platform === 'facebook') {
            window.location.href = `/api/auth/facebook/init?workspaceId=${workspaceId}&reauth=1`
        } else if (platform === 'instagram') {
            window.location.href = `/api/auth/instagram/init?workspaceId=${workspaceId}&reauth=1`
        } else if (platform === 'google_business') {
            window.location.href = `/api/auth/gbp/init?workspaceId=${workspaceId}&reauth=1`
        } else if (platform === 'youtube') {
            window.location.href = `/api/auth/youtube/init?workspaceId=${workspaceId}&reauth=1`
        } else if (platform === 'tiktok') {
            window.location.href = `/api/auth/tiktok/init?workspaceId=${workspaceId}`
        }
    }

    const handleDisconnect = async (id: string) => {
        if (!confirm('Are you sure you want to disconnect this account? Scheduled posts for this platform may fail.')) return

        setDisconnecting(id)
        try {
            await fetch('/api/auth/social-accounts/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: id }),
            })
            setAccounts(prev => prev.filter(a => a.id !== id))
        } catch (err) {
            console.error('Failed to disconnect:', err)
        }
        setDisconnecting(null)
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

            {/* Status messages from OAuth redirects */}
            {success === 'true' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle className="w-4 h-4" />
                    Account connected successfully!
                </div>
            )}
            {success === 'pending_approval' && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(234,179,8,0.1)', color: '#facc15', border: '1px solid rgba(234,179,8,0.2)' }}>
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                        Google account authorised, but the Business Profile API is still awaiting Google approval (usually 2–4 weeks).
                        Once approved, posting will start working automatically — no reconnect needed.
                    </span>
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-4 h-4" />
                    {error === 'no_instagram_account'
                        ? 'No Instagram Business account found linked to your Facebook Pages. Make sure your Instagram is converted to a Business account and linked to a Facebook Page.'
                        : error === 'no_youtube_channel'
                            ? 'No YouTube channel found on this Google account. Create a channel at youtube.com, then reconnect.'
                            : error === 'auth_failed'
                                ? 'Authentication failed. Please try again.'
                                : `Connection error: ${error}`
                    }
                </div>
            )}

            <div className="grid gap-4">
                {PLATFORMS.map(({ id, label, description }) => {
                    const connectedAccounts = accounts.filter(a => a.platform === id)
                    const isSupported = SUPPORTED_PLATFORMS.includes(id)
                    const isExpiringSoon = connectedAccounts.some(a =>
                        a.token_expires_at && new Date(a.token_expires_at).getTime() < Date.now() + 1000 * 60 * 60 * 24 * 7
                    )

                    return (
                        <div key={id} className="glass-card p-5 transition-all"
                            style={{ border: connectedAccounts.length > 0 ? `1px solid ${PLATFORM_COLORS[id]}40` : '1px solid #1a1a27' }}>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                                        style={{ background: `${PLATFORM_COLORS[id]}15`, color: PLATFORM_COLORS[id] }}>
                                        {label.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-0.5 flex items-center gap-2">
                                            {label}
                                            {connectedAccounts.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
                                        </h3>
                                        <p className="text-sm" style={{ color: '#5a5a7a' }}>
                                            {connectedAccounts.length > 0
                                                ? connectedAccounts.map(a => a.account_name).join(', ')
                                                : description
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {connectedAccounts.length > 0 ? (
                                        <>
                                            {isExpiringSoon && (
                                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Re-authenticate soon
                                                </div>
                                            )}
                                            {isSupported && (
                                                <button onClick={() => handleSwitchAccount(id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                                                    style={{ color: PLATFORM_COLORS[id], border: `1px solid ${PLATFORM_COLORS[id]}40` }}>
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    Switch
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button onClick={() => handleConnect(id)}
                                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
                                            style={{ background: isSupported ? PLATFORM_COLORS[id] : '#2a2a3d' }}>
                                            <Plus className="w-4 h-4" />
                                            Connect
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Individual account rows when multiple are connected */}
                            {connectedAccounts.length > 0 && (
                                <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid #1a1a27' }}>
                                    {connectedAccounts.map(account => (
                                        <div key={account.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg"
                                            style={{ background: '#0d0d15' }}>
                                            <span className="text-sm text-white">{account.account_name}</span>
                                            <button
                                                onClick={() => handleDisconnect(account.id)}
                                                disabled={disconnecting === account.id}
                                                className="text-xs px-3 py-1 rounded-md transition-colors hover:bg-red-500/10"
                                                style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                {disconnecting === account.id ? 'Disconnecting...' : 'Disconnect'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
