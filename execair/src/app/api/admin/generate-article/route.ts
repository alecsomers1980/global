import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const category = body.category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(process.env.OPENROUTER_API_KEY ? {
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://execair.co.za",
          "X-Title": "Exec-Air Article Generator",
        } : {}),
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_API_KEY ? "openai/gpt-4o" : "gpt-4o",
        messages: [{ role: "user", content: getPrompt(category) }],
        temperature: 0.8,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Article generation failed:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content?.trim();

    if (!raw) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Parse the JSON from the response (handle potential markdown wrapping)
    let parsed;
    try {
      // Strip possible markdown code block
      const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    // Save to database
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const saveUrl = `${baseUrl}/api/articles`;

    const res = await fetch(saveUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: parsed.title,
        slug: parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80),
        excerpt: parsed.excerpt,
        content: parsed.content,
        category: parsed.category || category,
        cta_text: parsed.cta_text || "Ready to improve your climate control?",
        cta_url: parsed.cta_url || "/contact-us",
        published: true,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return NextResponse.json({ error: errData.error || "Failed to save article", generated: parsed }, { status: 500 });
    }

    const saved = await res.json();

    return NextResponse.json({
      success: true,
      article: saved,
      generated: parsed,
    }, { status: 201 });
  } catch (err: any) {
    console.error("Generate article error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
