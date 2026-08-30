import { beforeEach, describe, expect, test } from "vitest";
import { useCart, subtotalOf, countOf, type CartLine } from "./cart";

const rosemary = {
  variantId: "rosemary-capsules-90",
  productSlug: "rosemary",
  name: "Rosemary",
  sizeLabel: "90",
  priceRetail: 221,
};
const turmeric = {
  variantId: "turmeric-powder-150",
  productSlug: "turmeric-with-pepper",
  name: "Turmeric with Pepper",
  sizeLabel: "150 g",
  priceRetail: 182,
};

describe("cart", () => {
  beforeEach(() => useCart.getState().clear());

  test("adding the same variant twice makes one line of qty 2", () => {
    const { add } = useCart.getState();
    add(rosemary);
    add(rosemary);
    const { items } = useCart.getState();
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  test("different variants are separate lines", () => {
    const { add } = useCart.getState();
    add(rosemary);
    add(turmeric);
    expect(useCart.getState().items).toHaveLength(2);
  });

  test("subtotal is price x qty summed", () => {
    const { add } = useCart.getState();
    add(rosemary, 2);
    add(turmeric);
    const { items } = useCart.getState();
    expect(subtotalOf(items)).toBe(221 * 2 + 182);
    expect(countOf(items)).toBe(3);
  });

  test("setQty to zero removes the line", () => {
    const { add, setQty } = useCart.getState();
    add(rosemary, 3);
    setQty(rosemary.variantId, 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  test("remove drops only the named variant", () => {
    const { add, remove } = useCart.getState();
    add(rosemary);
    add(turmeric);
    remove(rosemary.variantId);
    const { items } = useCart.getState();
    expect(items.map((i: CartLine) => i.variantId)).toEqual([turmeric.variantId]);
  });

  test("empty cart totals zero", () => {
    expect(subtotalOf([])).toBe(0);
    expect(countOf([])).toBe(0);
  });
});
