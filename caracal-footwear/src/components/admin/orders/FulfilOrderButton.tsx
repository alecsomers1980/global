'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function FulfilOrderButton({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (currentStatus === 'fulfilled') {
    return <p className="text-sm text-muted">Fulfilled.</p>;
  }

  if (currentStatus !== 'paid') {
    return <p className="text-sm text-muted">Only a paid order can be marked fulfilled.</p>;
  }

  const handleFulfil = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'fulfilled' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to update order status');
      }
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update order status'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleFulfil}
        disabled={loading}
        className="bg-accent text-canvas px-4 py-2 rounded hover:bg-accent-hi disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Marking…' : 'Mark fulfilled'}
      </button>
      {errorMessage && <p className="text-accent text-sm mt-2">{errorMessage}</p>}
    </div>
  );
}