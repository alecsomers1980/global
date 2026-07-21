import { getSpecials, formatZAR } from "@/lib/catalog";
import Reveal from "@/components/motion/Reveal";
import Link from "next/link";
import Image from "next/image";

export default async function SpecialsShowcase() {
  const specials = await getSpecials();
  if (!specials.length) return null;

  const displayed = specials.slice(0, 8);

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <p className="tracking-[0.3em] text-[11px] text-amber-deep font-medium">
              JULY ONLY · WHILE STOCKS LAST
            </p>
            <h2 className="mt-3 text-4xl md:text-5xl">
              This month&rsquo;s <em className="italic text-glow-gradient">specials</em>
            </h2>
          </div>
          <Link
            href="/specials"
            className="text-sm font-semibold text-forest underline underline-offset-4 hover:text-amber-deep"
          >
            All {specials.length} specials
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {displayed.map((listing, i) => (
            <Reveal
              key={`${listing.product.id}-${listing.variant.id}`}
              delay={(i % 4) * 0.07}
            >
              <Link
                href={`/product/${listing.product.slug}`}
                className="group block glass rounded-3xl p-4 transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="relative bg-white rounded-2xl aspect-square overflow-hidden">
                  <Image
                    src={listing.variant.image}
                    alt={listing.product.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="btn-glow rounded-full px-3 py-1 text-[10px] font-bold tracking-wide absolute top-3 left-3">
                    SAVE {formatZAR(listing.variant.price - listing.variant.salePrice!)}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-medium line-clamp-2 min-h-[2.6em]">
                  {listing.product.title}
                </h3>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-forest">
                    {formatZAR(listing.variant.salePrice!)}
                  </span>
                  <s className="text-xs text-muted">
                    {formatZAR(listing.variant.price)}
                  </s>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
