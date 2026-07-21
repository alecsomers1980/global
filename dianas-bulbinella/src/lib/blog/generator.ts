/**
 * Diana's Bulbinella — automated Journal generator.
 *
 * Drafts a compliant botanical article via the DeepSeek API (OpenAI-compatible,
 * https://api.deepseek.com). Chosen over Anthropic to keep running cost minimal;
 * Diana's manual approval in /admin/blog is the mandatory compliance gate before
 * anything publishes, so the model never publishes unreviewed health copy.
 *
 * COMPLIANCE is enforced in the system prompt straight from docs/compliance-rules.md:
 * no disease names, no treat/cure/prevent verbs, cosmetic + traditional-use framing
 * only. This is the whole legal risk for a botanical brand — do not soften these rules.
 *
 * Style guard mirrors the other client generators (forced-variable SEO): one specific
 * non-obvious angle + first-hand maker voice + a hard no-fabrication rule.
 */

export const CATEGORIES = [
  "Ingredient spotlight",
  "Skincare rituals & routines",
  "South African botanical heritage",
  "Concern guides",
  "Behind the brand",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Existing on-brand images in /public. Diana can swap any post's image in admin. */
const CATEGORY_IMAGE: Record<Category, string> = {
  "Ingredient spotlight": "/images/flowers/marigold.jpg",
  "Skincare rituals & routines": "/images/flowers/lotus.jpg",
  "South African botanical heritage": "/images/flowers/lavender.jpg",
  "Concern guides": "/images/flowers/lotus.jpg",
  "Behind the brand": "/images/flowers/marigold.jpg",
};

const CATEGORY_BRIEF: Record<Category, string> = {
  "Ingredient spotlight":
    "Profile ONE botanical ingredient Diana works with (e.g. Bulbine frutescens, argan oil, myrrh, mastic gum, marula, rooibos, honeybush, saffron, lotus). Cover where it comes from, its heritage and traditional use, how it feels on the skin, and which of our products feature it. Cosmetic + traditional-use framing only.",
  "Skincare rituals & routines":
    "Walk through a simple, sensory skincare or self-care ritual using natural products (e.g. an evening cleanse, a weekly clay treatment, a calming body ritual). Focus on how it feels and fits into daily life — texture, scent, the moment — never on treating a condition.",
  "South African botanical heritage":
    "Tell a story about South African botanical tradition — indigenous plants, small-batch craft, the landscape around White River, Mpumalanga. Connect it to why Diana makes what she makes. Warm, place-rooted, editorial.",
  "Concern guides":
    "Write a gentle guide for ONE cosmetic concern from our range (dry or dull-looking skin, the appearance of fine lines, blemish-prone skin, everyday balance and calm, hair and nails). Frame purely in cosmetic terms — 'the appearance of', 'skin feels', 'supports comfort' — and suggest suitable products.",
  "Behind the brand":
    "Share a behind-the-scenes story: how the products are handmade in small batches in White River, the care that goes into them, cruelty-free ethos, the people and process. Personal, honest, brand-building.",
};

export interface BlogPayload {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
  image_url: string;
}

/** Rotate to whichever category has appeared least among recent posts. */
export function pickNextCategory(recentCategories: string[]): Category {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const rc of recentCategories) {
    if (rc in counts) counts[rc as Category]++;
  }
  const min = Math.min(...CATEGORIES.map((c) => counts[c]));
  const leastUsed = CATEGORIES.filter((c) => counts[c] === min);
  return leastUsed[Math.floor(Math.random() * leastUsed.length)];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SYSTEM_PROMPT = [
  "You are the content writer for Diana's Bulbinella, a South African natural skincare and botanical wellness brand handmade in small batches in White River, Mpumalanga. Founder: Diana Herbst. The brand has ~14 years of heritage and works with indigenous and traditional botanicals (Bulbine frutescens, argan, myrrh, mastic gum, lotus, saffron, royal jelly and more).",
  "You write warm, trustworthy, editorial blog articles for South African customers who care about natural skincare and wellness.",
  "",
  "⚠️ COMPLIANCE — THIS IS A LEGAL REQUIREMENT, NEVER BREAK IT:",
  "South African law (Medicines Act 101 of 1965 / SAHPRA, Foodstuffs Cosmetics & Disinfectants Act 54 of 1972, the ARB Code, and the CPA) forbids cosmetic/complementary products from making medical claims. You MUST NOT:",
  "- Name or imply any disease or condition as something a product acts on: cancer, diabetes, HIV/AIDS, Crohn's, ulcer, hypertension/high blood pressure, cholesterol, arthritis, asthma, psoriasis, eczema, menopause, andropause, thyroid, epilepsy, depression, anxiety (as a condition), stroke, COVID, infection, etc.",
  "- Use treatment verbs: cure, cures, heal, heals, treat, treats, prevent, prevents, kills, eliminates, reverses, remedies.",
  "- Use pharma/therapeutic claims: 'antibacterial', 'antiviral', 'antifungal', 'anti-inflammatory', 'kills bacteria', 'clinically proven', 'medicinal', 'detoxes the [organ]', 'boosts immune system', or name a pathogen.",
  "INSTEAD, only use:",
  "- Cosmetic function: cleanses, moisturises, softens, soothes, conditions, nourishes, protects, refreshes, reduces the appearance of, leaves skin feeling…",
  "- Traditional-use framing for herbal/ingested botanicals: 'traditionally used in South Africa to support…', 'has a long history of traditional use for…' — this describes heritage, NOT efficacy.",
  "- Sensory / lifestyle language: 'a calming ritual', 'a warming massage', 'for a restful evening'.",
  "- Soft, defensible structure/function at most: 'supports skin comfort' — never 'treats eczema'.",
  "If a topic cannot be written without a medical claim, choose a different, compliant angle.",
  "",
  "STYLE RULES:",
  "- South African English (moisturise, colour, favourite, programme).",
  "- UNIQUE ANGLE: build the article around ONE specific, non-obvious angle (e.g. 'why we cold-infuse our marigold oil', 'the one step people skip in an evening ritual'), not a generic explainer every skincare blog already has. Write from the first-hand voice of a maker who blends these products by hand.",
  "- Front-load the core takeaway in the opening paragraph so AI-mode search can cite it.",
  "- HONESTY RULE (critical): adopt the experienced-maker voice, but do NOT invent statistics, study results, specific customer stories presented as real, or 'clinically shown' data. A distinct perspective — never fabricated evidence. Reference only genuine, defensible heritage and cosmetic function.",
  "- End every article with a short closing section headed '## Explore the range' inviting readers to browse Diana's Bulbinella products, without medical promises.",
  "",
  "OUTPUT FORMAT:",
  "Respond with ONLY a valid JSON object (no markdown fences, no commentary) with exactly these keys:",
  '"title","slug","excerpt","meta_title","meta_description","body_md"',
  "Field rules:",
  "- title: compelling, max 70 characters, no disease words.",
  "- slug: url-safe, lowercase, hyphens only.",
  "- excerpt: 2-3 sentence summary, max 200 characters.",
  "- meta_title: SEO title max 60 chars, include \"Diana's Bulbinella\".",
  "- meta_description: SEO description max 160 chars.",
  "- body_md: full article in GitHub-flavoured markdown, 600-900 words, using ## headings, short paragraphs, and the closing '## Explore the range' CTA.",
].join("\n");

interface DeepSeekChoice {
  message?: { content?: string };
}
interface DeepSeekResponse {
  choices?: DeepSeekChoice[];
  error?: { message?: string };
}

/**
 * Generate one compliant article draft. Throws on missing key / bad response so
 * the cron surfaces the failure (it catches and reports).
 */
export async function generateBlogPost({
  category,
  recentTitles,
}: {
  category: Category;
  recentTitles: string[];
}): Promise<BlogPayload> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY environment variable is not set");

  const userPrompt = [
    `Category: "${category}".`,
    CATEGORY_BRIEF[category],
    recentTitles.length
      ? `Do NOT repeat or closely paraphrase these recent titles: ${recentTitles.join("; ")}.`
      : "",
    "Return the JSON object now.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 3000,
      temperature: 1.0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DeepSeek API ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as DeepSeekResponse;
  if (data.error) throw new Error(data.error.message || "DeepSeek error");

  let raw = (data.choices?.[0]?.message?.content ?? "").trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(raw) as Omit<BlogPayload, "image_url">;
  const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.title);

  return {
    title: parsed.title,
    slug,
    excerpt: parsed.excerpt ?? "",
    meta_title: parsed.meta_title ?? parsed.title,
    meta_description: parsed.meta_description ?? parsed.excerpt ?? "",
    body_md: parsed.body_md,
    image_url: CATEGORY_IMAGE[category],
  };
}
