import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { checkEligibility } from "@/lib/reviews";

export const runtime = "nodejs";

/**
 * Can the CURRENT user review this product?
 *
 * Fetched client-side rather than computed in the product page, because
 * product pages are statically generated (`generateStaticParams`) — reading
 * cookies there would make all 201 of them render per-request.
 *
 * Returns only a coarse reason, never anything about the user's orders.
 */
export async function GET(req: Request) {
  try {
    const slug = new URL(req.url).searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ canReview: false, reason: "not-signed-in" });
    }

    const { data: product } = await createPublicClient()
      .from("products")
      .select("id, slug")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const eligibility = await checkEligibility(user.id, product.id, product.slug);

    // Don't leak the order id to the browser — the form doesn't need it.
    return NextResponse.json(
      eligibility.canReview
        ? { canReview: true }
        : { canReview: false, reason: eligibility.reason }
    );
  } catch (err) {
    console.error("GET /api/reviews/eligibility failed", err);
    // Fail closed: no form rather than a form that will be rejected.
    return NextResponse.json({ canReview: false, reason: "not-a-buyer" });
  }
}
