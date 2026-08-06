import { getSiteSettings } from '@/lib/queries/products';

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
      <h1 className="display text-4xl md:text-5xl text-text">Privacy Policy</h1>

      <p className="text-xs text-muted border border-text/10 rounded-md px-4 py-3 mt-6">
        Caracal Footwear&apos;s company registration number will be added here once confirmed.
      </p>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Information We Collect</h2>
        <p className="text-muted">
          When you place an order, we collect your name, email, phone number and delivery
          address. When you contact us or submit a review, we collect your name and email.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">How We Use It</h2>
        <p className="text-muted">
          We use your information only to fulfil your order, communicate about it, and
          respond to enquiries. We do not sell or share your information with third parties
          for marketing.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Third-Party Processors</h2>
        <p className="text-muted">
          Payments are processed by PayFast. Order and account data is stored with Supabase.
          Transactional emails are sent via Resend. Each processes data only as needed to
          provide their service to us.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Cookies & Local Storage</h2>
        <p className="text-muted">
          Your shopping cart is stored in your browser&apos;s local storage, not a tracking
          cookie. We do not use third-party advertising trackers.
        </p>
      </section>

      <section>
        <h2 className="text-xl text-text mt-10 mb-3">Your Rights</h2>
        <p className="text-muted">
          {`Under South Africa's POPIA, you can request access to, correction of, or deletion of your personal information. Contact us at ${settings.contact_email}.`}
        </p>
      </section>
    </div>
  );
}