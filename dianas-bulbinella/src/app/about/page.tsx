import type { Metadata } from 'next';
import Link from 'next/link';
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";

export const metadata: Metadata = {
  title: 'Our Story',
};

export default function AboutPage() {
  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <PageBanner video="/videos/lavender-banner.mp4"
          eyebrow="OUR STORY"
          title="It began at a"
          accent="kitchen table"
          subtitle="White River, Mpumalanga — 2012."
        />
        <article className="max-w-3xl mx-auto px-6 pt-12 pb-20 space-y-10">
          <div className="space-y-6 text-[17px] leading-relaxed text-muted">
            <p>
              In 2012, Diana Herbst created her first two handmade products – a soothing Bulbinella skin cream and a
              pioneering Hoodia weight-management range – from her kitchen in Mpumalanga. What started as a personal
              mission to craft pure, effective botanicals has grown, entirely by word of mouth, into a collection of
              over 250 natural products.
            </p>
            <p>
              Every formula is still made in small batches in White River, using time‑honoured methods and
              locally sourced ingredients where possible. We remain fiercely independent, and every product is
              cruelty‑free: we have never tested on animals, and we never will.
            </p>
            <p>
              Diana’s Bulbinella is now lovingly shared by a network of independent dealers across South Africa and
              neighbouring countries – a family of like‑minded people who believe in the power of traditional
              botanicals to support daily wellbeing, without ever making medical claims.
            </p>
          </div>

          <blockquote className="border-l-2 border-amber pl-6 text-xl font-serif italic text-forest">
            “We don’t just make skincare – we keep alive the traditions our grandmothers taught us.”
          </blockquote>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/shop"
              className="rounded-full bg-forest px-6 py-3 text-paper text-sm font-medium hover:bg-moss transition-colors inline-block"
            >
              Shop the range
            </Link>
            <Link
              href="/dealers"
              className="rounded-full border border-line bg-surface text-ink px-6 py-3 text-sm font-medium hover:border-forest transition-colors inline-block"
            >
              Find a dealer
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
