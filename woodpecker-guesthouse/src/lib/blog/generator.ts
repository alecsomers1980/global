import Anthropic from "@anthropic-ai/sdk";
import type { BlogCategory } from "./categories";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Cannot generate blog posts.");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Models sometimes emit raw newlines/tabs inside JSON string values, which is
 * invalid JSON and makes JSON.parse throw "Bad control character in string
 * literal". Walk the text and escape any control character (< 0x20) that
 * appears inside a string literal. (Proven fix, ported from Aloe Signs'
 * news-generator.ts — same failure mode, same fix.)
 */
function escapeJsonControlChars(raw: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    const code = raw.charCodeAt(i);
    if (inString && code < 0x20) {
      if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else out += "\\u" + code.toString(16).padStart(4, "0");
      continue;
    }
    out += ch;
  }
  return out;
}

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
}

export async function generateBlogPost(opts: {
  category: BlogCategory;
  recentTitles: string[];
}): Promise<GeneratedPost> {
  const client = getAnthropicClient();

  const systemPrompt = `You are an expert travel and hospitality content writer for Woodpecker Guesthouse, an affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga, South Africa — minutes from the Kruger National Park and on the Panorama Route. Your writing follows these rules:

- Use South African English: "organise", "colour", "favour", "programme", etc.
- Mention local context where relevant: Hazyview, the Panorama Route (God's Window, Blyde River Canyon, Bourke's Luck Potholes), Kruger National Park gate logistics, Mpumalanga's climate and seasons.
- Be practical, helpful, and educational. Write for the kind of guest who actually books Woodpecker: families, small groups, budget-conscious travellers, and conference/group bookers — not luxury-safari-lodge readers.
- UNIQUE ANGLE (this is what makes the article rank and get cited — do not write a generic listicle): build the piece around ONE specific, non-obvious angle or real position, not a bland "X things to know" list every competitor already has. Write from the first-hand perspective of a guesthouse that has hosted this kind of trip before: "what families forget to pack for a self-drive Kruger day", "why we tell first-timers to book two nights minimum near the gate", "the Panorama Route stop most visitors skip and shouldn't". Front-load the core takeaway in the opening paragraph so AI-mode search can cite it.
- REPLACEABILITY TEST (before you finalise): could an AI answer this reader's question in a single paragraph and make the whole article redundant? If yes, it has no fingerprint of its own — sharpen the angle and add real, concrete detail until a generic one-paragraph answer could not replace it.
- READER-QUESTION GAP: build the piece around ONE real question a traveller would actually type — phrased the way a person asks it ("is Hazyview close enough to Kruger for a day trip?"), not the way a marketer titles a page ("Your Complete Guide to Kruger Day Trips"). Answer it directly in the opening, then cover the part the competing top-ranking pages skip: the caveat, the real timing/cost driver, or the "it depends on…" they leave out. Do NOT name, quote, or invent a specific forum, thread, or commenter — this is a framing device for choosing the question, not a source to cite.
- HONESTY RULE: adopt the experienced-host voice, but do NOT invent guest reviews, guest names, booking statistics, occupancy numbers, or any other "proprietary Woodpecker Guesthouse data" that isn't provided to you. Do NOT invent room names, room counts, prices, or amenities beyond general statements like "family rooms" or "budget rooms" — never a specific rate. Use real, general facts about the region (geography, driving distances, park gate hours as widely known, general travel-planning realities) and the guesthouse's genuine positioning (affordable, family-friendly, close to Kruger) — a distinct perspective, never fabricated evidence.
- ANTI-SLOP RULES (these are the tells that make copy read as AI-generated — avoid every one):
  - No throat-clearing openers ("Here's the thing", "Let me be clear") and no faux-insight setups ("What nobody tells you", "The part everyone misses"). State the point.
  - No binary contrasts ("It's not X, it's Y" / "The question isn't X, it's Y") and no negative listing ("Not a X. Not a Y. A Z."). Say the thing directly.
  - No colon reveals (noun phrase, colon, dramatic lowercase reveal) and no rhetorical setups ("What if I told you", "Think about it:").
  - No importance puffery ("marks a pivotal moment", "plays a vital role", "stands as a testament"). State the fact and let the reader judge.
  - No weasel attribution ("experts agree", "studies show", "research suggests"). Name a real, verifiable source or cut the claim — this is the HONESTY RULE restated: never invent authority.
  - No trailing "-ing" clauses that pretend to explain significance ("highlighting our commitment to…", "underscoring…", "reflecting…"). Give the concrete consequence instead.
  - No fake-strong verbs ("serves as a centralised hub for") where "is" or "has" is clearer. No synonym cycling — if a word is the right word, repeat it.
  - No dramatic fragmentation ("That's it. That's the whole thing.") and no stack of one-line punchy paragraphs. Vary sentence length the way a person does.
  - No fake-profound closing line, and no "In conclusion" / "Ultimately" / "Overall" recap paragraph. End on the last concrete point or the CTA.
  - Banned words: delve, foster, leverage, utilise, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.
  - Banned filler phrases: "it's worth noting", "it's important to note", "at the end of the day", "when it comes to", "in today's world", "in the world of", "the reality is", "in this article", "let's dive in".
  - Em dashes: 1-2 in the whole article at most, and only where a comma or full stop would genuinely read worse. No decorative dashes.
  - Formatting: no emoji in headings, no bold sprinkled mid-sentence for emphasis, no bullet list where two sentences of prose read better.
  - No rule-of-three padding - three adjectives, three phrases, or three-item lists where you actually have one or two. Use the number of items you really have.
  - No 'Despite its X, [subject] faces several challenges... yet continues to thrive' formula, and no manufactured 'Challenges' or 'Future outlook' section unless there is something concrete and specific to say.
  - No proving importance by listing coverage ('featured in X, Y and other outlets', 'has a growing social media presence'). Show the specific thing that makes it matter.
  - Headings in sentence case, not Title Case. Do not skip heading levels. No horizontal rules between sections.
  - No inline-header vertical lists (a run of '**Label:** explanation' bullets down the page) where prose or a plain list reads better.
  - Straight quotes and apostrophes only - never curly/smart quotes.
  - Never emit model artefacts: no lenticular brackets, no [cite: N] or [span_N] markers, no contentReference or oaicite tags, no dagger symbols, no '[insert ...]' placeholders, no knowledge-cutoff disclaimers ('as of my last update'). Any of these means the draft is broken - rewrite it, do not patch it.
  - Banned words (current-model cluster, refresh on model release): showcasing, emphasizing, underscores, testament, additionally, moreover, furthermore, notably, pivotal, seamless, nestled, vibrant, boasts, align with.
  - These are signals, not laws. The goal is prose a real person would write, not evading a detector - if a flagged construction is genuinely the clearest way to say something, keep the meaning and rewrite the sentence rather than contorting around the rule.
  - Source and expiry: adapted from Wikipedia's 'Signs of AI writing' (WikiProject AI Cleanup). AI tells are model-specific and drift with each release - re-validate the word lists against that guide on every major model release.
- End EVERY article with a call-to-action section titled "## Plan your stay at Woodpecker Guesthouse". The section should invite readers to view rooms and get in touch, using only these two relative links: [our rooms](/accommodation) and [contact us](/contact). Do NOT include a phone number, WhatsApp number, email address, or any other contact detail — none is confirmed for this article. Keep the tone warm and welcoming.

The article category is: ${opts.category}. ${
    opts.recentTitles.length
      ? `Do NOT repeat or closely paraphrase any of these recent titles: ${opts.recentTitles.join("; ")}.`
      : ""
  }`;

  const userPrompt = `Write an expert, SEO-optimised blog article for the category "${opts.category}". Follow all the system instructions carefully.

Return your response in EXACTLY this format, with nothing before or after it:
1. A single-line JSON object (no code fences) containing ONLY these keys: "title" (max 70 chars), "slug" (url-safe, lowercase, hyphens only), "excerpt" (max 200 chars), "meta_title" (max 60 chars, include "Woodpecker Guesthouse"), "meta_description" (max 160 chars). Do NOT put the article body in the JSON.
2. On its own line, the exact delimiter: ===BODY===
3. After the delimiter, the full article in GitHub-flavoured Markdown (600-900 words, use ## headings and bullet points, ending with the "## Plan your stay at Woodpecker Guesthouse" section).`;

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new Error("No text content returned from Claude.");
  }

  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json|markdown)?\s*/i, "").replace(/```\s*$/i, "").trim();

  const delimiter = "===BODY===";
  const delimiterIndex = raw.indexOf(delimiter);

  let metaRaw = raw;
  let extractedBody = "";
  if (delimiterIndex !== -1) {
    metaRaw = raw.slice(0, delimiterIndex);
    extractedBody = raw.slice(delimiterIndex + delimiter.length).trim();
  }

  const firstBrace = metaRaw.indexOf("{");
  const lastBrace = metaRaw.lastIndexOf("}");
  const jsonSlice = firstBrace !== -1 && lastBrace > firstBrace ? metaRaw.slice(firstBrace, lastBrace + 1) : metaRaw;

  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    parsed = JSON.parse(escapeJsonControlChars(jsonSlice));
  }

  const title = String(parsed.title ?? "Untitled").trim().slice(0, 70);
  const slug = parsed.slug ? slugify(String(parsed.slug)) : slugify(title);
  const excerpt = String(parsed.excerpt ?? "").slice(0, 200);
  const meta_title = String(parsed.meta_title ?? title).slice(0, 60);
  const meta_description = String(parsed.meta_description ?? excerpt).slice(0, 160);
  let body_md = extractedBody || String(parsed.body_md ?? "");

  const ctaHeading = "## Plan your stay at Woodpecker Guesthouse";
  if (!body_md.includes(ctaHeading)) {
    body_md += `\n\n${ctaHeading}\n\nReady to see the Panorama Route and Kruger for yourself? Browse [our rooms](/accommodation) or [contact us](/contact) to plan your stay.\n`;
  }

  return { title, slug, excerpt, meta_title, meta_description, body_md };
}
