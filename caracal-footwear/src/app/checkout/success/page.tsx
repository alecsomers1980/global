import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatZAR } from '@/lib/money';
import ClearCartOnMount from '@/components/checkout/ClearCartOnMount';

export const metadata: Metadata = { title: 'Order Confirmation' };

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await props.searchParams;

  if (!orderNumber) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-text">We couldn&apos;t find that order.</p>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('order_number, status, total, email')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-text">We couldn&apos;t find that order.</p>
      </div>
    );
  }

  if (order.status === 'paid' || order.status === 'fulfilled') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <ClearCartOnMount />
        <h1 className="display text-3xl text-text">THANK YOU</h1>
        <p className="text-text">
          Order <span className="text-accent">{order.order_number}</span> confirmed —{' '}
          {formatZAR(order.total)}.
        </p>
        <p className="text-sm text-muted">
          A confirmation has been sent to {order.email}. Your vellies will be made to order
          and shipped within the lead time shown at checkout.
        </p>
      </div>
    );
  }

  if (order.status === 'stock_conflict') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <h1 className="display text-3xl text-text">WE NEED TO TALK TO YOU</h1>
        <p className="text-text">
          Payment for order <span className="text-accent">{order.order_number}</span> went
          through, but one or more items sold out at the same moment. We have not shipped
          anything, and we&apos;ll be in touch by email to sort out a replacement or a refund.
        </p>
      </div>
    );
  }

  if (order.status === 'failed' || order.status === 'cancelled') {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <h1 className="display text-3xl text-text">PAYMENT NOT COMPLETED</h1>
        <p className="text-text">
          Order <span className="text-accent">{order.order_number}</span> was not paid. Your
          cart has been left untouched — you can try again.
        </p>
      </div>
    );
  }

  // status === 'pending': the browser beat the ITN here, which is normal and
  // usually resolves within a few seconds. No client JS/polling library --
  // a plain meta-refresh is enough for an edge case this narrow.
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
      <meta httpEquiv="refresh" content="4" />
      <h1 className="display text-3xl text-text">CONFIRMING YOUR PAYMENT</h1>
      <p className="text-text">
        Order <span className="text-accent">{order.order_number}</span> — this usually takes
        a few seconds. This page will refresh automatically.
      </p>
    </div>
  );
}
