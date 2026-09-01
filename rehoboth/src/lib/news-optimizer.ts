import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set. Cannot optimise the article.");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type OptimizeInput = { title: string; excerpt: string; body: string };
export type OptimizedArticle = { title: string; excerpt: string; body: string };

/**
 * Rewrites a draft article for SEO/GEO — never writes a new one. The caller
 * (admin/actions.ts) runs the result back through lib/compliance.ts's screen()
 * before it ever reaches the editor: the system prompt below tells the model
 * not to add a medical claim, but a legal requirement doesn't get to depend on
 * a model actually following instructions, so the code checks too.
 */
export async function optimiseArticle(input: OptimizeInput): Promise<OptimizedArticle> {
  const anthropic = getClient();

  const systemPrompt = `You are an SEO, local (GEO) and AI-answer-engine (Generative Engine Optimisation) editor for Rehoboth Herbal Co., a small herbal farm brand in Low's Creek, Mpumalanga, South Africa, that grows, dries and packs its own herbs, tinctures and natural products.

Rewrite the DRAFT you are given — never write a new article from scratch, only restructure and sharpen what is already there. Optimise simultaneously for:
- CLASSIC SEO: natural keyword use, descriptive <h2>/<h3> headings, scannable paragraphs and lists.
- LOCAL / GEO: reference Low's Creek, Mpumalanga and the farm where the draft already does — never invent a place, date or fact that isn't there.
- AI / ANSWER-ENGINE SEARCH: a clear opening paragraph that directly states what the article is about, plain factual sentences, named entities (plant names, the farm), so an AI assistant can quote it confidently.

STRICT RULES — these are legal requirements, not style preferences:
- South Africa's Medicines and Related Substances Act forbids describing any plant or product as treating, curing, preventing, or having any effect on a medical condition. NEVER add, imply or strengthen any health/medical claim, even one that sounds like traditional wisdom or folklore. You may describe how a plant is grown, harvested, prepared, tastes, smells, or is traditionally used in cooking or as a beverage — never what it does inside the body.
- NEVER invent a fact, date, quantity or detail that is not already in the draft. If the draft is thin, keep the rewrite honest and general rather than padding it with invented specifics.
- Preserve every <img> tag in the draft body EXACTLY as it appears (identical src, alt and data-align attributes, roughly the same position) — you cannot see the picture, so never add, remove or change one.
- Use South African English.
- Body HTML may ONLY use these tags: <h2> <h3> <p> <ul> <ol> <li> <blockquote> <strong> <em> <u> <s> <a href="..."> <img>. No <script>, no <style>, no other tags, no markdown.`;

  const userPrompt = `DRAFT HEADLINE:
${input.title}

DRAFT SUMMARY (shown on article cards, used as the meta description):
${input.excerpt || "(none written yet — write one, one or two sentences, under 155 characters)"}

DRAFT BODY (HTML):
"""
${input.body || "(empty — there is nothing to optimise)"}
"""

Return your response in EXACTLY this format, nothing before or after:
1. A single-line JSON object (no code fences) with exactly these keys: "title" (max 60 characters), "excerpt" (max 155 characters).
2. On its own line, the exact delimiter: ===BODY===
3. After the delimiter, the rewritten body as HTML only, using the allowed tags above.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) throw new Error("No text came back from Claude.");

  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json|html)?\s*/i, "").replace(/```\s*$/i, "").trim();

  const delimiter = "===BODY===";
  const at = raw.indexOf(delimiter);
  if (at === -1) throw new Error("Claude's response was not in the expected format. Try again.");

  const metaRaw = raw.slice(0, at);
  const body = raw.slice(at + delimiter.length).trim();

  const firstBrace = metaRaw.indexOf("{");
  const lastBrace = metaRaw.lastIndexOf("}");
  const jsonSlice = firstBrace !== -1 && lastBrace > firstBrace ? metaRaw.slice(firstBrace, lastBrace + 1) : metaRaw;

  let parsed: { title?: string; excerpt?: string };
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    throw new Error("Claude's response was not in the expected format. Try again.");
  }

  return {
    title: (parsed.title ?? input.title).slice(0, 60),
    excerpt: (parsed.excerpt ?? input.excerpt).slice(0, 155),
    body,
  };
}
