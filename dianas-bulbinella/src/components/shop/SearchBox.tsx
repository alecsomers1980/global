'use client';

import { useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBoxProps {
  initialQ: string;
}

export default function SearchBox({ initialQ }: SearchBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim() || '';
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        defaultValue={initialQ}
        placeholder="Search products..."
        autoFocus
        className="w-full rounded-full border border-line bg-surface px-5 py-3 text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-amber/40 transition-shadow text-sm"
      />
    </form>
  );
}
