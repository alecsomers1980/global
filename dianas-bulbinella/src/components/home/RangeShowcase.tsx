import { RANGES, rangeBySlug } from "@/lib/nav";
import { getByRange } from "@/lib/catalog";
import Reveal from "@/components/motion/Reveal";
import Link from "next/link";
import Image from "next/image";

const featuredRows = [
  {
    slug: "bulbinella",
    flower: "/images/flowers/marigold.jpg",
    tint: "#FBEEDD",
    blurb: "The plant that started it all — our signature creams and serums.",
  },
  {
    slug: "lotus",
    flower: "/images/flowers/lotus.jpg",
    tint: "#F9E6EC",
    blurb: "Softening, calming anti-ageing care inspired by the lotus.",
  },
  {
    slug: "argan",
    flower: "/images/flowers/lavender.jpg",
    tint: "#EEE9F6",
    blurb: "Cold-pressed argan richness for skin, hair and beard.",
  },
];

export default async function RangeShowcase() {
  const rowData = await Promise.all(
    featuredRows.map(async (row) => ({
      ...row,
      products: await getByRange(row.slug),
    }))
  );

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <Reveal>
        <p className="tracking-[0.3em] text-[11px] text-amber-deep font-medium">
          SIGNATURE RANGES
        </p>
        <h2 className="mt-3 text-4xl md:text-5xl leading-tight">
          Built on plants{" "}
          <em className="italic text-glow-gradient">with a story</em>.
        </h2>
      </Reveal>

      <div className="mt-12 flex flex-col gap-6">
        {rowData.map((row, i) => {
          const rangeMeta = rangeBySlug(row.slug);
          if (!rangeMeta) return null;

          return (
            <Reveal key={row.slug} delay={i * 0.08}>
              <div
                className="relative overflow-hidden rounded-[32px] p-8 md:p-10"
                style={{ background: row.tint }}
              >
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-8 items-center">
                  <div className="relative h-40 w-40 md:h-44 md:w-44 rounded-full overflow-hidden border-4 border-white shadow-lg justify-self-center">
                    <Image
                      src={row.flower}
                      alt=""
                      aria-hidden="true"
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                  </div>

                  <div>
                    <h3 className="text-3xl font-medium">{rangeMeta.name}</h3>
                    <p className="mt-2 text-muted max-w-md">{row.blurb}</p>
                    <p className="mt-1 text-sm text-muted/80">
                      {row.products.length} products
                    </p>

                  </div>

                  <Link
                    href={`/range/${row.slug}`}
                    className="rounded-full bg-forest text-white px-7 py-3.5 text-sm font-semibold hover:bg-moss transition-colors whitespace-nowrap justify-self-start md:justify-self-end"
                  >
                    Explore {rangeMeta.name}
                  </Link>
                </div>

                <div
                  className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full opacity-30 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)",
                  }}
                />
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap gap-2.5">
        {RANGES.map((r) => (
          <Link
            key={r.slug}
            href={`/range/${r.slug}`}
            className="rounded-full border border-line bg-white/70 backdrop-blur px-5 py-2 text-sm font-medium transition-all duration-200 hover:bg-forest hover:text-white hover:border-forest hover:-translate-y-0.5"
          >
            {r.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
