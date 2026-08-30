/**
 * Required on every product page and the homepage.
 *
 * The printed labels carry treatment claims that would make these products
 * medicines under Act 101 of 1965. The site makes no such claims, and says so.
 * See docs/label-claims-note-for-client.md.
 */
export function DisclaimerBlock({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div
      className={`border px-7 py-6 text-[13px] leading-relaxed ${
        dark ? "border-white/15 text-white/60" : "border-hairline text-ink-mute"
      }`}
    >
      These are traditional herbal products, not medicines. They are not intended
      to diagnose, treat, cure or prevent any disease. Information reflects
      traditional use in South Africa and is not a substitute for professional
      medical advice. Consult a healthcare practitioner before use, especially if
      pregnant, nursing, or on medication.
    </div>
  );
}
