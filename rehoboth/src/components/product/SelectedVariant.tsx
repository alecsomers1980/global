"use client";

import { createContext, useContext, useState } from "react";
import type { Product, Variant } from "@/lib/catalog";

type Selection = { selected: Variant | undefined; select: (id: string) => void };

const Ctx = createContext<Selection | null>(null);

/**
 * Which size is chosen, shared between the photograph and the buy box.
 *
 * Those two sit in opposite columns of the product page and everything between
 * them — ingredients, directions, the disclaimer — is static copy. A provider
 * wrapped around the grid keeps that copy on the server; lifting the state
 * into a component that owned both columns would drag all of it into the
 * client bundle to make one picture change.
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
