'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client-browser'

const REMEMBER_KEY = 'ember_remembered_email'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [remember, setRemember] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [resetting, setResetting] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(REMEMBER_KEY)
        if (saved) {
            setEmail(saved)
            setRemember(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

        if (signInError) {
            setLoading(false)
            setError('Invalid email or password.')
            return
        }

        if (remember) localStorage.setItem(REMEMBER_KEY, email)
        else localStorage.removeItem(REMEMBER_KEY)

        router.push('/dashboard')
        router.refresh()
    }

    const handleForgot = async () => {
        setError('')
        setMessage('')
        if (!email) {
            setError('Enter your email above, then click “Forgot password?”.')
            return
        }
        setResetting(true)
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })
        setResetting(false)
        if (resetError) setError('Could not send the reset email. Please try again.')
        else setMessage(`Password reset link sent to ${email}. Check your inbox.`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-[#e2e2f0] px-6" style={{ fontFamily: 'var(--font-sans)' }}>
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center gap-3">
                    <img src="/images/ember-logo.png" alt="Ember Automations" className="h-20 w-auto" />
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-white">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl px-3 py-2 pr-10 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-orange-500"
                            />
                            Remember me
                        </label>
                        <button
                            type="button"
                            onClick={handleForgot}
                            disabled={resetting}
                            className="text-sm text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-60"
                        >
                            {resetting ? 'Sending…' : 'Forgot password?'}
                        </button>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {message && <p className="text-sm text-green-400">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                    >
                        {loading ? 'Signing in…' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    )
}
