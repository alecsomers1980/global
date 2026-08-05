import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/queries/products';
import CartView from '@/components/cart/CartView';

export const metadata: Metadata = {
  title: 'Your Cart',
};

export default async function CartPage() {
  const settings = await getSiteSettings();
  const deliverySettings = {
    freeThreshold: Number(settings.delivery_free_threshold),
    fee: Number(settings.delivery_fee),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <h1 className="display rule-accent text-4xl sm:text-6xl mb-10">
        CART
      </h1>
      <CartView deliverySettings={deliverySettings} />
    </div>
  );
}