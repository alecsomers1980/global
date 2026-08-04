import Link from 'next/link';
import {
  ProductCategory,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  ALL_SIZES,
} from '@/lib/supabase/types';

interface RangeFiltersProps {
  colours: { name: string; hex: string }[];
  activeCategory?: ProductCategory;
  activeColour?: string;
  activeSize?: number;
  signatureOnly?: boolean;
  lockCategory?: boolean;
  resultCount: number;
}

export default function RangeFilters({
  colours,
  activeCategory,
  activeColour,
  activeSize,
  signatureOnly = false,
  lockCategory = false,
  resultCount,
}: RangeFiltersProps) {
  const basePath =
    lockCategory && activeCategory
      ? `/range/${CATEGORY_SLUGS[activeCategory]}`
      : '/range';

  /**
   * Category is expressed as a ROUTE (/range/chukka), not a query param -- the
   * range pages read only colour/size/signature from searchParams. Everything
   * else is carried across in the query string so switching category keeps the
   * rest of the filters intact.
   *
   * `signature` must serialise as '1': that is exactly what the pages parse.
   */
  const buildHref = (overrides: {
    path?: string;
    colour?: string | null;
    size?: number | null;
    signature?: boolean | null;
  }) => {
    const params = new URLSearchParams();

    const finalColour = overrides.colour !== undefined ? overrides.colour : activeColour;
    const finalSize = overrides.size !== undefined ? overrides.size : activeSize;
    const finalSignature = overrides.signature !== undefined ? overrides.signature : signatureOnly;

    if (finalColour) {
      params.set('colour', finalColour);
    }
    if (finalSize) {
      params.set('size', String(finalSize));
    }
    if (finalSignature) {
      params.set('signature', '1');
    }

    const query = params.toString();
    return `${overrides.path ?? basePath}${query ? `?${query}` : ''}`;
  };

  const toggleCategory = (cat: ProductCategory) => {
    const isActive = activeCategory === cat;
    // Toggling the active category off returns to the unfiltered range route.
    return buildHref({ path: isActive ? '/range' : `/range/${CATEGORY_SLUGS[cat]}` });
  };

  const hasActiveFilters = Boolean(activeColour || activeSize || signatureOnly);

  const clearAllHref = basePath;

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">{resultCount} vellies</p>

      {/* Category (hidden when locked) */}
      {!lockCategory && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ path: '/range' })}
              className={`rounded-full px-4 py-1.5 text-xs border transition-colors ${
                !activeCategory
                  ? 'bg-accent text-canvas border-accent'
                  : 'border-text/20 text-muted hover:text-text hover:border-text/40'
              }`}
            >
              All
            </Link>
            {ALL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Link
                  key={cat}
                  href={toggleCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs border transition-colors ${
                    isActive
                      ? 'bg-accent text-canvas border-accent'
                      : 'border-text/20 text-muted hover:text-text hover:border-text/40'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Colour swatches */}
      {colours.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted mb-2">Colour</p>
          <div className="flex flex-wrap gap-2">
            {colours.map((colour) => {
              const isActive = activeColour === colour.name;
              return (
                <Link
                  key={colour.name}
                  href={
                    isActive
                      ? buildHref({ colour: null })
                      : buildHref({ colour: colour.name })
                  }
                  className={`size-7 rounded-full border border-text/20 transition-shadow ${
                    isActive ? 'ring-2 ring-accent ring-offset-2 ring-offset-canvas' : ''
                  }`}
                  style={{ backgroundColor: colour.hex }}
                  aria-label={colour.name}
                  title={colour.name}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Size grid */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const isActive = activeSize === size;
            return (
              <Link
                key={size}
                href={isActive ? buildHref({ size: null }) : buildHref({ size })}
                className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-md text-xs border transition-colors ${
                  isActive
                    ? 'bg-accent text-canvas border-accent'
                    : 'border-text/20 text-muted hover:text-text hover:border-text/40'
                }`}
              >
                {size}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Signature toggle */}
      <div>
        <p className="text-[10px] uppercase tracking-wide text-muted mb-2">Signature</p>
        <Link
          href={
            signatureOnly
              ? buildHref({ signature: false })
              : buildHref({ signature: true })
          }
          className={`inline-block rounded-full px-4 py-1.5 text-xs border transition-colors ${
            signatureOnly
              ? 'bg-accent text-canvas border-accent'
              : 'border-text/20 text-muted hover:text-text hover:border-text/40'
          }`}
        >
          Signature only
        </Link>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <div>
          <Link
            href={clearAllHref}
            className="text-xs text-text underline underline-offset-4"
          >
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}