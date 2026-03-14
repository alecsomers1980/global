'use client'

import { useState } from 'react'
import { ArrowLeft, Inbox as InboxIcon, MessageCircle, Heart, Search, Filter, Reply, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { PLATFORM_LABELS, PLATFORM_COLORS, type Platform } from '@/lib/utils'

// Mock data for Phase 1 UI building
const MOCK_MESSAGES = [
    {
        id: 'msg_1',
        platform: 'instagram' as Platform,
        type: 'comment',
        author: { name: 'Sarah Jenkins', handle: '@sarahj22', avatar: 'https://i.pravatar.cc/150?u=sarahj22' },
        content: "Absolutely love the new look! When will these be available in store?",
        postPreview: "Launch day is finally here! Get ready for our biggest drop yet. 🚀",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'unread'
    },
    {
        id: 'msg_2',
        platform: 'facebook' as Platform,
        type: 'dm',
        author: { name: 'Michael Chen', handle: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=mchen' },
        content: "Hi, I have a question about my recent order #88492. Is it possible to change the shipping address?",
        postPreview: null,
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        status: 'unread'
    },
    {
        id: 'msg_3',
        platform: 'linkedin' as Platform,
        type: 'comment',
        author: { name: 'Tech Solutions Inc', handle: 'Tech Solutions Inc', avatar: 'https://i.pravatar.cc/150?u=tech' },
        content: "Great insights! Have you considered how this impacts remote teams?",
        postPreview: "5 Ways to Improve Team Productivity in 2025. Read our latest blog post below ⬇️",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        status: 'read'
    }
]

export default function InboxPage({ params }: { params: Promise<{ id: string }> }) {
    const [workspaceId, setWorkspaceId] = useState('')
    const [selectedMsg, setSelectedMsg] = useState(MOCK_MESSAGES[0])
    const [replyText, setReplyText] = useState('')

    // Unwrap params
    useState(() => {
        params.then(p => setWorkspaceId(p.id))
    })

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
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
                            <InboxIcon className="w-full h-full text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Unified Inbox</h1>
                            <p className="text-sm" style={{ color: '#5a5a7a' }}>Manage comments and DMs across all platforms</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 glass-card overflow-hidden grid md:grid-cols-12">
                {/* Left Column: List */}
                <div className="md:col-span-5 lg:col-span-4 flex flex-col" style={{ borderRight: '1px solid #1a1a27' }}>
                    <div className="p-3 border-b border-[#1a1a27]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4a4a6a' }} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-orange-500/50"
                                style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                            />
                        </div>
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
                            <button className="text-xs px-2.5 py-1 rounded-md font-medium text-white" style={{ background: '#2a2a3d' }}>All</button>
                            <button className="text-xs px-2.5 py-1 rounded-md font-medium text-[#5a5a7a] hover:text-white hover:bg-white/5 transition-colors">Unread</button>
                            <button className="text-xs px-2.5 py-1 rounded-md font-medium text-[#5a5a7a] border border-[#2a2a3d] hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {MOCK_MESSAGES.map(msg => (
                            <button
                                key={msg.id}
                                onClick={() => setSelectedMsg(msg)}
                                className="w-full text-left p-4 transition-colors relative"
                                style={{
                                    background: selectedMsg.id === msg.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                                    borderBottom: '1px solid #1a1a27'
                                }}>
                                {msg.status === 'unread' && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                                )}

                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <img src={msg.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                                        <span className="text-sm font-semibold text-white">{msg.author.name}</span>
                                    </div>
                                    <span className="text-[10px]" style={{ color: '#5a5a7a' }}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                                        style={{ background: `${PLATFORM_COLORS[msg.platform]}15`, color: PLATFORM_COLORS[msg.platform] }}>
                                        {PLATFORM_LABELS[msg.platform]}
                                    </span>
                                    <span className="text-[10px]" style={{ color: '#4a4a6a' }}>
                                        {msg.type === 'dm' ? 'Direct Message' : 'Comment'}
                                    </span>
                                </div>

                                <p className="text-xs line-clamp-2" style={{ color: msg.status === 'unread' ? '#e2e2f0' : '#8a8aaa' }}>
                                    {msg.content}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Detail */}
                <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-[#0d0d14]">
                    {selectedMsg ? (
                        <>
                            {/* Message Header */}
                            <div className="p-5 flex items-start justify-between" style={{ borderBottom: '1px solid #1a1a27' }}>
                                <div className="flex items-center gap-3">
                                    <img src={selectedMsg.author.avatar} alt="" className="w-10 h-10 rounded-xl" />
                                    <div>
                                        <h3 className="font-bold text-white">{selectedMsg.author.name}</h3>
                                        <p className="text-xs" style={{ color: '#5a5a7a' }}>{selectedMsg.author.handle}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-lg text-[#5a5a7a] hover:text-white hover:bg-white/5 transition-colors" title="Mark as resolved">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Message Thread */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {selectedMsg.postPreview && (
                                    <div className="p-3 rounded-lg text-xs" style={{ background: '#13131a', border: '1px solid #2a2a3d' }}>
                                        <p className="font-semibold mb-1" style={{ color: '#8a8aaa' }}>Commenting on post:</p>
                                        <p style={{ color: '#a0a0c0' }}>"{selectedMsg.postPreview}"</p>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <img src={selectedMsg.author.avatar} alt="" className="w-8 h-8 rounded-full shrink-0" />
                                    <div className="flex-1">
                                        <div className="p-4 rounded-2xl rounded-tl-sm inline-block max-w-[85%]" style={{ background: '#1a1a27' }}>
                                            <p className="text-sm text-white">{selectedMsg.content}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 ml-1">
                                            <span className="text-[10px]" style={{ color: '#5a5a7a' }}>
                                                {new Date(selectedMsg.created_at).toLocaleString()}
                                            </span>
                                            <button className="text-[10px] text-[#5a5a7a] hover:text-orange-400 flex items-center gap-1">
                                                <Heart className="w-3 h-3" /> Like
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reply Box */}
                            <div className="p-4" style={{ borderTop: '1px solid #1a1a27', background: '#13131a' }}>
                                <div className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white resize-none outline-none focus:ring-1 focus:ring-orange-500/50"
                                        style={{ background: '#1a1a27', border: '1px solid #2a2a3d', minHeight: '80px' }}
                                    />
                                    <button
                                        disabled={!replyText.trim()}
                                        className="absolute right-2 bottom-2 p-2 rounded-lg text-white transition-all disabled:opacity-50 disabled:bg-transparent"
                                        style={{ background: replyText.trim() ? '#f97316' : 'transparent', color: replyText.trim() ? '#fff' : '#4a4a6a' }}>
                                        <Reply className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between mt-2 px-1">
                                    <p className="text-[10px]" style={{ color: '#5a5a7a' }}>Replying as Ember Automations</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#5a5a7a]">
                            <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a message to read and reply</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
