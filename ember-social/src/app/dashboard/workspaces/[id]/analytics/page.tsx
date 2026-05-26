'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart2, TrendingUp, Users, Heart, MessageCircle, Share2, Eye, Loader2, Info } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
    totals: { impressions: number; reach: number; likes: number; comments: number; shares: number }
    perPlatform: Record<string, { impressions: number; reach: number; likes: number; comments: number; shares: number }>
    perPattern: { tue_thu_sat: { total: number; count: number; avgEngagement: number }; mon_wed_fri: { total: number; count: number; avgEngagement: number } }
    timeseries: { date: string; impressions: number; reach: number; likes: number; comments: number; shares: number }[]
}

function fmt(n: number | undefined): string {
    if (!n || n === 0) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toLocaleString()
}

function fmtDecimal(n: number): string {
    return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [error, setError] = useState('')
    const [timeRange, setTimeRange] = useState('30d')

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchData(p.id)
        })
    }, [params])

    const fetchData = async (id: string) => {
        try {
            const res = await fetch(`/api/workspaces/${id}/analytics`)
            const d = await res.json()
            if (d.error) throw new Error(d.error)
            setData(d)
        } catch (err: any) {
            setError(err.message)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Info className="w-12 h-12 text-red-500/50" />
                <p className="text-sm text-white">Failed to load analytics: {error}</p>
            </div>
        )
    }

    if (!data) return null

    const { totals, perPlatform, perPattern, timeseries } = data
    const hasData = totals.likes + totals.comments + totals.shares + totals.impressions > 0

    const totalEngagement = totals.likes + totals.comments + totals.shares
    const allRowsCount = perPattern.tue_thu_sat.count + perPattern.mon_wed_fri.count
    const engagementRate = totals.reach > 0 ? (totalEngagement / totals.reach) * 100 : (allRowsCount > 0 ? (totalEngagement / allRowsCount) : 0)

    const showPatternComparison = perPattern.tue_thu_sat.count >= 5 && perPattern.mon_wed_fri.count >= 5
    const tueWinner = perPattern.tue_thu_sat.avgEngagement > perPattern.mon_wed_fri.avgEngagement
    const monWinner = perPattern.mon_wed_fri.avgEngagement > perPattern.tue_thu_sat.avgEngagement

    const stats = [
        { label: 'Total Reach', value: fmt(totals.reach), icon: Users, color: '#818cf8' },
        { label: 'Engagement Rate', value: engagementRate.toFixed(1) + '%', icon: TrendingUp, color: '#34d399' },
        { label: 'Total Likes', value: fmt(totals.likes), icon: Heart, color: '#f472b6' },
        { label: 'Comments', value: fmt(totals.comments), icon: MessageCircle, color: '#fbbf24' },
        { label: 'Impressions', value: fmt(totals.impressions), icon: Eye, color: '#c084fc' },
        { label: 'Shares', value: fmt(totals.shares), icon: Share2, color: '#60a5fa' },
    ]

    const platformLabels: Record<string, string> = {
        facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube',
    }
    const platformColors: Record<string, string> = {
        facebook: '#1877F2', instagram: '#E4405F', tiktok: '#000000', linkedin: '#0A66C2', youtube: '#FF0000',
    }
    const platformEntries = Object.entries(perPlatform).sort(([, a], [, b]) =>
        (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
    )

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
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
                            <BarChart2 className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Analytics</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>Track performance across all platforms</p>
                        </div>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <div className="glass-card p-12 text-center">
                    <BarChart2 className="w-12 h-12 mx-auto mb-4 text-[#2a2a3d]" />
                    <h2 className="text-lg font-semibold text-white mb-2">No engagement data yet</h2>
                    <p className="text-sm max-w-md mx-auto" style={{ color: '#5a5a7a' }}>
                        Publish posts and engagement metrics will appear within 6 hours.
                        Once your content is live, Facebook and Instagram data will be collected automatically.
                    </p>
                </div>
            ) : (
                <>
                    {/* Stats cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        {stats.map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="glass-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium" style={{ color: '#8a8aaa' }}>{label}</span>
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg"
                                        style={{ background: `${color}15`, color }}>
                                        <Icon className="w-3.5 h-3.5" />
                                    </div>
                                </div>
                                <p className="text-xl font-bold text-white leading-none">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Schedule pattern comparison */}
                    {showPatternComparison && (
                        <div className="glass-card p-5">
                            <h2 className="font-semibold text-white mb-4">Schedule Pattern Comparison</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl"
                                    style={{
                                        background: tueWinner ? 'rgba(52,211,153,0.05)' : '#13131a',
                                        border: tueWinner ? '1px solid rgba(52,211,153,0.2)' : '1px solid #1a1a27'
                                    }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-white">Tue/Thu/Sat</span>
                                        {tueWinner && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold">Winner</span>}
                                    </div>
                                    <p className="text-2xl font-bold text-white">{fmtDecimal(perPattern.tue_thu_sat.avgEngagement)}</p>
                                    <p className="text-[11px] mt-1" style={{ color: '#5a5a7a' }}>
                                        avg engagement per post ({perPattern.tue_thu_sat.count} posts)
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl"
                                    style={{
                                        background: monWinner ? 'rgba(52,211,153,0.05)' : '#13131a',
                                        border: monWinner ? '1px solid rgba(52,211,153,0.2)' : '1px solid #1a1a27'
                                    }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-white">Mon/Wed/Fri</span>
                                        {monWinner && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-semibold">Winner</span>}
                                    </div>
                                    <p className="text-2xl font-bold text-white">{fmtDecimal(perPattern.mon_wed_fri.avgEngagement)}</p>
                                    <p className="text-[11px] mt-1" style={{ color: '#5a5a7a' }}>
                                        avg engagement per post ({perPattern.mon_wed_fri.count} posts)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Platform breakdown */}
                    {platformEntries.length > 0 && (
                        <div className="glass-card p-5">
                            <h2 className="font-semibold text-white mb-4">Platform Breakdown</h2>
                            <div className="space-y-3">
                                {platformEntries.map(([platform, vals]) => {
                                    const eng = vals.likes + vals.comments + vals.shares
                                    const max = Math.max(...platformEntries.map(([, v]) => v.likes + v.comments + v.shares), 1)
                                    const pct = max > 0 ? (eng / max) * 100 : 0
                                    return (
                                        <div key={platform} className="flex items-center gap-3">
                                            <span className="text-xs font-semibold uppercase w-20 shrink-0" style={{ color: platformColors[platform] || '#8a8aaa' }}>
                                                {platformLabels[platform] || platform}
                                            </span>
                                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#13131a' }}>
                                                <div className="h-full rounded-full transition-all" style={{
                                                    width: `${pct}%`,
                                                    background: platformColors[platform] || '#8a8aaa',
                                                }} />
                                            </div>
                                            <span className="text-xs font-semibold text-white shrink-0 w-12 text-right">{fmt(eng)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Timeseries — simple bar chart of daily engagement */}
                    {timeseries.length > 0 && (
                        <div className="glass-card p-5">
                            <h2 className="font-semibold text-white mb-4">Daily Engagement (last 30 days)</h2>
                            <div className="flex items-end gap-1 h-32">
                                {timeseries.slice(-30).map((d, i) => {
                                    const eng = d.likes + d.comments + d.shares
                                    const maxEng = Math.max(...timeseries.slice(-30).map(t => t.likes + t.comments + t.shares), 1)
                                    const barH = maxEng > 0 ? (eng / maxEng) * 100 : 0
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                            <span className="text-[9px]" style={{ color: barH > 0 ? '#f97316' : '#3a3a5a' }}>
                                                {eng > 0 ? fmt(eng) : ''}
                                            </span>
                                            <div className="w-full rounded-t transition-all" style={{
                                                height: `${Math.max(barH, eng > 0 ? 4 : 2)}%`,
                                                background: barH > 0 ? '#f97316' : '#1a1a27',
                                                minHeight: 2,
                                            }} />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex items-end gap-1 mt-1">
                                {timeseries.slice(-30).map((d, i) => {
                                    const label = i === 0 || i === timeseries.slice(-30).length - 1 || i % 7 === 0
                                        ? new Date(d.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                                        : ''
                                    return (
                                        <span key={i} className="flex-1 text-center text-[9px] truncate" style={{ color: '#3a3a5a' }}>
                                            {label}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
