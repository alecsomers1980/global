'use client';

import { useMemo, useState } from 'react';
import type { ProductImage, ProductWithVariants } from '@/lib/supabase/types';
import { CATEGORY_LABELS } from '@/lib/supabase/types';
import { groupVariants, imagesForColour } from '@/lib/catalogue';
import { formatZAR } from '@/lib/money';
import { useCartStore } from '@/lib/cart/store';
import ColourSwatches from '@/components/product/ColourSwatches';
import SizeSelector from '@/components/product/SizeSelector';
import ProductGallery from '@/components/product/ProductGallery';

interface Props {
  product: ProductWithVariants;
  leadTime: string;
  freeDeliveryLabel: string;
}

/**
 * Stock wins, then photography. Variants arrive ordered by colour name, so
 * without this the page opens on whatever sorts first alphabetically -- which
 * is rarely the colour that has been shot.
 *
 * `images` is ordered by sort_order, so the first colour-specific image is the
 * lead shot: the one the range card shows. Opening on its colour means the
 * shopper lands on the shoe they just clicked, rather than an empty gallery.
 */
const getInitialColour = (
  groups: ReturnType<typeof groupVariants>,
  images: ProductImage[],
): string => {
  if (groups.length === 0) return '';
  const inStock = groups.filter((g) => g.sizes.some((s) => s.stockQty > 0));
  const pool = inStock.length > 0 ? inStock : groups;
  const lead = images.find((img) => img.colour_name !== null);
  const match = lead && pool.find((g) => g.colourName === lead.colour_name);
  return (match ?? pool[0]).colourName;
};

export default function ProductDetail({ product, leadTime, freeDeliveryLabel }: Props) {
  const groups = useMemo(() => groupVariants(product.variants, product.base_price), [product]);

  const [selectedColour, setSelectedColour] = useState<string>(() =>
    getInitialColour(groups, product.images),
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const activeGroup = groups.find((g) => g.colourName === selectedColour) ?? groups[0];
  const images = imagesForColour(product.images, selectedColour);

  const priceCents: number =
    selectedSize !== null
      ? (activeGroup?.sizes.find((s) => s.size === selectedSize)?.priceCents ??
        product.base_price)
      : product.base_price;

  const handleColourChange = (colour: string) => {
    setSelectedColour(colour);
    setSelectedSize(null);
    setGalleryIndex(0);
  };

  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);

  const selectedSizeOption = activeGroup?.sizes.find((s) => s.size === selectedSize);

  const handleAddToCart = () => {
    if (!activeGroup || !selectedSizeOption) return;
    addItem({
      variantId: selectedSizeOption.variantId,
      productSlug: product.slug,
      productName: product.name,
      colour: activeGroup.colourName,
      size: selectedSizeOption.size,
      priceCents: selectedSizeOption.priceCents,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const description = product.description ?? '';
  const paragraphs = description.split('\n').filter(Boolean);
  const showDescription = paragraphs.length > 0 ? paragraphs : description ? [description] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <ProductGallery
        images={images}
        productName={product.name}
        activeIndex={galleryIndex}
        onSelect={setGalleryIndex}
      />

      <div className="space-y-8">
        {product.is_signature && (
          <span className="inline-block border border-accent/40 text-text text-[10px] uppercase tracking-[0.2em] px-2 py-1">
            Signature
          </span>
        )}

        <h1 className="display text-3xl sm:text-4xl text-text">{product.name}</h1>

        <p className="text-xs text-muted">
          {CATEGORY_LABELS[product.category]}
          {product.style_no && ` · Style ${product.style_no}`}
        </p>

        <p className="text-2xl text-text">{formatZAR(priceCents)}</p>

        <ColourSwatches
          groups={groups}
          selected={selectedColour}
          onSelect={handleColourChange}
        />

        {activeGroup && (
          <SizeSelector
            sizes={activeGroup.sizes}
            selected={selectedSize}
            onSelect={(size) => setSelectedSize(size)}
          />
        )}

        <button
          type="button"
          disabled={!selectedSizeOption}
          onClick={handleAddToCart}
          className="w-full bg-accent text-canvas py-3 rounded-md text-sm uppercase tracking-[0.15em] transition-colors hover:bg-accent-hi disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent"
        >
          {justAdded ? 'Added ✓' : selectedSizeOption ? 'Add to cart' : 'Select a size'}
        </button>

        {showDescription.length > 0 && (
          <div className="space-y-4 text-sm text-muted">
            {showDescription.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        )}

        <ul className="text-xs text-muted space-y-2">
          {[
            'Genuine leather',
            'Non-slip TPR sole',
            'Handmade in South Africa',
            `Made to order in ${leadTime}`,
            `Free delivery on orders over ${freeDeliveryLabel}`,
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span aria-hidden="true" className="text-accent select-none">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}