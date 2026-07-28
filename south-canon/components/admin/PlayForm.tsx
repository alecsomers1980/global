'use client'

import { useActionState } from 'react'
import { RepeaterField } from './RepeaterField'
import { savePlay, type PlayFormState } from '@/app/admin/plays/actions'
import { TERRITORIES } from '@/lib/types'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function PlayForm({
  play,
  playwrights,
}: {
  play: any | null
  playwrights: { id: string; name: string }[]
}) {
  const [state, action, pending] = useActionState<PlayFormState, FormData>(savePlay, null)
  const field = 'border-b border-rule bg-transparent py-2 outline-none focus:border-accent'
  const area = 'border border-rule bg-transparent p-3 outline-none focus:border-accent'

  return (
    <form action={action} className="mt-10 grid max-w-3xl gap-6">
      {play && <input type="hidden" name="id" value={play.id} />}

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Title</span>
        <input name="title" required defaultValue={play?.title ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Slug (leave blank to generate)</span>
        <input name="slug" defaultValue={play?.slug ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Playwrights</span>
        <select
          name="playwrightIds"
          multiple
          size={4}
          defaultValue={(play?.play_playwrights ?? []).map((c: any) => c.playwright_id)}
          className="border border-rule bg-transparent p-2 outline-none focus:border-accent"
        >
          {playwrights.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Logline</span>
        <input name="logline" defaultValue={play?.logline ?? ''} className={field} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Short synopsis</span>
        <textarea name="synopsisShort" rows={4} defaultValue={play?.synopsis_short ?? ''} className={area} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Full synopsis</span>
        <textarea name="synopsisFull" rows={10} defaultValue={play?.synopsis_full ?? ''} className={area} />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Genres (comma separated)</span>
          <input name="genres" defaultValue={(play?.genres ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Themes (comma separated)</span>
          <input name="themes" defaultValue={(play?.themes ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Languages (comma separated)</span>
          <input name="languages" defaultValue={(play?.languages ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Content warnings (comma separated)</span>
          <input name="contentWarnings" defaultValue={(play?.content_warnings ?? []).join(', ')} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Year written</span>
          <input name="yearWritten" type="number" defaultValue={play?.year_written ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Duration (minutes)</span>
          <input name="durationMin" type="number" defaultValue={play?.duration_min ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Acts</span>
          <input name="acts" type="number" defaultValue={play?.acts ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Target audience</span>
          <input name="targetAudience" defaultValue={play?.target_audience ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Setting</span>
          <input name="setting" defaultValue={play?.setting ?? ''} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Time period</span>
          <input name="timePeriod" defaultValue={play?.time_period ?? ''} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Hero image URL</span>
        <input name="heroImageUrl" defaultValue={play?.hero_image_url ?? ''} className={field} />
      </label>

      <RepeaterField
        name="roles"
        label="Cast"
        hint='[{"name":"Vince","gender":"male","age_range":"30s","description":"","is_ensemble":false,"sort":0}]'
        defaultValue={play?.play_roles ?? []}
      />
      <RepeaterField
        name="rights"
        label="Rights and availability"
        hint={`territory must be one of: ${TERRITORIES.join(', ')}. [{"territory":"South Africa","tier_id":"amateur","status":"available","restriction_note":null}]`}
        defaultValue={play?.rights_availability ?? []}
      />
      <RepeaterField
        name="productions"
        label="Production history"
        hint='[{"company":"Market Theatre","venue":"","city":"Johannesburg","country":"South Africa","starts_on":"1982-06-01","ends_on":null,"director":"","notes":null,"is_premiere":true}]'
        defaultValue={play?.play_productions ?? []}
      />
      <RepeaterField
        name="press"
        label="Press quotes"
        hint='[{"quote":"Absolutely superb.","source":"Mail & Guardian","published_at":null,"sort":0}]'
        defaultValue={play?.play_press ?? []}
      />
      <RepeaterField
        name="media"
        label="Media"
        hint='[{"type":"photo","url":"https://...","caption":"","credit":"","sort":0}]'
        defaultValue={play?.play_media ?? []}
      />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isMusical" defaultChecked={play?.is_musical ?? false} />
        This is a musical
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-muted">Status</span>
        <select name="status" defaultValue={play?.status ?? 'draft'} className={field}>
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