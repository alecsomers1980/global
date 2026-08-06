import { listProducts, listColours, getSiteSettings } from '@/lib/queries/products';
import { ALL_CATEGORIES } from '@/lib/supabase/types';
import HeroBeat from '@/components/home/HeroBeat';
import ColourSweep from '@/components/motion/ColourSweep';
import CraftPillarsBeat from '@/components/home/CraftPillarsBeat';
import SignatureShowcase from '@/components/motion/SignatureShowcase';
import RangeGridBeat from '@/components/home/RangeGridBeat';
import SizeStatementBeat from '@/components/home/SizeStatementBeat';

/**
 * The cinematic nine-beat homepage (spec §6), minus beats 7 (Reviews) and 8
 * (Journal teaser) -- both need Phase 5 tables and are added there. Beat 9
 * (Footer) is already rendered globally by the (storefront) layout.
 */
export default async function Home() {
  const [settings, colours, signatureProducts, allProducts] = await Promise.all([
    getSiteSettings(),
    listColours(),
    listProducts({ signatureOnly: true }),
    listProducts(),
  ]);

  const categories = ALL_CATEGORIES.map((category) => {
    const inCategory = allProducts.filter((p) => p.category === category);
    const withImage = inCategory.find((p) => p.images.length > 0);
    const image = withImage
      ? {
          url:
            withImage.images.find((i) => i.colour_name === null)?.url ??
            withImage.images[0].url,
          alt: withImage.name,
        }
      : null;
    return { category, count: inCategory.length, image };
  });

  return (
    <>
      <HeroBeat
        leadTime={settings.lead_time}
        deliveryThreshold={Number(settings.delivery_free_threshold)}
      />
      <ColourSweep colours={colours} />
      <CraftPillarsBeat />
      {signatureProducts.length > 0 && (
        <SignatureShowcase products={signatureProducts} variant="teaser" />
      )}
      <div className="bg-surface">
        <RangeGridBeat categories={categories} />
      </div>
      <SizeStatementBeat />
    </>
  );
}
