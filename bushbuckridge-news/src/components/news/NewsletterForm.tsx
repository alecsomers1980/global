'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const params = useParams<{ site: string }>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim(), site_id: params.site });
    setStatus(error && error.code !== '23505' ? 'error' : 'done');
  }

  if (status === 'done') {
    return <p className="text-sm font-medium">You&apos;re signed up. Thanks.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Your email address"
        className="px-3 py-2.5 text-sm bg-white border border-[var(--color-hairline)] focus:outline-none focus:border-[var(--brand-accent)]"
      />
      <button
        type="submit"
        disabled={status === 'saving'}
        className="py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {status === 'saving' ? 'Signing up…' : 'Sign Up'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-[var(--brand-accent)]">
          That didn&apos;t save. Please try again.
        </p>
      )}
    </form>
  );
}