'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { ArrowLeft, ShieldCheck, Loader2, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { PostPreviewCard } from '@/components/PostPreviewCard'
import type { Database } from '@/types/database'

type BrandKit = Database['public']['Tables']['brand_kits']['Row']

interface Post {
    id: string
    content: string
    media_urls: string[] | null
    platforms: string[]
    scheduled_at: string | null
    status: string
    approval_token: string | null
    created_at: string
}

type FilterTab = 'pending' | 'changes' | 'approved'

export default function ApprovalsPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [posts, setPosts] = useState<Post[]>([])
    const [brandKit, setBrandKit] = useState<BrandKit | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<FilterTab>('pending')
    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setWorkspaceId(p.id)
            fetchData(p.id)
        })
    }, [params])

    const fetchData = async (id: string) => {
        const [{ data: postsData }, { data: brandKitData }] = await Promise.all([
            supabase
                .from('posts')
                .select('id, content, media_urls, platforms, scheduled_at, status, approval_token, created_at')
                .eq('workspace_id', id)
                .in('status', ['pending_approval', 'draft', 'approved'])
                .order('created_at', { ascending: false }),
            supabase
                .from('brand_kits')
                .select('*')
                .eq('workspace_id', id)
                .single(),
        ])

        if (postsData) setPosts(postsData as Post[])
        if (brandKitData) setBrandKit(brandKitData)
        setLoading(false)
    }

    const handleApprove = async (postId: string) => {
        await supabase.from('posts').update({ status: 'approved' } as never).eq('id', postId)
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'approved' } : p))
    }

    const handleReject = async (postId: string) => {
        await supabase.from('posts').update({ status: 'draft' } as never).eq('id', postId)
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'draft' } : p))
    }

    const filteredPosts = posts.filter(p => {
        if (activeTab === 'pending') return p.status === 'pending_approval'
        if (activeTab === 'changes') return p.status === 'draft'
        if (activeTab === 'approved') return p.status === 'approved'
        return true
    })

    const pendingCount = posts.filter(p => p.status === 'pending_approval').length
    const changesCount = posts.filter(p => p.status === 'draft').length
    const approvedCount = posts.filter(p => p.status === 'approved').length

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'pending', label: 'Pending', count: pendingCount },
        { key: 'changes', label: 'Changes Requested', count: changesCount },
        { key: 'approved', label: 'Recently Approved', count: approvedCount },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
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
                        <ShieldCheck className="w-full h-full text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Content Approvals</h1>
                        <p className="text-sm" style={{ color: '#5a5a7a' }}>
                            Review and approve pending posts
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={activeTab === key
                            ? { background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }
                            : { background: '#1a1a27', color: '#5a5a7a', border: '1px solid #2a2a3d' }
                        }>
                        {label}
                        {count > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                style={activeTab === key
                                    ? { background: 'rgba(249,115,22,0.2)', color: '#f97316' }
                                    : { background: '#2a2a3d', color: '#5a5a7a' }
                                }>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Posts list */}
            {filteredPosts.length === 0 ? (
                <div className="glass-card p-6 min-h-[300px]">
                    <div className="text-center py-24">
                        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-[#2a2a3d]" />
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {activeTab === 'pending' && 'No posts awaiting approval'}
                            {activeTab === 'changes' && 'No posts with change requests'}
                            {activeTab === 'approved' && 'No recently approved posts'}
                        </h3>
                        <p className="text-sm max-w-sm mx-auto" style={{ color: '#5a5a7a' }}>
                            {activeTab === 'pending' && 'When posts are submitted via the API or composed for review, they will appear here.'}
                            {activeTab === 'changes' && 'Posts that you request changes on will appear here for the team to revise.'}
                            {activeTab === 'approved' && 'Posts you approve will show here before they are scheduled for publishing.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredPosts.map(post => (
                        <PostPreviewCard
                            key={post.id}
                            post={post}
                            brandKit={brandKit}
                            showActions={true}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
