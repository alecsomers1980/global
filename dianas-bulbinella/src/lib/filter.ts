import type { Product } from "./catalog";

type SearchParams = {
  q?: string;
  format?: string;
  price?: string;
  sort?: string;
};

function cheapestEffectivePrice(p: Product): number {
  return Math.min(...p.variants.map((v) => v.salePrice ?? v.price));
}

function isOnSale(p: Product): boolean {
  return p.variants.some((v) => v.salePrice !== null);
}

export function applyFilters(
  products: Product[],
  sp: SearchParams
): Product[] {
  let result = [...products];

  if (sp.q) {
    const q = sp.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.categories.some((cat) => cat.toLowerCase().includes(q))
    );
  }

  if (sp.format) {
    const fmt = sp.format.toLowerCase();
    result = result.filter((p) => p.format.toLowerCase() === fmt);
  }

  if (sp.price) {
    result = result.filter((p) => {
      return p.variants.some((variant) => {
        const eff = variant.salePrice ?? variant.price;
        switch (sp.price) {
          case "lt100":
            return eff < 100;
          case "100-300":
            return eff >= 100 && eff <= 300;
          case "300-700":
            return eff >= 300 && eff <= 700;
          case "gt700":
            return eff > 700;
          default:
            return true;
        }
      });
    });
  }

  const sort = sp.sort || "default";
  result.sort((a, b) => {
    if (sort === "name") {
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    if (sort === "asc") {
      return cheapestEffectivePrice(a) - cheapestEffectivePrice(b);
    }
    if (sort === "desc") {
      return cheapestEffectivePrice(b) - cheapestEffectivePrice(a);
    }
    // default sort
    const aOnSale = isOnSale(a);
    const bOnSale = isOnSale(b);
    if (aOnSale !== bOnSale) {
      return bOnSale ? 1 : -1;
    }
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  });

  return result;
}
