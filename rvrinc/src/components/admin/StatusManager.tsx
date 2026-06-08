'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PHASE_CONFIG, type StatusPhase } from '@/lib/statusConfig'
import { saveStatus, deleteStatus } from '@/app/admin/statuses/actions'

interface StatusManagerProps {
  statuses: any[] // raw snake_case rows from DB
}

// Default empty form values for a new status
const defaultNew = () => ({
  id: undefined as number | undefined,
  slug: '',
  label: '',
  phase: '' as string,
  sort_order: 0,
  client_message: '',
  default_note: '',
  requires_note: false,
  requires_date: false,
  requires_client_action: false,
})

export default function StatusManager({ statuses }: StatusManagerProps) {
  const router = useRouter()
  const [editing, setEditing] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [slugManual, setSlugManual] = useState(false)

  const handleAdd = () => {
    setEditing(defaultNew())
    setSlugManual(false)
    setError(null)
  }

  const handleEdit = (row: any) => {
    setEditing({ ...row })
    setSlugManual(true) // assume slug already set by user
    setError(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setError(null)
  }

  const handleSave = () => {
    if (!editing) return
    const payload = {
      id: editing.id,
      slug: editing.slug.trim(),
      label: editing.label.trim(),
      phase: editing.phase,
      sortOrder: editing.sort_order,
      clientMessage: editing.client_message,
      defaultNote: editing.default_note || undefined,
      requiresNote: editing.requires_note,
      requiresDate: editing.requires_date,
      requiresClientAction: editing.requires_client_action,
    }

    startTransition(async () => {
      const result = await saveStatus(payload)
      if (result && 'error' in result) {
        setError(result.error)
      } else {
        setEditing(null)
        router.refresh()
      }
    })
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this status? This action cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteStatus(id)
      if (result && 'error' in result) {
        setError(result.error)
      } else {
        router.refresh()
      }
    })
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    field: string,
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
    setEditing((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value
    setEditing((prev: any) => {
      // Auto-derive slug only when adding a new status and slug hasn't been manually edited
      const newSlug =
        !prev.id && !slugManual
          ? label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_|_$/g, '') // trim leading/trailing underscores
          : prev.slug
      return { ...prev, label, slug: newSlug }
    })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManual(true)
    setEditing((prev: any) => ({ ...prev, slug: e.target.value }))
  }

  // Group statuses by phase in the order defined by PHASE_CONFIG
  const phasesOrder = Object.keys(PHASE_CONFIG) as StatusPhase[]
  const grouped = phasesOrder
    .map((phase) => ({
      phase,
      statuses: statuses.filter((s) => s.phase === phase),
    }))
    .filter((g) => g.statuses.length > 0)

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Status button */}
      <div className="flex justify-end">
        <Button variant="brand" onClick={handleAdd} disabled={isPending}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Status
        </Button>
      </div>

      {/* Edit/Create form card */}
      {editing !== null && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing.id ? 'Edit Status' : 'New Status'}
            </h2>
            <button
              onClick={handleCancel}
              className="rounded-md p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Label
              </label>
              <input
                type="text"
                value={editing.label}
                onChange={handleLabelChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                placeholder="e.g. In Review"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                value={editing.slug}
                onChange={handleSlugChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm font-mono"
                placeholder="automatically derived"
              />
            </div>

            {/* Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phase
              </label>
              <select
                value={editing.phase}
                onChange={(e) => handleChange(e, 'phase')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
              >
                <option value="" disabled>
                  Select a phase
                </option>
                {Object.entries(PHASE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <input
                type="number"
                value={editing.sort_order}
                onChange={(e) =>
                  setEditing((prev: any) => ({
                    ...prev,
                    sort_order: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                min={0}
              />
            </div>

            {/* Client Message */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Client Message
              </label>
              <textarea
                value={editing.client_message}
                onChange={(e) => handleChange(e, 'client_message')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                placeholder="Message shown to the client when status changes"
              />
            </div>

            {/* Default Note */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Default Note (optional)
              </label>
              <textarea
                value={editing.default_note ?? ''}
                onChange={(e) => handleChange(e, 'default_note')}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                placeholder="Pre-filled note template"
              />
            </div>

            {/* Checkboxes */}
            <div className="sm:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.requires_note}
                  onChange={(e) => handleChange(e, 'requires_note')}
                  className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm text-gray-700">Requires Note</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.requires_date}
                  onChange={(e) => handleChange(e, 'requires_date')}
                  className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm text-gray-700">Requires Date</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.requires_client_action}
                  onChange={(e) => handleChange(e, 'requires_client_action')}
                  className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                />
                <span className="text-sm text-gray-700">
                  Requires Client Action
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Status'}
            </Button>
          </div>
        </div>
      )}

      {/* Status list grouped by phase */}
      <div className="space-y-8">
        {grouped.map(({ phase, statuses: phaseStatuses }) => (
          <div key={phase}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  PHASE_CONFIG[phase].bgColor
                } ${PHASE_CONFIG[phase].textColor}`}
              >
                {PHASE_CONFIG[phase].label}
              </span>
              <span className="text-xs text-gray-400">
                {phaseStatuses.length} status
                {phaseStatuses.length > 1 ? 'es' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {phaseStatuses.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-400 w-6 text-right">
                      {row.sort_order}.
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {row.label}
                    </span>
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {row.slug}
                    </code>
                    <div className="flex items-center gap-1.5">
                      {row.requires_note && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          Note
                        </span>
                      )}
                      {row.requires_date && (
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                          Date
                        </span>
                      )}
                      {row.requires_client_action && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          Client Action
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(row)}
                      disabled={isPending}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(row.id)}
                      disabled={isPending}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {statuses.length === 0 && editing === null && (
        <p className="text-center text-gray-500 py-12">
          No statuses defined yet. Click &quot;Add Status&quot; to create one.
        </p>
      )}
    </div>
  )
}
