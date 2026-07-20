import Reveal from "@/components/motion/Reveal";
import Link from "next/link";

export default function FounderStory() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="glass-deep rounded-[32px] p-10 relative">
            <span
              className="absolute -top-2 left-6 text-[110px] leading-none text-amber/30 font-serif select-none"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              “
            </span>
            <blockquote
              className="text-2xl md:text-[28px] leading-snug font-display italic"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              I started with two products made at my kitchen table.
              Everything since has come from listening to the people who use
              them.
            </blockquote>
            <cite className="block mt-6 not-italic text-xs tracking-[0.25em] text-amber-deep">
              — DIANA HERBST, FOUNDER
            </cite>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div>
            <p className="tracking-[0.3em] text-[11px] text-amber-deep font-medium">
              OUR STORY
            </p>
            <h2 className="mt-3 text-4xl">
              Fourteen years of honest,{" "}
              <em className="italic text-glow-gradient">handmade</em> care.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              What began as a kitchen‑table project in White River in 2012
              has grown into a trusted apothecary of over 250 products.
              Every formula is still made in South Africa in small batches,
              never tested on animals, and sent with care to customers
              throughout the continent and beyond.
            </p>
            <p className="mt-5 text-muted leading-relaxed">
              Diana Herbst still oversees every new blend herself —
              combining indigenous botanicals with gentle, effective
              textures that celebrate the skin you&rsquo;re in.
            </p>
            <Link
              href="/about"
              className="mt-7 inline-block rounded-full border border-line bg-white/60 backdrop-blur px-7 py-3.5 text-sm font-semibold hover:border-forest"
            >
              Meet Diana
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
