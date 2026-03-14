'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, BarChart2, TrendingUp, Users, Heart, MessageCircle, Share2, Calendar, Download } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('30d')

    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            // In a real implementation we would fetch actual stats from the `post_results` table here
            setTimeout(() => setLoading(false), 800)
        })
    }, [params])

    // Mock data for Phase 1 UI
    const stats = [
        { label: 'Total Reach', value: '45.2K', trend: '+12.5%', icon: Users, color: '#818cf8', trendUp: true },
        { label: 'Engagement Rate', value: '4.8%', trend: '+0.4%', icon: TrendingUp, color: '#34d399', trendUp: true },
        { label: 'Total Likes', value: '2,405', trend: '+18.2%', icon: Heart, color: '#f472b6', trendUp: true },
        { label: 'Comments', value: '342', trend: '-2.1%', icon: MessageCircle, color: '#fbbf24', trendUp: false },
    ]

    const topPosts = [
        { id: 1, content: "We're thrilled to announce our new partnership with...", platform: 'linkedin', likes: 342, comments: 45, type: 'Update' },
        { id: 2, content: "Behind the scenes at today's photo shoot! 📸", platform: 'instagram', likes: 890, comments: 112, type: 'Reel' },
        { id: 3, content: "5 Tips for organizing your workspace 📝", platform: 'facebook', likes: 156, comments: 23, type: 'Carousel' },
    ]

    if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /></div>

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

                <div className="flex items-center gap-3">
                    <div className="flex items-center p-1 rounded-xl" style={{ background: '#13131a', border: '1px solid #2a2a3d' }}>
                        {['7d', '30d', '90d'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                    background: timeRange === range ? '#2a2a3d' : 'transparent',
                                    color: timeRange === range ? '#fff' : '#5a5a7a'
                                }}>
                                {range}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                        style={{ color: '#8a8aaa', border: '1px solid #2a2a3d' }}>
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Top Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, trend, icon: Icon, color, trendUp }) => (
                    <div key={label} className="glass-card p-5 transition-transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium" style={{ color: '#8a8aaa' }}>{label}</span>
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                                style={{ background: `${color}15`, color }}>
                                <Icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-bold text-white leading-none">{value}</p>
                            <div className="flex items-center gap-1 text-xs font-semibold mb-0.5"
                                style={{ color: trendUp ? '#34d399' : '#f87171' }}>
                                <TrendingUp className="w-3 h-3" style={{ transform: trendUp ? 'none' : 'scaleY(-1)' }} />
                                {trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Top Performing Posts */}
                <div className="lg:col-span-2 glass-card p-0 overflow-hidden">
                    <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #1a1a27' }}>
                        <h2 className="font-semibold text-white">Top Performing Posts</h2>
                    </div>
                    <div className="divide-y divide-[#1a1a27]">
                        {topPosts.map((post, i) => (
                            <div key={post.id} className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="w-8 text-center text-sm font-bold" style={{ color: '#5a5a7a' }}>#{i + 1}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate mb-1">{post.content}</p>
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider" style={{ color: '#8a8aaa' }}>
                                        <span className="px-1.5 py-0.5 rounded bg-[#2a2a3d]">{post.platform}</span>
                                        <span>·</span>
                                        <span>{post.type}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">{post.likes}</p>
                                        <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Likes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-white">{post.comments}</p>
                                        <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Comments</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audience / Demographics placeholder */}
                <div className="glass-card p-5 flex flex-col">
                    <h2 className="font-semibold text-white mb-6">AI Growth Insights</h2>

                    <div className="flex-1 space-y-4">
                        {[
                            { text: "Video content is driving 3x more engagement than static images this month.", type: 'positive' },
                            { text: "Best time to post for this audience is shifting to Tuesday mornings (8am - 10am).", type: 'neutral' },
                            { text: "Posts containing question prompts in the first line saw a 40% increase in comments.", type: 'positive' }
                        ].map((insight, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: '#13131a', border: '1px solid #2a2a3d' }}>
                                <SparkleIcon color={insight.type === 'positive' ? '#34d399' : '#f97316'} />
                                <p className="text-xs text-[#e2e2f0] leading-relaxed">{insight.text}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-2.5 rounded-xl text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                        style={{ border: '1px solid rgba(249,115,22,0.3)' }}>
                        Generate Optimization Strategy
                    </button>
                </div>
            </div>
        </div>
    )
}

function SparkleIcon({ color }: { color: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
            <path d="M12 22C12 22 12 16 18 12C12 8 12 2 12 2C12 2 12 8 6 12C12 16 12 22 12 22Z" fill={color} />
        </svg>
    )
}
