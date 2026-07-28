'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { submitEnquiry, type ContactState } from './actions'

export default function ContactPage() {
  const params = useSearchParams()
  const [startedAt] = useState(() => Date.now())
  const [state, action, pending] = useActionState<ContactState, FormData>(submitEnquiry, null)

  const play = params.get('play') ?? ''
  const intent = params.get('intent') ?? ''

  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Contact</h1>
      <p className="mt-4 max-w-2xl text-muted">
        {intent === 'perusal'
          ? 'Tell us about your production and we will send a perusal script.'
          : intent === 'licence'
            ? 'Tell us about your production and we will come back with a licence quotation.'
            : 'Producers, writers and press — we would like to hear from you.'}
      </p>

      <form action={action} className="mt-10 grid max-w-xl gap-6">
        <input type="hidden" name="startedAt" value={startedAt} />
        <input type="hidden" name="play" value={play} />
        <input type="hidden" name="intent" value={intent} />
        <div aria-hidden className="absolute left-[-9999px]">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Your name</span>
          <input
            name="name"
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Message</span>
          <textarea
            name="message"
            rows={6}
            required
            className="border-b border-rule bg-transparent py-2 outline-none focus:border-accent"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Send'}
        </button>

        {state && (
          <p className={state.ok ? 'text-available' : 'text-restricted'}>{state.message}</p>
        )}
      </form>

      <p className="mt-8 max-w-xl text-xs text-muted">
        We use your details only to respond to this enquiry, in line with POPIA. We do not share
        them with third parties.
      </p>
    </Container>
  )
}
