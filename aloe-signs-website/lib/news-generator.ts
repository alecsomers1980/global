import Anthropic from "@anthropic-ai/sdk";
import {
  NewsCategory,
  FALLBACK_IMAGES,
  CATEGORY_UNSPLASH_TERMS,
} from "./news-categories";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is not set. Cannot generate news articles."
      );
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

const usedImageUrls = new Set<string>();

async function fetchImage(category: NewsCategory): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const terms = CATEGORY_UNSPLASH_TERMS[category];
  const searchTerm = terms[Math.floor(Math.random() * terms.length)];

  // Try Unsplash API if key is present
  if (accessKey) {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          searchTerm
        )}&per_page=30&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
            "Accept-Version": "v1",
          },
        }
      );
      if (!response.ok) throw new Error(`Unsplash API error: ${response.status}`);
      const data = await response.json();
      const results = data?.results;
      if (results && results.length > 0) {
        const freshUrls = results
          .map((photo: any) => photo?.urls?.raw)
          .filter((raw: string) => !!raw)
          .filter((raw: string) => !usedImageUrls.has(raw))
          .map((raw: string) => `${raw}&w=1200&h=630&fit=crop&q=80&auto=format`);

        let chosen: string | undefined;
        if (freshUrls.length > 0) {
          chosen = freshUrls[Math.floor(Math.random() * freshUrls.length)];
        } else {
          // All returned URLs are already used; fallback to a random result regardless
          const anyRaw = results[Math.floor(Math.random() * results.length)]?.urls?.raw;
          if (anyRaw) chosen = `${anyRaw}&w=1200&h=630&fit=crop&q=80&auto=format`;
        }

        if (chosen) {
          usedImageUrls.add(chosen);
          return chosen;
        }
      }
    } catch (error) {
      console.error("Unsplash image fetch failed, using fallback:", error);
    }
  }

  // Fallback to static Unsplash URLs
  const fallback = FALLBACK_IMAGES[category];
  const fallbackUrl = fallback[Math.floor(Math.random() * fallback.length)];
  usedImageUrls.add(fallbackUrl);
  return fallbackUrl;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Models sometimes emit raw newlines/tabs inside JSON string values (e.g. the
 * markdown body_md), which is invalid JSON and makes JSON.parse throw
 * "Bad control character in string literal". Walk the text and escape any
 * control character (< 0x20) that appears inside a string literal.
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

export interface NewsArticle {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
  image_url: string;
}

export async function generateNewsArticle(opts: {
  category: NewsCategory;
  recentTitles: string[];
}): Promise<NewsArticle> {
  const client = getAnthropicClient();

  const systemPrompt = `You are an expert content writer for Aloe Signs, a leading South African signage and large-format printing company based in Johannesburg, Gauteng, serving the whole country. Your writing follows these rules:

- Use South African English: "organise", "colour", "favour", "programme", etc.
- Mention local context where relevant: Gauteng, Johannesburg, South African business climate, load-shedding considerations, SANS standards (e.g., SANS 1186 for safety signs), the Occupational Health and Safety Act (OHS Act), BBBEE, etc.
- Be practical, helpful, and educational. Write for business owners, marketing managers, facilities managers, or safety officers – not a hard-sell.
- UNIQUE ANGLE (this is what makes the article rank and get cited — do not write a generic listicle): build the piece around ONE specific, non-obvious angle or real position, not a bland "X things to know" list every competitor already has. Write from the first-hand perspective of a working signage & large-format print shop: "the brief detail clients most often get wrong", "what we check before quoting a wrap", "why we push back when a customer asks for X". Front-load the core takeaway in the opening paragraph so AI-mode search can cite it.
- REPLACEABILITY TEST (before you finalise): could an AI answer this reader's question in a single paragraph and make the whole article redundant? If yes, it has no fingerprint of its own — sharpen the angle and add real Aloe Signs shop-floor detail until a generic one-paragraph answer could not replace it.
- READER-QUESTION GAP: build the piece around ONE real question a customer would actually type — phrased the way a person asks it in a forum or an email ("can I put vinyl over a textured wall?"), not the way a marketer titles a page ("Vinyl Wall Graphics: A Complete Guide"). Answer it directly in the opening, then cover the part the competing top-ranking pages skip: the caveat, the real cost driver, or the "it depends on…" they leave out. Do NOT name, quote, or invent a specific forum, thread, or commenter — this is a framing device for choosing the question, not a source to cite.
- HONESTY RULE: adopt the experienced-shop voice, but do NOT invent statistics, client names, project outcomes, or numeric "data points" presented as proprietary Aloe Signs data. Use real, general industry facts (materials, SANS standards, print/finishing realities) and the company's genuine positioning — a distinct perspective, never fabricated evidence.
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
- End EVERY article with a call-to-action section titled "## Get a Quote from Aloe Signs". The section should invite readers to contact Aloe Signs for a free consultation and quote, and provide the phone number 011 693 2600 and WhatsApp 068 883 8049. Keep the tone warm and professional.

The article category is: ${opts.category}. ${
    opts.recentTitles.length
      ? `Do NOT repeat or closely paraphrase any of these recent titles: ${opts.recentTitles.join("; ")}.`
      : ""
  }`;

  const userPrompt = `Write an expert, SEO-optimised blog article for the category "${opts.category}". Follow all the system instructions carefully.

Return your response in EXACTLY this format, with nothing before or after it:
1. A single-line JSON object (no code fences) containing ONLY these keys: "title" (max 70 chars), "slug" (url-safe, lowercase, hyphens only), "excerpt" (max 200 chars), "meta_title" (max 60 chars, include "Aloe Signs"), "meta_description" (max 160 chars). Do NOT put the article body in the JSON.
2. On its own line, the exact delimiter: ===BODY===
3. After the delimiter, the full article in GitHub-flavoured Markdown (600-900 words, use ## headings and bullet points, ending with the "## Get a Quote from Aloe Signs" section).`;

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

  // Strip any wrapping code fences the model may add.
  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json|markdown)?\s*/i, "").replace(/```\s*$/i, "").trim();

  // Preferred format: single-line JSON metadata, then "===BODY===", then raw markdown.
  // Keeping the large body OUT of the JSON avoids truncation / control-char / unescaped-quote
  // parse failures — a cut-off response just yields a shorter body, never a broken parse.
  const delimiter = "===BODY===";
  const delimiterIndex = raw.indexOf(delimiter);

  let metaRaw = raw;
  let extractedBody = "";
  if (delimiterIndex !== -1) {
    metaRaw = raw.slice(0, delimiterIndex);
    extractedBody = raw.slice(delimiterIndex + delimiter.length).trim();
  }

  // Isolate the JSON object within the metadata portion (first { to last }).
  const firstBrace = metaRaw.indexOf("{");
  const lastBrace = metaRaw.lastIndexOf("}");
  const jsonSlice =
    firstBrace !== -1 && lastBrace > firstBrace
      ? metaRaw.slice(firstBrace, lastBrace + 1)
      : metaRaw;

  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    // Retry after escaping raw control characters inside string literals.
    parsed = JSON.parse(escapeJsonControlChars(jsonSlice));
  }

  // Build article with safe defaults
  const title = String(parsed.title ?? "Untitled").trim().slice(0, 70);
  const slug =
    parsed.slug
      ? slugify(String(parsed.slug))
      : slugify(title);
  const excerpt = String(parsed.excerpt ?? "").slice(0, 200);
  const meta_title = String(parsed.meta_title ?? title).slice(0, 60);
  const meta_description = String(parsed.meta_description ?? excerpt).slice(0, 160);
  const body_md = extractedBody || String(parsed.body_md ?? "");

  // Ensure CTA is present (basic check, but trust the AI mostly)
  const ctaHeading = "## Get a Quote from Aloe Signs";
  if (!body_md.includes(ctaHeading)) {
    // Append a fallback CTA if missing
    const fallbackCta = `\n\n${ctaHeading}\n\nNeed expert signage for your business? Contact Aloe Signs today for a free consultation and quotation. Call us on 011 693 2600 or WhatsApp 068 883 8049. Our team in Johannesburg serves clients across Gauteng and nationwide.\n`;
    const finalBody = body_md + fallbackCta;
    return {
      title,
      slug,
      excerpt,
      meta_title,
      meta_description,
      body_md: finalBody,
      image_url: await fetchImage(opts.category),
    };
  }

  return {
    title,
    slug,
    excerpt,
    meta_title,
    meta_description,
    body_md,
    image_url: await fetchImage(opts.category),
  };
}