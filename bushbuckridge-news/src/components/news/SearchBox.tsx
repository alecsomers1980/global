'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="flex items-center">
      {open && (
        <form onSubmit={submit}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stories"
            aria-label="Search stories"
            className="w-40 md:w-56 px-3 py-1.5 text-sm border border-[var(--color-hairline)] focus:outline-none focus:border-[var(--brand-accent)]"
          />
        </form>
      )}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close search' : 'Open search'}
        className="p-2 hover:text-[var(--brand-accent)] transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    </div>
  );
}