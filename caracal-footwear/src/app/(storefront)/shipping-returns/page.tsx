import { getSiteSettings } from '@/lib/queries/products';
import { formatZAR } from '@/lib/money';
import Link from 'next/link';

export default async function ShippingReturnsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <h1 className="display text-4xl md:text-5xl text-text">
        Shipping & Returns
      </h1>

      <h2 className="text-xl text-text mt-10 mb-3">Shipping</h2>
      <p className="text-muted">
        {`We deliver countrywide across South Africa. Every pair is made to order, with a lead time of ${settings.lead_time} before it ships. Delivery is free on orders over ${formatZAR(Number(settings.delivery_free_threshold))}; below that, a flat ${formatZAR(Number(settings.delivery_fee))} delivery fee applies at checkout.`}
      </p>

      <h2 className="text-xl text-text mt-10 mb-3">Returns & Exchanges</h2>
      <p className="text-muted">
        If a pair doesn&apos;t fit or isn&apos;t right, contact us within 7 days
        of delivery to arrange a return or exchange. Items must be unworn, unused,
        and in their original packaging. WhatsApp or email us first — see our{' '}
        <Link href="/contact" className="text-text underline hover:no-underline">
          Contact
        </Link>{' '}
        page — and we&apos;ll confirm the process before you send anything back.
      </p>
    </div>
  );
}