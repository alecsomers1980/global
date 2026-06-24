'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client-browser'

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [show, setShow] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        // The /auth/callback route has already exchanged the recovery code for a
        // session cookie — confirm it's present before showing the form.
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) setReady(true)
            else setError('This reset link is invalid or has expired. Request a new one from the login page.')
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        setLoading(true)
        const { error: updateError } = await supabase.auth.updateUser({ password })
        setLoading(false)
        if (updateError) {
            setError(updateError.message || 'Could not update your password.')
            return
        }
        setMessage('Password updated. Redirecting…')
        setTimeout(() => {
            router.push('/dashboard')
            router.refresh()
        }, 1200)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-[#e2e2f0] px-6" style={{ fontFamily: 'var(--font-sans)' }}>
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center gap-3">
                    <img src="/images/ember-logo.png" alt="Ember Automations" className="h-20 w-auto" />
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    <h1 className="text-base font-semibold text-white">Set a new password</h1>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-medium text-white">New password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={show ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!ready}
                                className="w-full rounded-xl px-3 py-2 pr-10 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50 disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={() => setShow((s) => !s)}
                                aria-label={show ? 'Hide password' : 'Show password'}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                            >
                                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="confirm" className="text-sm font-medium text-white">Confirm password</label>
                        <input
                            id="confirm"
                            type={show ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            disabled={!ready}
                            className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50 disabled:opacity-60"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {message && <p className="text-sm text-green-400">{message}</p>}

                    <button
                        type="submit"
                        disabled={loading || !ready}
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                    >
                        {loading ? 'Updating…' : 'Update password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
