import { NextResponse } from "next/server";

export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${secret}`;
}

const CATEGORIES = [
  "HVAC Tips",
  "Energy Efficiency",
  "Maintenance",
  "Industry News",
  "Buying Guide",
];

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only run on the 2nd of the month
  const today = new Date();
  if (today.getDate() !== 2) {
    return NextResponse.json({
      success: false,
      message: "Not the 2nd of the month — skipping auto-generation",
      day: today.getDate(),
    });
  }

  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/admin/generate-article`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: `Monthly article auto-generated: "${data.article.title}"`,
        article: data.article,
      });
    }

    return NextResponse.json({
      success: false,
      error: data.error || "Generation failed",
    });
  } catch (err: any) {
    console.error("Monthly article cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
