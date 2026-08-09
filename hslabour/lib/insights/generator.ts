import { createAdminClient } from "@/lib/supabase/admin";

export const CATEGORIES = [
  "Hiring & Workforce",
  "Labour Law & Compliance",
  "Career & Job-Seeking",
  "Employment Trends & Industry",
  "Payroll & HR Management",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface InsightPayload {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
  image_url: string;
}

const UNSPLASH_TERMS: Record<Category, string[]> = {
  "Hiring & Workforce": [
    "recruitment interview",
    "office team hiring",
    "job interview",
    "business handshake",
  ],
  "Labour Law & Compliance": [
    "south africa law",
    "legal documents",
    "labour court",
    "compliance office",
  ],
  "Career & Job-Seeking": [
    "job search",
    "cv resume desk",
    "career professional",
    "office worker",
  ],
  "Employment Trends & Industry": [
    "south africa city business",
    "warehouse workers",
    "construction workers",
    "manufacturing factory",
  ],
  "Payroll & HR Management": [
    "payroll calculator",
    "human resources office",
    "accounting desk",
    "business documents",
  ],
};

// Curated, already-optimised local images shipped with the site (last-resort fallback).
const FALLBACK_IMAGES: Record<Category, string> = {
  "Hiring & Workforce": "/images/parallax/handshake.jpg",
  "Labour Law & Compliance": "/images/parallax/workspace.jpg",
  "Career & Job-Seeking": "/images/parallax/team-meeting.jpg",
  "Employment Trends & Industry": "/images/parallax/warehouse.jpg",
  "Payroll & HR Management": "/images/parallax/office-collab.jpg",
};

/** Balance categories: pick the least-used among recent posts. */
export function pickNextCategory(recentCategories: string[]): Category {
  const counts: Record<string, number> = {};
  for (const c of CATEGORIES) counts[c] = 0;
  for (const rc of recentCategories) if (rc in counts) counts[rc]++;
  const min = Math.min(...CATEGORIES.map((c) => counts[c]));
  const least = CATEGORIES.filter((c) => counts[c] === min);
  return least[Math.floor(Math.random() * least.length)];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---- DeepSeek (OpenAI-compatible chat completions) ---- */

interface DeepSeekResponse {
  choices?: { message?: { content?: string } }[];
}

async function callDeepSeek(system: string, user: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
      temperature: 0.8,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DeepSeek API ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned no content");
  return content;
}

/* ---- Gemini hero image ---- */

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] };
  }[];
}

async function generateAiImage(
  category: Category,
  title: string,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const prompt = `Create a photorealistic, professional editorial hero image for a South African recruitment and labour-broking blog article. Category: "${category}". Article title: "${title}". Tasteful and corporate, no text or logos overlaid, landscape orientation suitable as a website banner.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = (await res.json()) as GeminiResponse;
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part?.inlineData) throw new Error("No image data in Gemini response");
    const { mimeType, data: base64 } = part.inlineData;
    const ext = mimeType.split("/")[1] || "png";
    const buffer = Buffer.from(base64, "base64");
    const supabase = createAdminClient();
    const path = `${slugify(title)}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("insight_images")
      .upload(path, buffer, { contentType: mimeType });
    if (error) throw error;
    return supabase.storage.from("insight_images").getPublicUrl(path).data
      .publicUrl;
  } catch (err) {
    console.error("[insights] Gemini image failed:", err);
    return null;
  }
}

/* ---- Unsplash fallback ---- */

interface UnsplashResponse {
  results?: { urls?: { raw?: string } }[];
}

async function fetchUnsplashImage(category: Category): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  const terms = UNSPLASH_TERMS[category];
  const term = terms[Math.floor(Math.random() * terms.length)];
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        term,
      )}&per_page=20&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          "Accept-Version": "v1",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`Unsplash ${res.status}`);
    const data = (await res.json()) as UnsplashResponse;
    const results = data.results ?? [];
    if (!results.length) return null;
    const pick = results[Math.floor(Math.random() * results.length)];
    const raw = pick.urls?.raw;
    return raw ? `${raw}&w=1200&h=630&fit=crop&q=80&auto=format` : null;
  } catch (err) {
    console.error("[insights] Unsplash failed:", err);
    return null;
  }
}

async function fetchImage(category: Category, title: string): Promise<string> {
  return (
    (await generateAiImage(category, title)) ??
    (await fetchUnsplashImage(category)) ??
    FALLBACK_IMAGES[category]
  );
}

/* ---- generateInsight ---- */

export async function generateInsight(
  category: Category,
  recentTitles: string[],
): Promise<InsightPayload> {
  const system = [
    "You are the content writer for H&S Labour Brokers, a South African recruitment and labour-broking firm operating since 1998.",
    "You write authoritative, genuinely useful articles for South African employers and job seekers.",
    "STYLE RULES:",
    "- South African English (organise, labour, colour, programme).",
    "- Reference SA frameworks accurately where relevant (Labour Relations Act 66 of 1995, BCEA, LRA s198A on TES/deeming, CCMA, B-BBEE, Employment Equity Act, POPIA).",
    "- Practical and clear. Never give specific legal advice; recommend consulting H&S Labour Brokers.",
    "UNIQUE ANGLE (this is what makes the article rank and get cited — do not write a generic checklist):",
    "- Build the article around ONE specific, non-obvious angle or a real position, not a bland 'X things to know' listicle that every other site already has.",
    "- Write from the first-hand perspective of a labour broker operating since 1998: 'what we see when employers get this wrong', 'the compliance step most employers miss', 'what we tell every client who asks about deeming'. Draw on genuine, defensible expertise in SA recruitment and labour law.",
    "- REPLACEABILITY TEST (before you finalise): could an AI answer this reader's question in a single paragraph and make the whole article redundant? If yes, it has no fingerprint of its own — sharpen the angle and add real labour-broking detail until a generic one-paragraph answer could not replace it.",
    "- READER-QUESTION GAP: build the piece around ONE real question an employer or worker would actually type — phrased the way a person asks it on a forum ('do I have to make a temp permanent after three months?'), not the way a marketer titles a page ('Understanding Temporary Employment Services'). Answer it directly in the opening, then cover the part the competing top-ranking pages skip: the caveat, the real cost or risk driver, or the 'it depends on…' they leave out. Do NOT name, quote, or invent a specific forum, thread, or commenter — this is a framing device for choosing the question, not a source to cite.",
    "- HONESTY RULE: adopt the experienced-broker voice, but do NOT invent statistics, client names, case outcomes, or numeric 'data points' presented as proprietary H&S data. Cite real, verifiable SA frameworks and general market reality — a distinct perspective, never fabricated evidence.",
    "- BAD opening (never write like this — generic, no angle, could be posted by any recruitment site): 'Hiring the right employee is important for every business. Here are 5 tips to help you find the best candidates for your company.'",
    "- GOOD opening (this is the bar — first-hand position, specific, immediately useful): 'Nine times out of ten, when an employer calls us after a CCMA referral, the dispute traces back to one thing: they treated a TES placement like a normal hire and skipped the deeming assessment at three months. Here's the exact check we walk every client through before that clock runs out.'",
    "ANTI-SLOP RULES (these are the tells that make copy read as AI-generated — avoid every one):",
    "- No throat-clearing openers ('Here's the thing', 'Let me be clear') and no faux-insight setups ('What nobody tells you', 'The part everyone misses'). State the point.",
    "- No binary contrasts ('It's not X, it's Y' / 'The question isn't X, it's Y') and no negative listing ('Not a X. Not a Y. A Z.'). Say the thing directly.",
    "- No colon reveals (noun phrase, colon, dramatic lowercase reveal) and no rhetorical setups ('What if I told you', 'Think about it:').",
    "- No importance puffery ('marks a pivotal moment', 'plays a vital role', 'stands as a testament'). State the fact and let the reader judge.",
    "- No weasel attribution ('experts agree', 'studies show', 'research suggests'). Name a real, verifiable source or cut the claim — this is the HONESTY RULE restated: never invent authority.",
    "- No trailing '-ing' clauses that pretend to explain significance ('highlighting our commitment to…', 'underscoring…', 'reflecting…'). Give the concrete consequence instead.",
    "- No fake-strong verbs ('serves as a centralised hub for') where 'is' or 'has' is clearer. No synonym cycling — if a word is the right word, repeat it.",
    "- No dramatic fragmentation ('That's it. That's the whole thing.') and no stack of one-line punchy paragraphs. Vary sentence length the way a person does.",
    "- No fake-profound closing line, and no 'In conclusion' / 'Ultimately' / 'Overall' recap paragraph. End on the last concrete point or the CTA.",
    "- Banned words: delve, foster, leverage, utilise, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.",
    "- Banned filler phrases: 'it's worth noting', 'it's important to note', 'at the end of the day', 'when it comes to', 'in today's world', 'in the world of', 'the reality is', 'in this article', 'let's dive in'.",
    "- Em dashes: 1-2 in the whole article at most, and only where a comma or full stop would genuinely read worse. No decorative dashes.",
    "- Formatting: no emoji in headings, no bold sprinkled mid-sentence for emphasis, no bullet list where two sentences of prose read better.",
    "- No rule-of-three padding - three adjectives, three phrases, or three-item lists where you actually have one or two. Use the number of items you really have.",
    "- No 'Despite its X, [subject] faces several challenges... yet continues to thrive' formula, and no manufactured 'Challenges' or 'Future outlook' section unless there is something concrete and specific to say.",
    "- No proving importance by listing coverage ('featured in X, Y and other outlets', 'has a growing social media presence'). Show the specific thing that makes it matter.",
    "- Headings in sentence case, not Title Case. Do not skip heading levels. No horizontal rules between sections.",
    "- No inline-header vertical lists (a run of '**Label:** explanation' bullets down the page) where prose or a plain list reads better.",
    "- Straight quotes and apostrophes only - never curly/smart quotes.",
    "- Never emit model artefacts: no lenticular brackets, no [cite: N] or [span_N] markers, no contentReference or oaicite tags, no dagger symbols, no '[insert ...]' placeholders, no knowledge-cutoff disclaimers ('as of my last update'). Any of these means the draft is broken - rewrite it, do not patch it.",
    "- Banned words (current-model cluster, refresh on model release): showcasing, emphasizing, underscores, testament, additionally, moreover, furthermore, notably, pivotal, seamless, nestled, vibrant, boasts, align with.",
    "- These are signals, not laws. The goal is prose a real person would write, not evading a detector - if a flagged construction is genuinely the clearest way to say something, keep the meaning and rewrite the sentence rather than contorting around the rule.",
    "- Source and expiry: adapted from Wikipedia's 'Signs of AI writing' (WikiProject AI Cleanup). AI tells are model-specific and drift with each release - re-validate the word lists against that guide on every major model release.",
    `- The category for this post is: "${category}".`,
    "- Begin body_md with a one-paragraph **TL;DR** in bold, then a '## Key takeaways' bullet list (for AI/GEO citation).",
    "- End with a section '## How H&S Labour Brokers can help' pointing the reader to the right next step (employers: hire staff; job seekers: browse jobs or submit a CV).",
    recentTitles.length
      ? `- Do NOT repeat or closely paraphrase these recent titles: ${recentTitles.join("; ")}.`
      : "",
    "OUTPUT: Respond with ONLY a JSON object with exactly these keys: title, slug, excerpt, meta_title, meta_description, body_md.",
    "- title: compelling, max 70 chars.",
    "- slug: url-safe lowercase, hyphens only.",
    "- excerpt: 2-3 sentences, max 200 chars.",
    "- meta_title: max 60 chars, include 'H&S Labour Brokers'.",
    "- meta_description: max 160 chars.",
    "- body_md: GitHub-flavoured markdown, 700-1000 words, with ## headings, bullet lists, the TL;DR, key takeaways and the closing CTA.",
  ]
    .filter(Boolean)
    .join("\n");

  const user = `Write a fresh, practical article in the "${category}" category for South African employers and/or job seekers.`;

  let raw = (await callDeepSeek(system, user)).trim();
  // Defensive: strip any ```json … ``` fences the model may add despite json mode.
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }

  let parsed: Omit<InsightPayload, "image_url">;
  try {
    parsed = JSON.parse(raw) as Omit<InsightPayload, "image_url">;
  } catch {
    throw new Error(
      `The AI returned invalid JSON (likely truncated). Try again. Snippet: ${raw.slice(-120)}`,
    );
  }
  const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.title);
  const image_url = await fetchImage(category, parsed.title);

  return {
    title: parsed.title,
    slug,
    excerpt: parsed.excerpt,
    meta_title: parsed.meta_title,
    meta_description: parsed.meta_description,
    body_md: parsed.body_md,
    image_url,
  };
}
