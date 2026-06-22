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
