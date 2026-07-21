import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatZAR } from "@/lib/catalog";
import FilterBar from "@/components/admin/FilterBar";

type ProductVariant = {
  price: number;
  stock: "instock" | "outofstock";
};

type ProductWithVariants = {
  id: string;
  slug: string;
  title: string;
  active: boolean;
  product_variants: ProductVariant[];
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    concern?: string;
    range?: string;
    active?: string;
    stock?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const { concern = "", range = "", active = "", stock = "" } = params;

  const supabase = await createClient();

  // The concern/range pickers are driven by the categories table rather than a
  // hard-coded list, so adding a range in the DB shows up here automatically.
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, name, kind")
    .in("kind", ["concern", "range"])
    .order("sort");

  let query = supabase
    .from("products")
    .select("id, slug, title, active, concerns, ranges, product_variants(price, stock)")
    .order("title");

  if (q) {
    // Slug too — it's shown in the table, so it's searchable.
    query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  // concerns/ranges are text[] columns; `contains` maps to the PG @> operator.
  if (concern) query = query.contains("concerns", [concern]);
  if (range) query = query.contains("ranges", [range]);
  if (active) query = query.eq("active", active === "yes");

  const { data: allProducts } = await query.returns<ProductWithVariants[]>();

  // Stock lives on the variants, so it can't be filtered in the same query
  // without dropping products that have a mix of in/out-of-stock sizes.
  // 201 products — filtering here is cheap and keeps the meaning obvious.
  const products = (allProducts ?? []).filter((p) => {
    if (!stock) return true;
    const anyInStock = (p.product_variants ?? []).some((v) => v.stock === "instock");
    return stock === "instock" ? anyInStock : !anyInStock;
  });

  const totalCount = products.length;
  const hasFilters = Boolean(q || concern || range || active || stock);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
        <div className="text-sm text-muted">
          {hasFilters ? `${totalCount} matching` : `${totalCount} products`}
        </div>
      </div>

      <FilterBar
        action="/admin/products"
        q={q}
        placeholder="Search title or slug…"
        hasFilters={hasFilters}
        selects={[
          {
            name: "concern",
            label: "Any concern",
            value: concern,
            options: (categories ?? [])
              .filter((c) => c.kind === "concern")
              .map((c) => ({ value: c.slug, label: c.name })),
          },
          {
            name: "range",
            label: "Any range",
            value: range,
            options: (categories ?? [])
              .filter((c) => c.kind === "range")
              .map((c) => ({ value: c.slug, label: c.name })),
          },
          {
            name: "stock",
            label: "Any stock",
            value: stock,
            options: [
              { value: "instock", label: "In stock" },
              { value: "outofstock", label: "Out of stock" },
            ],
          },
          {
            name: "active",
            label: "Active & hidden",
            value: active,
            options: [
              { value: "yes", label: "Active only" },
              { value: "no", label: "Hidden only" },
            ],
          },
        ]}
      />

      {products.length > 0 ? (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Sizes</th>
                <th className="px-4 py-2 font-medium">Price Range</th>
                <th className="px-4 py-2 font-medium">Stock</th>
                <th className="px-4 py-2 font-medium">Active</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p: ProductWithVariants) => {
                const variants = p.product_variants ?? [];
                const sizeCount = variants.length;
                const prices = variants
                  .map((v) => v.price)
                  .filter((price): price is number => price != null);
                const uniquePrices = [...new Set(prices)];
                const minPrice =
                  uniquePrices.length > 0 ? Math.min(...uniquePrices) : null;
                const maxPrice =
                  uniquePrices.length > 0 ? Math.max(...uniquePrices) : null;

                const anyInStock = variants.some(
                  (v) => v.stock === "instock"
                );
                const stockStatus = anyInStock ? "In stock" : "Out of stock";

                const sizeDisplay =
                  sizeCount > 0
                    ? `${sizeCount} size${sizeCount !== 1 ? "s" : ""}`
                    : "—";

                let priceDisplay = "—";
                if (uniquePrices.length === 1) {
                  priceDisplay = formatZAR(uniquePrices[0]);
                } else if (uniquePrices.length > 1) {
                  priceDisplay = `${formatZAR(minPrice!)} – ${formatZAR(maxPrice!)}`;
                }

                return (
                  <tr key={p.id} className="hover:bg-surface">
                    <td className="px-4 py-3">
                      <div className="text-ink font-medium">{p.title}</div>
                      <div className="text-xs text-muted">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{sizeDisplay}</td>
                    <td className="px-4 py-3 text-ink">{priceDisplay}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          stockStatus === "In stock"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.active ? (
                        <span className="text-xs text-forest font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-muted">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-sm text-forest hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted bg-white border border-line rounded-xl p-4">
          {hasFilters ? "No products match." : "No products found."}
        </p>
      )}
    </div>
  );
}
