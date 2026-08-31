import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProducts, getProductBySlug } from "@/lib/catalog";
import { screen } from "@/lib/compliance";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBlock } from "@/components/layout/DisclaimerBlock";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductMedia } from "@/components/product/ProductMedia";
import { SelectedVariantProvider } from "@/components/product/SelectedVariant";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  // Metadata is copy too, and a claim here would be indexed. Failing the build
  // is the point — see docs/label-claims-note-for-client.md.
  const check = screen(product.name, product.summary);
  if (check.flagged) {
    throw new Error(
      `Compliance: "${product.slug}" metadata contains ${check.hits.join(", ")}`
    );
  }

  return { title: product.name, description: product.summary };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1440px] px-6 md:px-16">
        <nav className="py-6 text-sm text-ink-mute">
          <Link href="/shop" className="hover:text-brand">
            Shop
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <SelectedVariantProvider product={product}>
        <div className="grid gap-12 pb-16 lg:grid-cols-2 lg:gap-20">
          <ProductMedia product={product} />

          <div className="flex flex-col gap-8">
            <div>
              <h1 className="font-display text-4xl text-ink md:text-[52px]">{product.name}</h1>
              {product.botanicalName && (
                <p className="mt-2 text-[15px] italic text-ink-mute">{product.botanicalName}</p>
              )}
              <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">{product.summary}</p>
            </div>

            <VariantSelector product={product} />

            <dl className="flex flex-col gap-6 border-t border-hairline pt-8">
              {product.traditionalUse && (
                <div>
                  <dt className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-mute">
                    Traditional use
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-ink-soft">
                    {product.traditionalUse}
                  </dd>
                </div>
              )}
              <div>
                <dt className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-mute">
                  Ingredients
                </dt>
                <dd className="text-[15px] leading-relaxed text-ink-soft">{product.ingredients}</dd>
              </div>
              <div>
                <dt className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-mute">
                  Directions
                </dt>
                <dd className="text-[15px] leading-relaxed text-ink-soft">{product.directions}</dd>
              </div>
              <div>
                <dt className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-mute">Storage</dt>
                <dd className="text-[15px] leading-relaxed text-ink-soft">{product.storage}</dd>
              </div>
            </dl>

            <DisclaimerBlock />
          </div>
        </div>
        </SelectedVariantProvider>
      </main>
      <Footer />
    </>
  );
}
