'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X } from 'lucide-react'

interface ImageUploadFieldProps {
  label: string
  multiple?: boolean
  maxFiles?: number
  existing?: string[]
  onRemoveExisting?: (url: string) => void
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
  hint?: string
}

export default function ImageUploadField({
  label,
  multiple = false,
  maxFiles = 1,
  existing = [],
  onRemoveExisting,
  files,
  onFilesChange,
  disabled = false,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [objectUrls, setObjectUrls] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setObjectUrls(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : []
    if (!selected.length) return

    if (multiple) {
      const combined = [...files, ...selected]
      const limit = Math.max(0, maxFiles - existing.length)
      onFilesChange(combined.slice(0, limit))
    } else {
      onFilesChange([selected[0]])
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  const total = existing.length + files.length

  return (
    <div className="space-y-2">
      {label && (
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary/60 ml-1">
            {label}
          </p>
          {hint && (
            <p className="text-xs text-muted-foreground ml-1">{hint}</p>
          )}
        </div>
      )}

      <label
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors text-muted-foreground ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <Upload className="h-6 w-6" />
        <span className="text-sm font-medium">
          Click to upload image{multiple ? 's' : ''}
        </span>
        {!disabled && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            disabled={multiple && total >= maxFiles}
            onChange={handleChange}
            className="hidden"
          />
        )}
      </label>

      {total > 0 && (
        <div className="flex flex-wrap gap-3">
          {existing.map((url, i) => (
            <div key={`existing-${i}`} className="relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-xl object-cover border border-primary/10"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          {objectUrls.map((url, i) => (
            <div key={`file-${i}`} className="relative h-20 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-xl object-cover border border-primary/10"
              />
              <button
                type="button"
                onClick={() =>
                  onFilesChange(files.filter((_, idx) => idx !== i))
                }
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
