import { listProducts } from '@/lib/queries/products';
import SignatureShowcase from '@/components/motion/SignatureShowcase';

export default async function SignaturePage() {
  const products = await listProducts({ signatureOnly: true });

  return (
    <>
      <section className="bg-canvas py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            The Signature Collection
          </p>

          <h1 className="display mt-2 text-5xl md:text-6xl text-text">
            Wildlife. Hide. Floral.
          </h1>

          <p className="mt-5 text-muted">
            Airbrush wildlife art, game hide panels and floral work on the same
            handcrafted vellie base. No competitor in this market offers
            decorated vellies at this level — every piece here is one of
            Caracal&apos;s own designs.
          </p>

          {products.length === 0 && (
            <div className="py-8">
              <p className="mt-8 text-muted">
                The Signature Collection is being photographed — check back soon,
                or ask Donald directly.
              </p>
            </div>
          )}
        </div>
      </section>

      {products.length > 0 && (
        <SignatureShowcase products={products} variant="full" />
      )}
    </>
  );
}
