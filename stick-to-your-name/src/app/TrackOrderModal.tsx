'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Clock, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';

interface TrackResult {
  status: string;
  design_name: string;
  child_name: string;
  created_at: string;
  paid_at?: string;
  status_updated_at?: string;
}

export default function TrackOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  useEffect(() => {
    if (open) {
      setOrderId('');
      setEmail('');
      setError('');
      setResult(null);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setResult(data as TrackResult);
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const statusFriendly: Record<string, string> = {
    pending: 'Waiting for payment',
    paid: 'Paid — in the queue',
    printing: 'We are printing your labels',
    shipped: 'On its way to you',
    completed: 'Completed',
    cancelled: 'This order did not go through',
    failed: 'This order did not go through',
  };

  const stepStatuses = ['paid', 'printing', 'shipped', 'completed'] as const;
  const stepIcons = [Clock, Package, Truck, CheckCircle];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl shadow-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Track your order</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="track-order-id" className="block text-sm font-medium text-gray-700 mb-1">
              Order number
            </label>
            <input
              id="track-order-id"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-12345678"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="track-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="track-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-pink text-white font-semibold py-3 rounded-xl hover:bg-pink-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Checking...
              </>
            ) : (
              'Check status'
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 border-t pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Order Status</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  result.status === 'cancelled' || result.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : result.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : result.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {statusFriendly[result.status] || result.status}
              </span>
            </div>

            <p className="text-sm text-gray-700">
              {statusFriendly[result.status] || result.status}
            </p>

            <div className="mt-3 text-sm text-gray-600 space-y-1">
              {result.child_name && (
                <p>
                  <span className="font-medium">For:</span> {result.child_name}
                </p>
              )}
              {result.design_name && (
                <p>
                  <span className="font-medium">Design:</span> {result.design_name}
                </p>
              )}
              {result.created_at && (
                <p>
                  <span className="font-medium">Ordered:</span>{' '}
                  {new Date(result.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {stepStatuses.includes(result.status as any) && (
              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700 mb-2">Progress</p>
                <div className="flex items-center justify-between">
                  {stepStatuses.map((step, idx) => {
                    const isActive = result.status === step;
                    const isPast =
                      stepStatuses.indexOf(result.status as typeof stepStatuses[number]) > idx;
                    const Icon = stepIcons[idx];
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive
                              ? 'bg-brand-teal text-white'
                              : isPast
                              ? 'bg-brand-teal/30 text-brand-teal'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        {idx < stepStatuses.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-1 ${
                              isPast ? 'bg-brand-teal' : 'bg-gray-300'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Paid</span>
                  <span>Printing</span>
                  <span>Shipped</span>
                  <span>Completed</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}