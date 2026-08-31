import Link from "next/link";
import type { Metadata } from "next";
import { getProducts, priceFrom } from "@/lib/catalog";
import { rands } from "@/lib/money";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBlock } from "@/components/layout/DisclaimerBlock";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/motion/Reveal";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Shop";
const DESCRIPTION =
  "Artemisia, moringa, turmeric, rosemary, neem, boerseep and lip balm — grown, dried and packed at Rehoboth Farm in Mpumalanga.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/shop") },
  // Next does not merge openGraph with the layout's — a page that sets its
  // own openGraph replaces the whole object, so the default share image has
  // to be repeated here, not just relied on from the root layout.
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/shop"),
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function ShopPage() {
  const products = await getProducts();
  const variantCount = products.reduce((n, p) => n + p.variants.length, 0);

  return (
    <>
      <Header />
      {/* One string, not text interleaved with expressions: JSX drops the
          space on each side of an expression, which rendered "24sizes" and
          then "sizes.Grown" when only half of it was fixed. */}
      <PageBanner
        eyebrow="The range"
        title="Everything we grow"
        lead={`${products.length} products, ${variantCount} sizes. Grown, dried and packed on one farm at Low’s Creek, Mpumalanga.`}
      />

      <main className="mx-auto max-w-[1440px] px-6 md:px-16">
        <div className="grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.06}>
              <Link href={`/product/${p.slug}`} className="group flex flex-col gap-4">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <ProductImage
                    src={p.heroImage}
                    alt={p.name}
                    accentHex={p.accentHex}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span
                    className="absolute bottom-0 left-0 h-1 w-full"
                    style={{ backgroundColor: p.accentHex }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-2xl text-ink">{p.name}</h2>
                  {p.botanicalName && (
                    <p className="text-[13px] italic text-ink-mute">{p.botanicalName}</p>
                  )}
                  <p className="mt-1 text-[15px] text-ink">from {rands(priceFrom(p))}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="pb-6">
          <DisclaimerBlock />
        </div>
      </main>
      <Footer />
    </>
  );
}
