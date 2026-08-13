import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsConditionsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose-sm">
      <h1 className="font-display text-3xl text-ink mb-6">Terms &amp; Conditions</h1>
      <p className="text-muted mb-4">
        Reservations are accepted on a "per room" basis and not "per person". Children over 1 are welcome. Check-in
        time is between 13:00 and 18:00.
      </p>
      <p className="text-muted">
        Full terms are being migrated from our previous website and will be published here verbatim once confirmed —
        contact us directly with any booking questions in the meantime.
      </p>
    </main>
  );
}