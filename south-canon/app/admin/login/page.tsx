'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Container } from '@/components/ui/Container'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    })
    setPending(false)
    if (error) return setError(error.message)
    router.push('/admin')
    router.refresh()
  }

  async function onForgotPassword(email: string) {
    if (!email) return setError('Enter your email address first.')
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset`,
    })
    setNotice('If that address has an account, a reset link is on its way.')
  }

  return (
    <Container className="py-24">
      <h1 className="font-display text-4xl">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-8 grid max-w-sm gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Password</span>
          <div className="flex items-center gap-2 border-b border-rule focus-within:border-accent">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="flex-1 bg-transparent py-2 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-xs uppercase tracking-wide text-muted hover:text-accent"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="remember" defaultChecked />
          Keep me signed in
        </label>

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper disabled:opacity-50"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() =>
            onForgotPassword((document.getElementById('email') as HTMLInputElement)?.value ?? '')
          }
          className="justify-self-start text-sm text-accent hover:underline"
        >
          Forgot your password?
        </button>

        {error && <p className="text-restricted">{error}</p>}
        {notice && <p className="text-available">{notice}</p>}
      </form>
    </Container>
  )
}