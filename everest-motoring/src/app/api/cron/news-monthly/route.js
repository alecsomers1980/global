import { NextResponse } from "next/server";
import { generateNewsPost } from "@/app/admin/news/actions";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        // No secret configured — only allow in dev.
        return process.env.NODE_ENV !== "production";
    }
    const authHeader = request.headers.get("authorization") || "";
    return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const post = await generateNewsPost({ autoPublish: true });
        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                slug: post.slug,
                title: post.title,
                category: post.category,
                status: post.status,
            },
        });
    } catch (err) {
        console.error("[cron/news-monthly] failed:", err);
        if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
            try {
                const Sentry = await import("@sentry/nextjs");
                Sentry.captureException(err, { tags: { cron: "news-monthly" } });
            } catch { /* sentry not installed */ }
        }
        return NextResponse.json(
            { success: false, error: err.message || "Generation failed" },
            { status: 500 }
        );
    }
}
