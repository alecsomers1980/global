import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'
import { PlaywrightForm } from '@/components/admin/PlaywrightForm'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deletePlaywright } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditPlaywright({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  const db = createServiceClient()
  const w = isNew
    ? null
    : (await db.from('playwrights').select('*').eq('id', id).maybeSingle()).data

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">{isNew ? 'Add playwright' : w?.name}</h1>
      <PlaywrightForm playwright={isNew ? null : { ...w, id }} />

      {!isNew && (
        <form action={deletePlaywright} className="mt-10">
          <input type="hidden" name="id" value={id} />
          <DeleteButton
            label="Delete this playwright"
            confirmMessage={`Delete "${w?.name}"? This cannot be undone.`}
          />
        </form>
      )}
    </Container>
  )
}