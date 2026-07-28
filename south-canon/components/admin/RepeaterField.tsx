'use client'

import { useState } from 'react'

/**
 * Renders a JSON textarea for a repeating child collection.
 * Deliberately simple: the client edits a small JSON array rather than a bespoke
 * drag-and-drop builder. Revisit if the client finds it awkward in practice.
 */
export function RepeaterField({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string
  label: string
  hint: string
  defaultValue: unknown[]
}) {
  const [value, setValue] = useState(JSON.stringify(defaultValue ?? [], null, 2))
  const [error, setError] = useState<string | null>(null)

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
      <span className="text-xs text-muted">{hint}</span>
      <textarea
        name={name}
        rows={8}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          try {
            JSON.parse(e.target.value)
            setError(null)
          } catch {
            setError('Not valid JSON yet')
          }
        }}
        className="border border-rule bg-transparent p-3 font-mono text-xs outline-none focus:border-accent"
      />
      {error && <span className="text-xs text-restricted">{error}</span>}
    </label>
  )
}