import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { submitReview } from "@/lib/reviews";

export const runtime = "nodejs";

/**
 * Submit a product review.
 *
 * Verified buyers only: the caller must be signed in AND have a fulfilled order
 * containing this product. The gate, the compliance screen and the auto-approve
 * decision all live in `lib/reviews.ts` and run server-side — the client sends
 * only the slug, rating and text, and cannot influence `verified` or `status`.
 *
 * The insert itself uses the service-role client (there is deliberately no
 * anon/authenticated insert policy on `reviews`), exactly like orders.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.slug !== "string") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Resolve the slug server-side — never trust a product id from the client.
    const { data: product, error: productErr } = await createPublicClient()
      .from("products")
      .select("id, slug")
      .eq("slug", body.slug)
      .eq("active", true)
      .maybeSingle();
    if (productErr) throw productErr;
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const result = await submitReview({
      userId: user.id,
      productId: product.id,
      productSlug: product.slug,
      rating: Number(body.rating),
      title: typeof body.title === "string" ? body.title : "",
      body: typeof body.body === "string" ? body.body : "",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      message:
        result.status === "approved"
          ? "Thank you! Your review is now live."
          : "Thank you! Your review has been submitted and will appear once checked.",
    });
  } catch (err) {
    console.error("POST /api/reviews failed", err);
    return NextResponse.json(
      { error: "Something went wrong saving your review. Please try again." },
      { status: 500 }
    );
  }
}
