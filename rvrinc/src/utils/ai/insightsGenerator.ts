import Anthropic from "@anthropic-ai/sdk";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  "RAF legislation",
  "case studies",
  "legal updates of South Africa",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_UNSPLASH_TERMS: Record<Category, string[]> = {
  "RAF legislation": [
    "south africa law",
    "south african parliament",
    "legal documents south africa",
    "constitution south africa",
  ],
  "case studies": [
    "car accident south africa",
    "road accident scene",
    "hospital emergency south africa",
    "ambulance south africa",
  ],
  "legal updates of South Africa": [
    "pretoria court building",
    "south africa court",
    "cape town high court",
    "south african gavel",
  ],
};

const FALLBACK_IMAGES: Record<Category, string[]> = {
  "RAF legislation": [
    "https://images.unsplash.com/photo-1456324477522-7h0690a6ae32?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589829532587-6d9c5b4d7c9c?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556484687-306881446d94?w=1200&h=630&fit=crop&q=80",
  ],
  "case studies": [
    "https://images.unsplash.com/photo-1544636331-e73f7f7c58eb?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517694057981-7a9279b2d82f?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530024006650-4f4be5e7b504?w=1200&h=630&fit=crop&q=80",
  ],
  "legal updates of South Africa": [
    "https://images.unsplash.com/photo-1577563908411-6241d7debc7c?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524786205415-f2e7a264c5c2?w=1200&h=630&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507646227500-9135ef79a0e2?w=1200&h=630&fit=crop&q=80",
  ],
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InsightPayload {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
  image_url: string;
}

interface GenerateInsightOptions {
  category: Category;
  recentTitles: string[];
}

/* ------------------------------------------------------------------ */
/*  Module-level state                                                 */
/* ------------------------------------------------------------------ */

const servedImageUrls = new Set<string>();

/* ------------------------------------------------------------------ */
/*  Anthropic client (lazy-init)                                       */
/* ------------------------------------------------------------------ */

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    _anthropic = new Anthropic({ apiKey });
  }
  return _anthropic;
}

/* ------------------------------------------------------------------ */
/*  pickNextCategory                                                   */
/* ------------------------------------------------------------------ */

function pickNextCategory(recentCategories: Category[]): Category {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) counts[cat] = 0;
  for (const rc of recentCategories) {
    if (rc in counts) counts[rc]++;
  }
  const minCount = Math.min(...CATEGORIES.map((c) => counts[c]));
  const leastUsed = CATEGORIES.filter((c) => counts[c] === minCount);
  return leastUsed[Math.floor(Math.random() * leastUsed.length)];
}

/* ------------------------------------------------------------------ */
/*  AI image generation (Gemini "Nano Banana")                         */
/* ------------------------------------------------------------------ */

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

interface GeminiInlinePart {
  inlineData?: { mimeType: string; data: string };
}

interface GeminiGenerateResponse {
  candidates?: { content?: { parts?: GeminiInlinePart[] } }[];
}

async function generateAiImage(
  category: Category,
  title: string,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Create a photorealistic, professional editorial hero image for a South African legal blog article. Category: "${category}". Article title: "${title}". The image must depict the scene tastefully (no graphic injuries, no visible faces in distress, no text or logos overlaid). Landscape orientation, suitable as a website banner.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini API ${res.status}: ${body.slice(0, 200)}`);
    }

    const data: GeminiGenerateResponse = await res.json();
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part?.inlineData) throw new Error("No image data in Gemini response");

    const { mimeType, data: base64 } = part.inlineData;
    const extension = mimeType.split("/")[1] || "png";
    const buffer = Buffer.from(base64, "base64");

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const path = `${slugify(title)}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("insight_images")
      .upload(path, buffer, { contentType: mimeType });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("insight_images")
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("[insightsGenerator] Gemini image generation failed:", err);
    return null;
  }
}

async function fetchImage(category: Category, title: string): Promise<string> {
  const aiImage = await generateAiImage(category, title);
  if (aiImage) return aiImage;
  return fetchUnsplashImage(category);
}

/* ------------------------------------------------------------------ */
/*  Unsplash image fetch                                               */
/* ------------------------------------------------------------------ */

interface UnsplashPhoto {
  urls: { raw: string; regular: string; small: string };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

async function fetchUnsplashImage(category: Category): Promise<string> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("[insightsGenerator] UNSPLASH_ACCESS_KEY not set — using fallback image");
    return pickFallbackImage(category);
  }

  const terms = CATEGORY_UNSPLASH_TERMS[category];
  const term = terms[Math.floor(Math.random() * terms.length)];

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        term,
      )}&per_page=30&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Unsplash API ${res.status}: ${body.slice(0, 200)}`);
    }

    const data: UnsplashSearchResponse = await res.json();
    if (!data.results?.length) throw new Error("Empty Unsplash results");

    const fresh = data.results.filter((r) => !servedImageUrls.has(r.urls.raw));
    const pool = fresh.length > 0 ? fresh : data.results;
    const pick = pool[Math.floor(Math.random() * pool.length)];

    const imageUrl = `${pick.urls.raw}&w=1200&h=630&fit=crop&q=80&auto=format&utm_source=rvr_inc&utm_medium=referral`;
    servedImageUrls.add(pick.urls.raw);
    return imageUrl;
  } catch (err) {
    console.error("[insightsGenerator] Unsplash fetch failed:", err);
    return pickFallbackImage(category);
  }
}

function pickFallbackImage(category: Category): string {
  const pool = FALLBACK_IMAGES[category];
  const fresh = pool.filter((u) => !servedImageUrls.has(u));
  const source = fresh.length > 0 ? fresh : pool;
  const pick = source[Math.floor(Math.random() * source.length)];
  servedImageUrls.add(pick);
  return pick;
}

/* ------------------------------------------------------------------ */
/*  Slug helper                                                        */
/* ------------------------------------------------------------------ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ */
/*  generateInsight                                                    */
/* ------------------------------------------------------------------ */

async function generateInsight({
  category,
  recentTitles,
}: GenerateInsightOptions): Promise<InsightPayload> {
  const client = getAnthropic();

  const systemPrompt = [
    "You are the content writer for Roets & Van Rensburg (RVR Inc), a South African law firm that specialises exclusively in Road Accident Fund (RAF) claims.",
    "You write authoritative yet accessible blog articles for South Africans who have been injured in road accidents and need to understand their rights.",
    "",
    "STYLE RULES:",
    "- Write in South African English (organise, labour, colour, programme, etc.).",
    "- Reference SA legislation accurately (e.g. Road Accident Fund Act 56 of 1996, Road Accident Fund Amendment Act 19 of 2005, RAF v Mdeyane, etc.).",
    "- Be empathetic toward accident victims and their families.",
    "- Never give specific legal advice; always recommend consulting RVR Inc attorneys.",
    "UNIQUE ANGLE (this is what makes the article rank and get cited — do not write a generic explainer every legal site already has):",
    "- Build the article around ONE specific, non-obvious angle or real position (e.g. 'the RAF claim step most victims get wrong that quietly reduces their payout'), not a bland overview.",
    "- Write from the first-hand perspective of attorneys who handle RAF claims daily: 'what we see when a claim stalls', 'the mistake that costs claimants the most', 'the first thing we check on every new file'. Draw on genuine, defensible RAF-practice expertise.",
    "- Front-load the core takeaway in the opening so AI-mode search can cite it.",
    "- REPLACEABILITY TEST (before you finalise): could an AI answer this reader's question in a single paragraph and make the whole article redundant? If yes, it has no fingerprint of its own — sharpen the angle and add real RAF-practice detail until a generic one-paragraph answer could not replace it.",
    "- READER-QUESTION GAP: build the piece around ONE real question a claimant or family member would actually type — phrased the way a worried person asks it ('how long does a RAF claim actually take to pay out?'), not the way a firm titles a page ('The RAF Claims Process Explained'). Answer it directly in the opening, then cover the part the competing top-ranking pages skip: the caveat, the step that causes most delays, or the 'it depends on…' they leave out. Do NOT name, quote, or invent a specific forum, thread, or commenter — this is a framing device for choosing the question, not a source to cite.",
    "- HONESTY RULE (critical for a law firm): adopt the experienced-attorney voice, but do NOT invent statistics, real client names, specific case outcomes, or numeric 'data points' presented as proprietary RVR data. Cite only real, verifiable legislation/judgments; keep case studies clearly illustrative and anonymised as already instructed. A distinct perspective — never fabricated evidence.",
    "ANTI-SLOP RULES (these are the tells that make copy read as AI-generated — avoid every one):",
    "- No throat-clearing openers ('Here's the thing', 'Let me be clear') and no faux-insight setups ('What nobody tells you', 'The part everyone misses'). State the point.",
    "- No binary contrasts ('It's not X, it's Y' / 'The question isn't X, it's Y') and no negative listing ('Not a X. Not a Y. A Z.'). Say the thing directly.",
    "- No colon reveals (noun phrase, colon, dramatic lowercase reveal) and no rhetorical setups ('What if I told you', 'Think about it:').",
    "- No importance puffery ('marks a pivotal moment', 'plays a vital role', 'stands as a testament'). State the fact and let the reader judge.",
    "- No weasel attribution ('experts agree', 'studies show', 'research suggests'). Name the real, verifiable statute or judgment or cut the claim — this is the HONESTY RULE restated: never invent authority.",
    "- No trailing '-ing' clauses that pretend to explain significance ('highlighting our commitment to…', 'underscoring…', 'reflecting…'). Give the concrete consequence instead.",
    "- No fake-strong verbs ('serves as a centralised hub for') where 'is' or 'has' is clearer. No synonym cycling — if a word is the right word, repeat it.",
    "- No dramatic fragmentation ('That's it. That's the whole thing.') and no stack of one-line punchy paragraphs. Vary sentence length the way a person does.",
    "- No fake-profound closing line, and no 'In conclusion' / 'Ultimately' / 'Overall' recap paragraph. End on the last concrete point or the CTA.",
    "- Banned words: delve, foster, leverage, utilise, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.",
    "- Banned filler phrases: 'it's worth noting', 'it's important to note', 'at the end of the day', 'when it comes to', 'in today's world', 'in the world of', 'the reality is', 'in this article', 'let's dive in'.",
    "- Em dashes: 1-2 in the whole article at most, and only where a comma or full stop would genuinely read worse. No decorative dashes.",
    "- Formatting: no emoji in headings, no bold sprinkled mid-sentence for emphasis, no bullet list where two sentences of prose read better.",
    "- End every article with a call-to-action section headed '## Need Help with Your RAF Claim?' encouraging readers to contact RVR Inc for a free consultation.",
    `- The category for this post is: "${category}"`,
    recentTitles.length
      ? `- Do NOT repeat or closely paraphrase these recent titles: ${recentTitles.join("; ")}`
      : "",
    "",
    "OUTPUT FORMAT:",
    "Respond with ONLY valid JSON — no markdown fences, no commentary. The JSON must have exactly these keys:",
    '"title","slug","excerpt","meta_title","meta_description","body_md"',
    "",
    "Field rules:",
    "- title: compelling, max 70 characters",
    "- slug: url-safe, lowercase, hyphens only",
    "- excerpt: 2-3 sentence summary, max 200 characters",
    '- meta_title: SEO title, max 60 chars, include "RVR Inc" or "Roets & Van Rensburg"',
    "- meta_description: SEO description, max 160 characters",
    "- body_md: full article in GitHub-flavoured markdown, 600-900 words, use ## headings, bullet points, and a closing CTA",
  ].join("\\n");

  const userPrompt =
    category === "RAF legislation"
      ? "Write an article about current or recent RAF legislation in South Africa. Discuss amendments, policy shifts, or statutory frameworks that affect claimants. Make it practical and informative for someone who may need to file an RAF claim."
      : category === "case studies"
        ? "Write a case-study article based loosely on a publicly available South African court judgment involving an RAF claim, or create a realistic anonymised scenario. Discuss the facts, legal principles applied, challenges faced, and the outcome. State clearly that it is illustrative and not legal advice."
        : "Write an article about recent legal updates in South Africa that are relevant to road-accident victims or RAF claimants. This could include court judgments, regulatory changes, procedural notices from the Road Accident Fund, the Compensation Fund, or the Department of Transport.";

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) throw new Error("No text block found in Anthropic response");

  let raw = textBlock.text.trim();

  if (raw.startsWith("\`\`\`")) {
    raw = raw.replace(/^\`\`\`(?:json)?\n?/, "").replace(/\n?\`\`\`$/, "");
  }

  const parsed = JSON.parse(raw) as Omit<InsightPayload, "image_url">;

  parsed.slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.title);

  const image_url = await fetchImage(category, parsed.title);

  return {
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt,
    meta_title: parsed.meta_title,
    meta_description: parsed.meta_description,
    body_md: parsed.body_md,
    image_url,
  };
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export { generateInsight, pickNextCategory, CATEGORIES };
export type { Category, InsightPayload, GenerateInsightOptions };
