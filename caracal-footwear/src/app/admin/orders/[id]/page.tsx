import { createAdminClient } from '@/lib/supabase/admin';
import { formatZAR } from '@/lib/money';
import { notFound } from 'next/navigation';
import FulfilOrderButton from '@/components/admin/orders/FulfilOrderButton';

const statusClasses: Record<string, string> = {
  pending: 'bg-accent/20 text-accent',
  paid: 'bg-accent text-canvas',
  fulfilled: 'bg-accent text-canvas',
  cancelled: 'bg-text/10 text-muted',
  failed: 'bg-text/10 text-muted',
  stock_conflict: 'bg-accent text-canvas border border-accent',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError || !order) {
    notFound();
  }

  const { data: items } = await admin
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  const status = order.status ?? 'pending';
  const badgeClass = statusClasses[status] ?? 'bg-text/10 text-muted';
  const badgeText = status === 'stock_conflict' ? '⚠ Stock Conflict' : status;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-3xl text-text">Order {order.order_number}</h1>
        <div className="mt-2">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${badgeClass}`}>
            {badgeText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold text-text mb-2">Customer</h2>
          <p className="text-text">{order.customer_name}</p>
          {order.email && <p className="text-muted">{order.email}</p>}
          {order.phone && <p className="text-muted">{order.phone}</p>}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text mb-2">Delivery Address</h2>
          <p className="text-text">{order.address_line1}</p>
          {order.address_line2 && <p className="text-text">{order.address_line2}</p>}
          <p className="text-text">
            {order.city}
            {order.province ? `, ${order.province}` : ''}{' '}
            {order.postal_code}
          </p>
        </section>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-text mb-2">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-text/20">
                <th className="py-2 pr-4 text-sm font-medium text-muted">Product</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Colour</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Size</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Qty</th>
                <th className="py-2 pr-4 text-sm font-medium text-muted">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id} className="border-b border-text/10">
                  <td className="py-2 pr-4 text-text">{item.product_name}</td>
                  <td className="py-2 pr-4 text-text">{item.colour}</td>
                  <td className="py-2 pr-4 text-text">{item.size}</td>
                  <td className="py-2 pr-4 text-text">{item.qty}</td>
                  <td className="py-2 pr-4 text-text">
                    {formatZAR(item.unit_price * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-text/10 pt-4 space-y-1">
        <div className="flex justify-between text-text">
          <span>Subtotal</span>
          <span>{formatZAR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-text">
          <span>Delivery</span>
          <span>{formatZAR(order.delivery_fee)}</span>
        </div>
        <div className="flex justify-between text-text font-bold">
          <span>Total</span>
          <span>{formatZAR(order.total)}</span>
        </div>
      </section>

      <FulfilOrderButton orderId={order.id} currentStatus={order.status} />
    </div>
  );
}