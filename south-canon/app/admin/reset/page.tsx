'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { Container } from '@/components/ui/Container'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setPending(false)
    if (error) return setError(error.message)
    router.push('/admin')
    router.refresh()
  }

  return (
    <Container className="py-24">
      <h1 className="font-display text-4xl">Set a new password</h1>
      <p className="mt-4 max-w-sm text-muted">
        Enter a new password for your account. Following the link from your email confirms it&rsquo;s you.
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid max-w-sm gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Set password'}
        </button>

        {error && <p className="text-restricted">{error}</p>}
      </form>
    </Container>
  )
}
