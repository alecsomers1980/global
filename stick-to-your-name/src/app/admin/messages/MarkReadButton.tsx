'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const markRead = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error('Failed to mark as read');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={markRead}
      disabled={saving}
      className="text-xs text-brand-teal hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? 'Saving…' : 'Mark as read'}
    </button>
  );
}