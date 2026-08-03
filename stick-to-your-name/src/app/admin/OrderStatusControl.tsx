'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type Status = 'pending' | 'paid' | 'printing' | 'shipped' | 'completed' | 'cancelled' | 'failed';

const STATUS_LABELS: Record<Status, string> = {
  pending: 'Pending',
  paid: 'Paid',
  printing: 'Printing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

interface Props {
  orderId: string;
  current: string;
}

export default function OrderStatusControl({ orderId, current }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(current);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (saving) return;
    const newStatus = e.target.value;
    setError(null);
    setSaving(true);
    setStatus(newStatus);
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || 'Failed to update status');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update');
      setStatus(current); // revert
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className="rounded-lg border border-gray-300 text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent disabled:opacity-50"
      >
        {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {saving && (
        <span className="text-xs text-gray-500 inline-flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </span>
      )}
      {error && !saving && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}