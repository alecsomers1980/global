import { getSiteSettings } from '@/lib/queries/products';

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <h1 className="display text-4xl md:text-5xl text-text">Terms & Conditions</h1>

      <p className="text-xs text-muted border border-text/10 rounded-md px-4 py-3 mt-6">
        Caracal Footwear&apos;s company registration number will be added here once confirmed.
      </p>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Orders & Pricing</h2>
        <p className="text-muted">
          All prices are shown in South African Rand (ZAR) and include VAT where applicable.
          We reserve the right to correct pricing errors before an order is confirmed as
          paid.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Payment</h2>
        <p className="text-muted">
          Payment is processed securely via PayFast. Your order is confirmed once payment is
          verified.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Made to Order</h2>
        <p className="text-muted">
          {`Every pair is handmade to order, with a lead time of ${settings.lead_time} before dispatch.`}
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Delivery</h2>
        <p className="text-muted">
          We deliver countrywide within South Africa only. See our Shipping & Returns page
          for full details.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Returns</h2>
        <p className="text-muted">
          See our Shipping & Returns page for our return and exchange policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Governing Law</h2>
        <p className="text-muted">
          These terms are governed by the laws of the Republic of South Africa.
        </p>
      </section>
    </div>
  );
}