import { describe, test, expect } from "vitest";
import { shippingFor, amountToFreeDelivery, SHIPPING_FALLBACK } from "./shipping";

describe("shippingFor", () => {
  test("charges the flat rate below the threshold", () => {
    expect(shippingFor(200, false)).toBe(99);
  });

  test("is free at exactly the threshold", () => {
    expect(shippingFor(750, false)).toBe(0);
  });

  test("is free above the threshold", () => {
    expect(shippingFor(751, false)).toBe(0);
  });

  test("collection is free regardless of subtotal", () => {
    expect(shippingFor(10, true)).toBe(0);
    expect(shippingFor(5000, true)).toBe(0);
  });

  test("an empty cart still returns the flat rate, not a negative", () => {
    expect(shippingFor(0, false)).toBe(99);
  });

  test("honours settings from the database over the fallback", () => {
    const s = { flat: 150, free_over: 1200, collect_from_farm: false };
    expect(shippingFor(800, false, s)).toBe(150);
    expect(shippingFor(1200, false, s)).toBe(0);
  });
});

describe("amountToFreeDelivery", () => {
  test("reports the gap below the threshold", () => {
    expect(amountToFreeDelivery(600)).toBe(150);
  });

  test("is zero once the threshold is met", () => {
    expect(amountToFreeDelivery(750)).toBe(0);
    expect(amountToFreeDelivery(900)).toBe(0);
  });
});

test("the documented default matches the client note", () => {
  // If these change, docs/superpowers/specs §8.1 and the checkout copy must
  // change with them.
  expect(SHIPPING_FALLBACK).toEqual({ flat: 99, free_over: 750, collect_from_farm: true });
});
