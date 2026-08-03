/**
 * AI executive summary — the "AI CFO" pattern applied to the monthly report.
 *
 * CONSUMES the already-computed report data and returns a short, grounded
 * executive summary (headline + up to 5 findings, each with why / action).
 * It never computes metrics itself and is instructed never to invent a number.
 *
 * Best-effort: any failure (no key, API error, bad JSON) returns
 * { available: false }, so the report always renders unchanged.
 */

import Anthropic from "@anthropic-ai/sdk";

// Reuse the model the news generator already runs on (src/utils/ai/newsGenerator.js).
const MODEL = "claude-sonnet-4-6";

export async function fetchExecutiveSummary(data) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { available: false, error: "ANTHROPIC_API_KEY not set" };

  // Feed ONLY the computed numbers. The model is told to cite them verbatim and
  // invent nothing that is not present here.
  const facts = JSON.stringify(
    {
      month: data.monthLabel,
      previousMonth: data.prevLabel,
      traffic: data.ga,
      website: data.website,
      emails: data.emails,
      affiliates: data.affiliates,
      social: data.social,
    },
    null,
    2
  );

  const prompt = `You are the CFO reviewing Everest Motoring's monthly performance report. You are given the FINAL computed metrics as JSON. Do NOT recalculate anything. Do NOT invent any number, trend, comparison or fact that is not present in the JSON. If a section is marked unavailable or carries an error, ignore it silently — never mention missing data.

Write a brief executive summary for the dealership owner:
- headline: one line stating the single most important thing about the month.
- findings: 3 to 5 items, most important first. For EACH: state what happened (cite the specific figure verbatim from the JSON), why it matters, and what management should do next.

Rules: ground every claim in the JSON; quote figures exactly; no filler, praise or hype; plain business English; South African context (currency is the Rand, "R"). Return STRICT JSON only (no markdown, no prose) in exactly this shape:
{"headline":"...","findings":[{"finding":"...","why":"...","action":"..."}]}

METRICS JSON:
${facts}`;

  try {
    const anthropic = new Anthropic({ apiKey });
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = msg.content?.[0]?.type === "text" ? msg.content[0].text : "";
    const parsed = parseJson(text);
    if (!parsed || !Array.isArray(parsed.findings) || parsed.findings.length === 0) {
      return { available: false, error: "Empty or invalid AI response" };
    }

    return {
      available: true,
      headline: toPdfSafe(parsed.headline),
      findings: parsed.findings
        .slice(0, 5)
        .map((f) => ({
          finding: toPdfSafe(f.finding),
          why: toPdfSafe(f.why),
          action: toPdfSafe(f.action),
        }))
        .filter((f) => f.finding),
    };
  } catch (err) {
    return { available: false, error: err.message || "AI summary failed" };
  }
}

// The report PDF uses built-in Helvetica, which has no glyphs for typographic
// punctuation (em/en dashes, curly quotes, ellipsis, bullets) — they render as
// tofu. AI free-text emits these freely, so normalise to ASCII before render.
function toPdfSafe(s) {
  return String(s || "")
    .replace(/[—–]/g, "-") // em / en dash
    .replace(/[‘’′]/g, "'") // curly single quotes / prime
    .replace(/[“”″]/g, '"') // curly double quotes / double prime
    .replace(/…/g, "...") // ellipsis
    .replace(/[•▪●·]/g, "-") // bullets / middot
    .replace(/ /g, " ") // non-breaking space
    .replace(/\s+/g, " ")
    .trim();
}

// The model may wrap its JSON in ```json fences or stray prose; pull the first
// {...} block and parse it.
function parseJson(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
