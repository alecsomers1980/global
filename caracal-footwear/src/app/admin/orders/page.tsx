import { createAdminClient } from '@/lib/supabase/admin';
import { formatZAR } from '@/lib/money';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Orders' };

const statusClasses: Record<string, string> = {
  pending: 'bg-accent/20 text-accent',
  paid: 'bg-accent text-canvas',
  fulfilled: 'bg-accent text-canvas',
  cancelled: 'bg-text/10 text-muted',
  failed: 'bg-text/10 text-muted',
  stock_conflict: 'bg-accent text-canvas border border-accent',
};

async function OrdersPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from('orders')
    .select('id, order_number, customer_name, status, total, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="display text-3xl text-text mb-6">ORDERS</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-text/20">
                <th className="py-2 pr-4 text-sm font-medium text-muted">Order #</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Customer</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Status</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Total</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = order.status ?? 'pending';
                const badgeClass = statusClasses[status] ?? 'bg-text/10 text-muted';
                const badgeText =
                  status === 'stock_conflict' ? '⚠ Stock Conflict' : status;
                return (
                  <tr key={order.id} className="border-b border-text/10">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-accent hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-text">{order.customer_name}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-text">
                      {formatZAR(order.total)}
                    </td>
                    <td className="py-2 pr-4 text-text">
                      {new Date(order.created_at).toLocaleDateString('en-ZA')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;