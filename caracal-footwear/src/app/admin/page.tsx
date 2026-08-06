import { createAdminClient } from '@/lib/supabase/admin';
import { formatZAR } from '@/lib/money';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orders';
import Link from 'next/link';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const admin = createAdminClient();

  const { data: orders } = await admin.from('orders').select('status, total, created_at');
  const allOrders = orders ?? [];

  const counts = allOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueThisMonth = allOrders
    .filter((o) => o.status === 'paid' || o.status === 'fulfilled')
    .filter((o) => new Date(o.created_at) >= monthStart)
    .reduce((sum, o) => sum + o.total, 0);

  const { data: lowStock } = await admin
    .from('product_variants')
    .select('id, colour_name, size, stock_qty, product:products(name)')
    .eq('active', true)
    .gt('stock_qty', 0)
    .lte('stock_qty', 3)
    .order('stock_qty');

  const statuses: OrderStatus[] = ['pending', 'paid', 'stock_conflict', 'fulfilled', 'failed', 'cancelled'];

  return (
    <div className="space-y-8">
      <h1 className="display text-3xl text-text">DASHBOARD</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statuses.map((s) => (
          <div key={s} className="bg-surface rounded-lg p-4">
            <p className="text-xs text-muted uppercase tracking-wide">{ORDER_STATUS_LABELS[s]}</p>
            <p className="text-2xl text-text mt-1">{counts[s] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-lg p-4">
        <p className="text-xs text-muted uppercase tracking-wide">Revenue this month</p>
        <p className="text-2xl text-text mt-1">{formatZAR(revenueThisMonth)}</p>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wide text-muted mb-3">Low stock (1-3 remaining)</h2>
        {lowStock && lowStock.length > 0 ? (
          <ul className="bg-surface rounded-lg divide-y divide-text/10">
            {lowStock.map((v) => {
              const product = v.product as unknown as { name: string } | null;
              return (
                <li key={v.id} className="px-4 py-2 text-sm text-text flex justify-between">
                  <span>
                    {product?.name ?? 'Unknown'} — {v.colour_name}, size {v.size}
                  </span>
                  <span className="text-accent">{v.stock_qty} left</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nothing low on stock.</p>
        )}
      </div>

      <Link href="/admin/products" className="text-sm text-text underline underline-offset-4">
        Manage products →
      </Link>
    </div>
  );
}
