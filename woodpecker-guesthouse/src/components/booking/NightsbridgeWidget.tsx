const propertyId = process.env.NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID;

export default function NightsbridgeWidget() {
  if (!propertyId) {
    // Honest fallback — no fabricated property ID. Swap in the client's real
    // ID from their Nightsbridge dashboard, then this branch stops rendering.
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <p className="text-ink font-medium mb-2">Check availability</p>
        <p className="text-muted text-sm mb-4">Online booking is being connected — enquire directly for now.</p>
        <a
          href="/contact"
          className="inline-block rounded-full bg-terracotta text-white px-6 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors"
        >
          Enquire Now
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-4 overflow-hidden">
      <iframe
        title="Check availability and book"
        src={`https://book.nightsbridge.com/${propertyId}`}
        className="w-full h-[420px] border-0"
        loading="lazy"
      />
    </div>
  );
}