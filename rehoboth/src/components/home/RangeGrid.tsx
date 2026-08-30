import Link from "next/link";
import { getFeaturedProducts, getProducts, priceFrom } from "@/lib/catalog";
import { rands } from "@/lib/money";
import { Reveal } from "@/components/motion/Reveal";
import { ProductImage } from "@/components/product/ProductImage";

export async function RangeGrid() {
  const products = await getFeaturedProducts();
  const all = await getProducts();
  const variantCount = all.reduce((n, p) => n + p.variants.length, 0);

  return (
    <section className="mx-auto max-w-[1440px] px-6 pt-24 md:px-16">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-brand">The range</p>
          <h2 className="font-display text-3xl text-ink md:text-[46px]">
            Powders, capsules, ointments
          </h2>
        </div>
        <Link href="/shop" className="border-b border-hairline pb-1 text-sm text-ink hover:text-brand">
          All {variantCount} products
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.07}>
            <Link href={`/product/${p.slug}`} className="group flex flex-col gap-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <ProductImage
                  src={p.heroImage}
                  alt={p.name}
                  accentHex={p.accentHex}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <span
                  className="absolute bottom-0 left-0 h-1 w-full"
                  style={{ backgroundColor: p.accentHex }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-[22px] text-ink">{p.name}</h3>
                <p className="text-[13px] text-ink-mute">
                  {p.variants.length} {p.variants.length === 1 ? "size" : "sizes"}
                </p>
                <p className="mt-1 text-[15px] text-ink">from {rands(priceFrom(p))}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
