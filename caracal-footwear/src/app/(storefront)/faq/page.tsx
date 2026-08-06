import { getSiteSettings } from '@/lib/queries/products';
import { formatZAR } from '@/lib/money';
import Link from 'next/link';

export default async function FAQPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <h1 className="display text-4xl md:text-5xl text-text">
        Frequently Asked Questions
      </h1>

      <h2 className="text-lg text-text mt-8 mb-2">What sizes do you make?</h2>
      <p className="text-muted">
        4 (ladies) to 15 (mens). No order is too small — see our full{' '}
        <Link href="/size-guide" className="text-text underline hover:no-underline">
          Size Guide
        </Link>
        .
      </p>

      <h2 className="text-lg text-text mt-8 mb-2">What are they made of?</h2>
      <p className="text-muted">
        Genuine leather on a non-slip TPR sole, handmade to order.
      </p>

      <h2 className="text-lg text-text mt-8 mb-2">How long does delivery take?</h2>
      <p className="text-muted">
        {`Made to order in ${settings.lead_time}, then delivered countrywide by courier.`}
      </p>

      <h2 className="text-lg text-text mt-8 mb-2">Is delivery free?</h2>
      <p className="text-muted">
        {`Yes, on orders over ${formatZAR(Number(settings.delivery_free_threshold))}. Below that, delivery is a flat ${formatZAR(Number(settings.delivery_fee))}.`}
      </p>

      <h2 className="text-lg text-text mt-8 mb-2">Can I return or exchange a pair?</h2>
      <p className="text-muted">
        Yes — see our{' '}
        <Link href="/shipping-returns" className="text-text underline hover:no-underline">
          Shipping &amp; Returns
        </Link>{' '}
        page for the full policy.
      </p>

      <h2 className="text-lg text-text mt-8 mb-2">Do you have decorated or patterned vellies?</h2>
      <p className="text-muted">
        Yes — our{' '}
        <Link href="/signature" className="text-text underline hover:no-underline">
          Signature Collection
        </Link>{' '}
        has wildlife, game hide and floral panel designs, each a one-off in this market.
      </p>
    </div>
  );
}