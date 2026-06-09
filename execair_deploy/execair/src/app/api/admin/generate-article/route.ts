import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { sanitizeArticleHtml } from "@/lib/sanitize";

const CATEGORIES = [
  "HVAC Tips",
  "Energy Efficiency",
  "Maintenance",
  "Industry News",
  "Buying Guide",
];

function getPrompt(category: string): string {
  return `You are a senior HVAC copywriter for Exec-Air, South Africa's leading air conditioning company. Write a complete, publish-ready article for the Exec-Air website.

Category: ${category}

Requirements:
1. Write a compelling SEO-optimized title (6-10 words)
2. Write an excerpt (2-3 sentences, 150-200 chars)
3. Write the full article body as clean HTML (use only <h2>, <h3>, <p>, <ul>, <li>, <strong> tags — no <html>, <body>, or <head> tags)
4. The article should be 600-900 words of HTML body content
5. Naturally include HVAC keywords relevant to South Africa (air conditioning, energy efficiency, climate control, cooling solutions, indoor air quality, etc.)
6. Include practical, actionable advice that leads to a sale or enquiry
7. Professional but warm tone — speak to both homeowners and business owners
8. Include at least one bullet-point list
9. End with a natural call-to-action that mentions contacting Exec-Air for a quote or consultation
10. Mention South Africa / South African context at least once naturally

Return ONLY valid JSON in this exact format — no markdown, no backticks, no commentary:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "...",
  "category": "${category}",
  "cta_text": "...",
  "cta_url": "/contact-us"
}

The slug should be derived from the title (lowercase, dashes, max 80 chars).`;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateAndSaveArticle(category: string) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { ok: false as const, status: 500, error: "No AI API key configured" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      ...(process.env.OPENROUTER_API_KEY
        ? {
            "HTTP-Referer": "https://execair.co.za",
            "X-Title": "Exec-Air Article Generator",
          }
        : {}),
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_API_KEY ? "openai/gpt-4o" : "gpt-4o",
      messages: [{ role: "user", content: getPrompt(category) }],
      temperature: 0.8,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    return { ok: false as const, status: 502, error: "AI service unavailable" };
  }

  const json = await response.json();
  const raw = json.choices?.[0]?.message?.content?.trim();
  if (!raw) return { ok: false as const, status: 500, error: "Empty response from AI" };

  let parsed: any;
  try {
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    return { ok: false as const, status: 500, error: "Failed to parse AI response" };
  }

  const title = String(parsed.title || "").slice(0, 200);
  const slug = String(parsed.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
  if (!title || !slug) {
    return { ok: false as const, status: 500, error: "Generated article missing title/slug" };
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title,
      slug,
      excerpt: String(parsed.excerpt || "").slice(0, 500),
      content: sanitizeArticleHtml(String(parsed.content || "")),
      category: String(parsed.category || category).slice(0, 80),
      author: "Exec-Air",
      cta_text: parsed.cta_text ? String(parsed.cta_text).slice(0, 120) : null,
      cta_url: parsed.cta_url ? String(parsed.cta_url).slice(0, 200) : "/contact-us",
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, status: 409, error: "Slug already exists", generated: parsed };
    }
    return { ok: false as const, status: 500, error: "Failed to save article", generated: parsed };
  }

  return { ok: true as const, article: data, generated: parsed };
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const category =
      typeof body.category === "string" && CATEGORIES.includes(body.category)
        ? body.category
        : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    const result = await generateAndSaveArticle(category);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, generated: (result as any).generated },
        { status: result.status }
      );
    }
    return NextResponse.json(
      { success: true, article: result.article, generated: result.generated },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Generate article error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
