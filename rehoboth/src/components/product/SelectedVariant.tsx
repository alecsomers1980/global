"use client";

import { createContext, useContext, useState } from "react";
import type { Product, Variant } from "@/lib/catalog";

type Selection = { selected: Variant | undefined; select: (id: string) => void };

const Ctx = createContext<Selection | null>(null);

/**
 * Which size is chosen, shared by everything on the product page that changes
 * with it: the photograph in one column, the buy box in the other, and the
 * wording in between.
 *
 * The wording used to be static and server-rendered, which is what this
 * provider was originally shaped to protect. It is not static any more — a
 * size can carry its own description, directions and so on (0009), so those
 * sections read the selection too. The provider still wraps the whole grid
 * rather than one column, and the parts that genuinely do not vary — the
 * heading, the botanical name, the disclaimer — stay on the server.
 */
export function SelectedVariantProvider({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const [id, setId] = useState(product.variants[0]?.id);
  const selected = product.variants.find((v) => v.id === id) ?? product.variants[0];

  return <Ctx.Provider value={{ selected, select: setId }}>{children}</Ctx.Provider>;
}

export function useSelectedVariant(): Selection {
  const value = useContext(Ctx);
  if (!value) throw new Error("useSelectedVariant used outside SelectedVariantProvider");
  return value;
}
