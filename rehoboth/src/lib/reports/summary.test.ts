import { describe, expect, it, vi } from "vitest";
import { toPdfSafe, writeSummary } from "./summary";

const reply = (headline: string) => async () =>
  JSON.stringify({ headline, findings: [{ what: "Sales rose", why: "More visits", action: "Post more news" }] });

describe("writeSummary", () => {
  it("returns the parsed summary when the wording is clean", async () => {
    const s = await writeSummary({}, "September 2026", reply("A steady month with 12 paid orders."));
    expect(s?.headline).toBe("A steady month with 12 paid orders.");
    expect(s?.findings).toHaveLength(1);
  });

  it("drops a summary containing a blocked word", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const s = await writeSummary({}, "September 2026", reply("Moringa sales show demand for medicinal herbs."));
    expect(s).toBeNull();
  });

  it("drops the summary when the model fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const s = await writeSummary({}, "September 2026", async () => {
      throw new Error("timeout");
    });
    expect(s).toBeNull();
  });

  it("drops unparseable output", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await writeSummary({}, "September 2026", async () => "Sorry, I can't")).toBeNull();
  });
});

describe("toPdfSafe", () => {
  it("strips glyphs the fonts cannot draw", () => {
    expect(toPdfSafe("Up ▲ 12% 🎉 — good")).toBe("Up  12%  — good");
  });
});
