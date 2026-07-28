import { Container } from '@/components/ui/Container'
import { PlayForm } from '@/components/admin/PlayForm'
import { createServiceClient } from '@/lib/supabase/server'
import { deletePlay } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditPlay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  const db = createServiceClient()

  const [playRes, writersRes] = await Promise.all([
    isNew
      ? Promise.resolve({ data: null })
      : db
          .from('plays')
          .select(`*, play_roles(*), play_media(*), play_press(*), play_productions(*),
                   rights_availability(*), play_playwrights(playwright_id)`)
          .eq('id', id)
          .maybeSingle(),
    db.from('playwrights').select('id, name').order('name'),
  ])

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">{isNew ? 'Add play' : playRes.data?.title}</h1>
      <PlayForm play={playRes.data} playwrights={writersRes.data ?? []} />

      {!isNew && (
        <form action={deletePlay} className="mt-10">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-restricted hover:underline">
            Delete this play
          </button>
        </form>
      )}
    </Container>
  )
}