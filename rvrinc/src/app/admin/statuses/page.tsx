import { createClient } from '@/lib/supabase/adminServer'
import StatusManager from '@/components/admin/StatusManager'

export default async function StatusesPage() {
  const supabase = createClient()
  const { data: rows } = await supabase
    .from('case_statuses')
    .select('*')
    .order('phase')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Case Statuses</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add, edit, or remove the status options available for cases.
        </p>
      </div>
      <StatusManager statuses={rows || []} />
    </div>
  )
}
