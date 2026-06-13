'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Bold, Italic, Underline, Link2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minRows?: number
  className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, minRows = 4, className }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(!value)

  useEffect(() => {
    const el = editorRef.current
    if (el && el.innerHTML !== value) {
      el.innerHTML = value || ''
      setIsEmpty(!value)
    }
  }, [value])

  const exec = useCallback((cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg)
    editorRef.current?.focus()
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
  }, [onChange])

  const handleLink = useCallback(() => {
    const url = window.prompt('Enter URL:', 'https://')
    if (url) exec('createLink', url)
  }, [exec])

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || ''
    setIsEmpty(html === '' || html === '<br>')
    onChange(html)
  }, [onChange])

  const minHeight = `${minRows * 28}px`

  return (
    <div className={`border border-input rounded-xl overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${className ?? ''}`}>
      <div className="flex items-center gap-1 px-3 py-2 border-b border-input bg-muted/40">
        <button
          type="button"
          onClick={() => exec('bold')}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('italic')}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => exec('underline')}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Add Link"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="absolute top-2.5 left-3 text-sm text-muted-foreground pointer-events-none select-none">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="px-3 py-2.5 text-sm focus:outline-none leading-relaxed text-foreground"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}
