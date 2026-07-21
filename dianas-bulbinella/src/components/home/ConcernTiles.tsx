import { CONCERNS } from "@/lib/nav";
import { getAllProducts, defaultVariant } from "@/lib/catalog";
import Reveal from "@/components/motion/Reveal";
import Link from "next/link";
import Image from "next/image";

export default async function ConcernTiles() {
  // One representative product image per concern, from the real catalogue.
  const products = await getAllProducts();
  const imageFor = (slug: string) => {
    const match = products.find((p) => p.concerns.includes(slug));
    return match ? defaultVariant(match).image : null;
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <p className="tracking-[0.3em] text-[11px] text-amber-deep font-medium">
            SHOP BY CONCERN
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl">
            What does <em className="italic text-glow-gradient">your skin</em> need today?
          </h2>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CONCERNS.map((c, i) => {
            const img = imageFor(c.slug);
            return (
              <Reveal key={c.slug} delay={(i % 3) * 0.08}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="group relative block glass rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber/60"
                >
                  {img && (
                    <div className="pointer-events-none absolute top-4 right-4 h-24 w-24">
                      <div className="glow-ring absolute inset-0 rounded-full" />
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                      />
                    </div>
                  )}
                  <div className={`relative ${img ? "pr-20" : ""}`}>
                    <h3 className="text-xl font-medium group-hover:text-forest">
                      {c.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {c.blurb}
                    </p>
                  </div>
                  <div className="relative mt-5 flex items-center text-amber-deep">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
