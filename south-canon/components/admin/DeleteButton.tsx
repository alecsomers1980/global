'use client'

export function DeleteButton({ label, confirmMessage }: { label: string; confirmMessage: string }) {
  return (
    <button
      type="submit"
      className="text-sm text-restricted hover:underline"
      onClick={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      {label}
    </button>
  )
}
