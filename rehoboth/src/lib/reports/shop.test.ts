import { describe, expect, it } from "vitest";
import { summariseOrders, type PaidOrderRow } from "./shop";

const order = (total: number, collect: boolean, items: [string, string, number, number][]): PaidOrderRow => ({
  total: String(total),
  collect_from_farm: collect,
  order_items: items.map(([product_name, size_label, unit_price, qty]) => ({
    product_name,
    size_label,
    unit_price: String(unit_price),
    qty,
  })),
});

describe("summariseOrders", () => {
  it("returns zeros, not nulls, for an empty month", () => {
    expect(summariseOrders([])).toEqual({
      paidOrders: 0,
      revenue: 0,
      averageOrder: 0,
      delivered: 0,
      collected: 0,
      topByRevenue: [],
      topByUnits: [],
    });
  });

  it("totals revenue, average order and the delivery/collect split", () => {
    const s = summariseOrders([
      order(199, false, [["Moringa", "100g", 100, 1]]),
      order(300.5, true, [["Moringa", "100g", 100, 3]]),
    ]);
    expect(s.paidOrders).toBe(2);
    expect(s.revenue).toBe(499.5);
    expect(s.averageOrder).toBe(249.75);
    expect(s.delivered).toBe(1);
    expect(s.collected).toBe(1);
  });

  it("groups products by name and size, separately", () => {
    const s = summariseOrders([
      order(0, false, [
        ["Moringa", "100g", 100, 2],
        ["Moringa", "250g", 220, 1],
      ]),
      order(0, false, [["Moringa", "100g", 100, 1]]),
    ]);
    expect(s.topByUnits[0]).toEqual({ product: "Moringa", size: "100g", units: 3, revenue: 300 });
    expect(s.topByRevenue[0]).toEqual({ product: "Moringa", size: "100g", units: 3, revenue: 300 });
    expect(s.topByUnits).toHaveLength(2);
  });

  it("ranks by revenue and by units independently, five rows each", () => {
    const items: [string, string, number, number][] = [
      ["A", "1", 500, 1],
      ["B", "1", 10, 9],
      ["C", "1", 20, 2],
      ["D", "1", 30, 2],
      ["E", "1", 40, 2],
      ["F", "1", 50, 2],
    ];
    const s = summariseOrders([order(0, false, items)]);
    // Revenue: A 500, F 100, B 90, E 80, D 60, C 40
    expect(s.topByRevenue.map((l) => l.product)).toEqual(["A", "F", "B", "E", "D"]);
    expect(s.topByUnits[0].product).toBe("B");
    expect(s.topByRevenue).toHaveLength(5);
  });
});
