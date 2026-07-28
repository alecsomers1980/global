'use client'

import { useActionState } from 'react'
import { savePlaywright, type PlaywrightFormState } from '@/app/admin/playwrights/actions'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function PlaywrightForm({ playwright: w }: { playwright: any | null }) {
  const [state, action, pending] = useActionState<PlaywrightFormState, FormData>(savePlaywright, null)
  const field = 'border-b border-rule bg-transparent py-2 outline-none focus:border-accent'

  return (
    <form action={action} className="mt-10 grid max-w-2xl gap-6">
      {w && <input type="hidden" name="id" value={w.id} />}
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Name</span>
        <input name="name" required defaultValue={w?.name ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Slug (leave blank to generate)</span>
        <input name="slug" defaultValue={w?.slug ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Country</span>
        <input name="country" defaultValue={w?.country ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Honours (comma separated)</span>
        <input name="honours" defaultValue={(w?.honours ?? []).join(', ')} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Portrait URL</span>
        <input name="portraitUrl" defaultValue={w?.portrait_url ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Biography</span>
        <textarea
          name="bio"
          rows={8}
          defaultValue={w?.bio ?? ''}
          className="border border-rule bg-transparent p-3 outline-none focus:border-accent"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Status</span>
        <select name="status" defaultValue={w?.status ?? 'draft'} className={field}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save'}
      </button>

      {state?.error && <p className="text-restricted">{state.error}</p>}
    </form>
  )
}
