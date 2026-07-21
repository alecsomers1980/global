import type { Metadata } from "next";
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";

export const metadata: Metadata = { title: "FAQ" };

const FAQS: [string, string][] = [
  [
    "Are your products tested on animals?",
    "Never. Everything is cruelty-free and always has been.",
  ],
  [
    "Where are the products made?",
    "Every product is handmade in small batches in White River, Mpumalanga, South Africa.",
  ],
  [
    "How do I order if I'm far from a dealer?",
    "You can order directly through the website and we deliver nationwide. You can also find your nearest dealer on the dealers page.",
  ],
  [
    "Do you ship outside South Africa?",
    "We have dealers in neighbouring countries and ship internationally on request — contact us for a quote.",
  ],
  [
    "How should I store my products?",
    "Cool and dry, out of direct sunlight. Natural products prefer the same conditions you do.",
  ],
];

export default function FaqPage() {
  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <PageBanner video="/videos/dew-banner.mp4"
          eyebrow="HELP"
          title="Questions,"
          accent="answered"
          subtitle="The things we get asked most."
        />
        <div className="mx-auto max-w-3xl px-6 pt-12 pb-20">
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="cursor-pointer list-none text-lg font-medium marker:content-none group-open:text-forest">
                  {q}
                </summary>
                <p className="mt-3 leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
