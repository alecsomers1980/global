import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'
import { savePlaywright, deletePlaywright } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditPlaywright({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  const db = createServiceClient()
  const w = isNew
    ? null
    : (await db.from('playwrights').select('*').eq('id', id).maybeSingle()).data

  const field = 'border-b border-rule bg-transparent py-2 outline-none focus:border-accent'

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">{isNew ? 'Add playwright' : w?.name}</h1>
      <form action={savePlaywright} className="mt-10 grid max-w-2xl gap-6">
        {!isNew && <input type="hidden" name="id" value={id} />}
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
          <textarea name="bio" rows={8} defaultValue={w?.bio ?? ''} className="border border-rule bg-transparent p-3 outline-none focus:border-accent" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted">Status</span>
          <select name="status" defaultValue={w?.status ?? 'draft'} className={field}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button type="submit" className="justify-self-start bg-accent px-8 py-3 text-sm uppercase tracking-wide text-paper">
          Save
        </button>
      </form>

      {!isNew && (
        <form action={deletePlaywright} className="mt-10">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-restricted hover:underline">
            Delete this playwright
          </button>
        </form>
      )}
    </Container>
  )
}