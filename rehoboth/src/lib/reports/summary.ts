import Anthropic from "@anthropic-ai/sdk";
import { screen } from "../compliance";

/**
 * The executive summary at the top of the report.
 *
 * The model is handed the finished figures and told they are final — it reads,
 * it does not count. Best effort throughout: no key, a timeout, unparseable
 * output or a blocked word all return null and the section is simply left out.
 *
 * The wording gate is the code check, not the prompt. A report that tells the
 * client their moringa "supports immunity" is the same exposure as a product
 * page saying it.
 */

export type Finding = { what: string; why: string; action: string };
export type Summary = { headline: string; findings: Finding[] };

type Generate = (system: string, user: string) => Promise<string>;

const SYSTEM = `You write the executive summary of a monthly website and shop report for Rehoboth Herbal Co., a small farm in Low's Creek, Mpumalanga, South Africa, that grows, dries and packs its own herbs and sells them online.

The figures you are given are FINAL and correct. Do not recalculate, estimate or invent any number; only quote numbers that appear in the data. If a section is marked unavailable, say nothing about it.

Write for the farm owner: plain South African English, no jargon, no hype.

STRICT RULE — a legal requirement: never describe any product or plant as treating, curing, preventing or having any effect on health or a medical condition, and never use words like medicinal, healing, immune, remedy or cure. Talk only about sales, visitors, enquiries and content.

Return ONLY a JSON object, no code fences:
{"headline": "3-4 sentences summarising the month", "findings": [{"what": "...", "why": "...", "action": "..."}]}
with at most two findings, each a concrete suggestion grounded in the figures.`;

const defaultGenerate: Generate = async (system, user) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const res = await new Anthropic({ apiKey, timeout: 20_000, maxRetries: 0 }).messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: user }],
  });
  const text = res.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!text) throw new Error("no text in response");
  return text.text;
};

export async function writeSummary(
  metrics: unknown,
  monthLabel: string,
  generate: Generate = defaultGenerate
): Promise<Summary | null> {
  try {
    const raw = await generate(SYSTEM, `Report for ${monthLabel}. Figures:\n${JSON.stringify(metrics, null, 2)}`);
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json) as Partial<Summary>;
    if (typeof parsed.headline !== "string" || !parsed.headline.trim()) throw new Error("no headline");

    const summary: Summary = {
      headline: toPdfSafe(parsed.headline),
      findings: (Array.isArray(parsed.findings) ? parsed.findings : []).slice(0, 2).map((f) => ({
        what: toPdfSafe(String(f?.what ?? "")),
        why: toPdfSafe(String(f?.why ?? "")),
        action: toPdfSafe(String(f?.action ?? "")),
      })),
    };

    const check = screen(summary.headline, ...summary.findings.flatMap((f) => [f.what, f.why, f.action]));
    if (check.flagged) {
      console.warn(`[report ${monthLabel}] AI summary dropped — blocked words: ${check.hits.join(", ")}`);
      return null;
    }
    return summary;
  } catch (e) {
    console.warn(`[report ${monthLabel}] AI summary skipped:`, e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Keep only what the report's fonts can draw (Latin-1 and common punctuation).
 * Anything else — emoji, arrows — would print as a box or a stray glyph.
 */
export function toPdfSafe(s: string): string {
  return s.replace(/[^\x20-\x7E -ÿ–—‘’“”…\n]/g, "").trim();
}
