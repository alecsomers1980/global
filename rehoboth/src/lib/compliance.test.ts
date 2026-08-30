import { describe, expect, test } from "vitest";
import { screen } from "./compliance";

describe("compliance screen", () => {
  test("flags the exact wording printed on the Artemisia labels", () => {
    const r = screen(
      "Assists in supporting the treatment of malaria, hepatitis, and certain cancers"
    );
    expect(r.flagged).toBe(true);
    expect(r.hits).toEqual(
      expect.arrayContaining(["malaria", "hepatitis", "cancers", "treatment"])
    );
  });

  test("flags the immune-booster wording on every label", () => {
    expect(screen("Immune Booster Capsules").flagged).toBe(true);
    expect(screen("IMMUNE SUPPORT CAPSULES").flagged).toBe(true);
  });

  test("flags the Turmeric label's condition list", () => {
    const r = screen(
      "Helps manage arthritis, cholesterol levels, anxiety, and muscle pain"
    );
    expect(r.flagged).toBe(true);
    expect(r.hits).toEqual(
      expect.arrayContaining(["arthritis", "cholesterol", "anxiety"])
    );
  });

  test("flags the Rosemary label heading", () => {
    expect(screen("MEDICINAL").flagged).toBe(true);
  });

  test("passes the traditional-use framing we ship instead", () => {
    const r = screen(
      "Artemisia annua has a long history of traditional use as a bitter aromatic herb, most often taken as a tea or in capsule form."
    );
    expect(r).toEqual({ flagged: false, hits: [] });
  });

  test("passes cosmetic function language for topicals", () => {
    expect(screen("Softens and conditions the lips.").flagged).toBe(false);
    expect(screen("For external use. Cleanses the skin.").flagged).toBe(false);
  });

  test("does not false-positive on ordinary words", () => {
    // \b boundaries: "healthy" is not "heal", "manicure" is not "cure".
    expect(screen("a healthy plant, grown on a manicured farm").flagged).toBe(false);
  });

  test("ignores empty input", () => {
    expect(screen(null, undefined, "   ")).toEqual({ flagged: false, hits: [] });
  });
});
