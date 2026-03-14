'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client-browser'
import { useRouter } from 'next/navigation'
import { Flame, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(249,115,22,0.08) 0%, #0a0a0f 60%)' }}>

            {/* Background glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
                style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-5 blur-3xl"
                style={{ background: 'radial-gradient(circle, #fb923c, transparent)' }} />

            <div className="relative w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ember-glow"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        <Flame className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Ember Social</h1>
                    <p className="text-sm" style={{ color: '#6b6b8f' }}>AI-Powered Social Media Automation</p>
                </div>

                {/* Login card */}
                <div className="glass-card p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-medium" style={{ color: '#9999bb' }}>Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4a4a6a' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@emberautomations.co.za"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
                                    style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium" style={{ color: '#9999bb' }}>Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4a4a6a' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-[#3d3d5a] outline-none transition-all focus:ring-2 focus:ring-orange-500/30"
                                    style={{ background: '#13131a', border: '1px solid #2a2a3d' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2 disabled:opacity-60 hover:shadow-lg hover:shadow-orange-500/20 active:scale-[0.98]"
                            style={{ background: loading ? '#c2410c' : 'linear-gradient(135deg, #f97316, #ea580c)' }}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: '#3d3d5a' }}>
                    Ember Automations © 2026 · For internal team use only
                </p>
            </div>
        </div>
    )
}
