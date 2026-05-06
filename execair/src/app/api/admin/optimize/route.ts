import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/optimize — AI-optimize a project description for SEO/GEO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, name, sector } = body;

    if (!description) {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }

    const systemPrompt = `You are an SEO and GEO (Generative Engine Optimization) expert for an HVAC company in South Africa called Exec-Air. Your task is to rewrite project descriptions to be:

1. Rich in relevant HVAC keywords (air conditioning, ventilation, cooling, heating, climate control, etc.)
2. Location-specific where possible
3. Written in a professional but engaging tone
4. Clear about the equipment used and the value delivered
5. Optimized for both traditional search engines AND AI-powered search (GEO)
6. Include relevant semantic entities (equipment types, building types, location cues)
7. Between 2-4 sentences, factual, no fluff
8. Mention specific South African context where relevant

Return ONLY the rewritten description text, no quotes, no commentary.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY}`,
        ...(process.env.OPENROUTER_API_KEY ? {
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://execair.co.za",
          "X-Title": "Exec-Air Admin",
        } : {}),
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_API_KEY ? "openai/gpt-4o" : "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Project: ${name || "HVAC Project"}\nSector: ${sector || "Commercial"}\nOriginal: ${description}\n\nRewrite this to be longer and more detailed for SEO/GEO:` },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI optimize error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const json = await response.json();
    const optimized = json.choices?.[0]?.message?.content?.trim();

    if (!optimized) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    return NextResponse.json({ optimized });
  } catch (err: any) {
    console.error("Optimize API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
