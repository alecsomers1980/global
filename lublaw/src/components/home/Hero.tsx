export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-surface to-white border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-gold-deep font-medium mb-2">Your Dedicated Professional Team</p>
        <h1 className="font-heading text-4xl sm:text-5xl text-maroon mb-4">Where People Matter</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          For expert legal advice, backed by more than 20 years of experience.
        </p>
        <a
          href="/contact"
          className="inline-block mt-8 rounded-full bg-maroon text-white px-8 py-3 font-semibold hover:bg-maroon/90 transition-colors"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
