import { describe, test, expect } from "vitest";
import { copyFor } from "./product-copy";
import type { Product, Variant } from "./catalog";

/**
 * The rule these lock: a size shows its own wording where it has any, and the
 * product's everywhere else. Getting the blank case wrong is what would put an
 * empty "Ingredients" heading on a live product page.
 */

const product = {
  id: "p1",
  slug: "boerseep",
  name: "Boerseep",
  botanicalName: null,
  accentHex: "#6C8781",
  summary: "A farm soap.",
  traditionalUse: "Washing.",
  ingredients: "Tallow, lye.",
  directions: "Use on the hands.",
  storage: "Keep dry.",
  heroImage: null,
  variants: [],
} satisfies Product;

const bare: Variant = {
  id: "v1",
  format: "bar",
  sizeLabel: "150 g",
  barcode: null,
  priceRetail: 60,
  stock: 0,
  imageUrl: null,
  summary: null,
  traditionalUse: null,
  ingredients: null,
  directions: null,
  storage: null,
};

describe("copyFor", () => {
  test("a size with no wording of its own inherits all of it", () => {
    expect(copyFor(product, bare)).toEqual({
      summary: "A farm soap.",
      traditionalUse: "Washing.",
      ingredients: "Tallow, lye.",
      directions: "Use on the hands.",
      storage: "Keep dry.",
    });
  });

  test("a size overrides only the fields it fills in", () => {
    const copy = copyFor(product, { ...bare, directions: "Two capsules a day." });
    expect(copy.directions).toBe("Two capsules a day.");
    expect(copy.ingredients).toBe("Tallow, lye.");
    expect(copy.summary).toBe("A farm soap.");
  });

  test("every field can be overridden", () => {
    const copy = copyFor(product, {
      ...bare,
      summary: "S",
      traditionalUse: "T",
      ingredients: "I",
      directions: "D",
      storage: "St",
    });
    expect(copy).toEqual({
      summary: "S",
      traditionalUse: "T",
      ingredients: "I",
      directions: "D",
      storage: "St",
    });
  });

  test("whitespace is not an override", () => {
    // A textarea the operator cleared arrives as "   ", not as null.
    const copy = copyFor(product, { ...bare, ingredients: "   \n " });
    expect(copy.ingredients).toBe("Tallow, lye.");
  });

  test("no selection yet falls back to the product", () => {
    expect(copyFor(product, undefined).ingredients).toBe("Tallow, lye.");
  });

  test("traditional use stays null when neither has one, so the section is omitted", () => {
    const noUse = { ...product, traditionalUse: null };
    expect(copyFor(noUse, bare).traditionalUse).toBeNull();
    expect(copyFor(noUse, { ...bare, traditionalUse: "Its own note." }).traditionalUse).toBe(
      "Its own note."
    );
  });
});
