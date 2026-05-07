import { NextResponse } from "next/server";
import { generateAndSaveArticle } from "@/app/api/admin/generate-article/route";

export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
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
    const result = await generateAndSaveArticle(category);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      message: `Monthly article auto-generated: "${result.article.title}"`,
      article: result.article,
    });
  } catch (err: any) {
    console.error("Monthly article cron failed");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
