import Reveal from '@/components/motion/Reveal';
import Link from 'next/link';

export default function StoryPage() {
  return (
    <>
      <Reveal>
        <section className="bg-canvas py-24">
          <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Wild by Nature</p>
            <h2 className="display mt-2 text-4xl md:text-5xl text-text">An animal built to adapt</h2>
            <p className="mt-5 text-muted">
              The caracal is one of Africa&rsquo;s most adaptable wild cats &mdash; equally at home
              in mountain scrub, semi-desert and open grassland, and rarely seen despite ranging
              across most of the continent. That&rsquo;s the animal on our badge, and the standard
              we build to: footwear that goes wherever you go, and outlasts the ground it walks on.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-surface py-24">
          <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted">The Craft</p>
            <h2 className="display mt-2 text-4xl md:text-5xl text-text">Handmade, not mass-produced</h2>
            <p className="mt-5 text-muted">
              Every pair starts as genuine leather, hand-cut and hand-stitched onto a non-slip TPR
              sole. Nothing here comes off a factory line &mdash; each style is made to order, which
              is also why we can offer sizes 4 to 15 without turning away a small order.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-canvas py-24">
          <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted">The Signature Tier</p>
            <h2 className="display mt-2 text-4xl md:text-5xl text-text">Wildlife, hide and floral, hand-finished</h2>
            <p className="mt-5 text-muted">
              Our Signature Collection carries airbrush wildlife art, game hide panels and floral
              work on the same handcrafted base as the rest of the range. It&rsquo;s the one thing
              in this market nobody else is doing at this level.
            </p>
          </div>
        </section>
      </Reveal>

      <section className="bg-canvas py-24">
        <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
          <h2 className="display text-4xl text-text">See the range</h2>
          <Link
            href="/range"
            className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-[0.15em] text-canvas transition-colors hover:bg-accent-hi"
          >
            Shop the range
          </Link>
        </div>
      </section>
    </>
  );
}