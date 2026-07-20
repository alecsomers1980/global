import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { PAID_STATUSES } from "@/lib/orders";
import { screen } from "@/lib/compliance";

/** A published review as the storefront renders it. */
export type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  staffReply: string;
  /** Display name only — "Anna B." Never the full surname or email (POPIA). */
  authorName: string;
  createdAt: string;
};

type ReviewRow = {
  id: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  staff_reply: string;
  created_at: string;
  author_name: string | null;
};

/** "Anna Bezuidenhout" -> "Anna B." — enough to feel human, no PII leak.
 *  Applied once at insert time; the result is what gets stored. */
export function displayName(fullName: string | null | undefined): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  const [first, ...rest] = parts;
  const initial = rest.length ? ` ${rest[rest.length - 1][0].toUpperCase()}.` : "";
  return `${first}${initial}`;
}

/** Approved reviews for a product, newest first. Public read (RLS already
 *  restricts anon to status='approved'; we filter anyway so staff sessions
 *  don't accidentally render held reviews on the storefront).
 *  Never throws — a broken query must not take down a product page. */
export async function getApprovedReviews(productId: string): Promise<Review[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, verified, staff_reply, created_at, author_name")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("reviews: query failed", error.message);
    return [];
  }

  return (data as unknown as ReviewRow[]).map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title ?? "",
    body: r.body ?? "",
    verified: r.verified,
    staffReply: r.staff_reply ?? "",
    authorName: r.author_name || "Customer",
    createdAt: r.created_at,
  }));
}

/** Why a customer may or may not review — drives what the product page renders. */
export type Eligibility =
  | { canReview: true; orderId: string }
  | { canReview: false; reason: "not-signed-in" | "not-a-buyer" | "already-reviewed" };

/** The verified-buyer gate (docs/reviews-plan.md §2). A customer may review a
 *  product only if they have a fulfilled order containing it.
 *
 *  Matches on EITHER `product_id` (set on legacy rows by
 *  `npm run backfill-order-products`) OR `product_slug` (written by checkout on
 *  new orders) — the two eras of order data store the link differently.
 *
 *  Service-role: order_items has no customer-facing select policy, and this
 *  runs only after we've established the caller's own user id. */
export async function checkEligibility(
  userId: string | null,
  productId: string,
  productSlug: string
): Promise<Eligibility> {
  if (!userId) return { canReview: false, reason: "not-signed-in" };

  const admin = createAdminClient();

  // One review per customer per product (DB-enforced too).
  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) return { canReview: false, reason: "already-reviewed" };

  const { data, error } = await admin
    .from("order_items")
    .select("order_id, orders!inner(id, user_id, status)")
    .or(`product_id.eq.${productId},product_slug.eq.${productSlug}`)
    .eq("orders.user_id", userId)
    .in("orders.status", PAID_STATUSES)
    .limit(1);

  if (error) {
    console.error("reviews: eligibility query failed", error.message);
    return { canReview: false, reason: "not-a-buyer" };
  }
  if (!data || data.length === 0) return { canReview: false, reason: "not-a-buyer" };

  return { canReview: true, orderId: data[0].order_id };
}

export type SubmitResult =
  | { ok: true; status: "approved" | "pending" }
  | { ok: false; error: string };

/** Insert a review. Assumes the caller has ALREADY authenticated the user —
 *  this function re-runs the verified gate itself rather than trusting that.
 *
 *  Auto-approve rule (locked 2026-07-19): verified AND rating >= 4 AND the
 *  compliance screen is clean -> 'approved' (visible immediately). Anything
 *  else -> 'pending' for staff. A compliance flag ALWAYS forces pending,
 *  regardless of star rating. */
export async function submitReview(input: {
  userId: string;
  productId: string;
  productSlug: string;
  rating: number;
  title: string;
  body: string;
}): Promise<SubmitResult> {
  const rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Please choose a star rating from 1 to 5." };
  }
  const title = input.title.trim().slice(0, 120);
  const body = input.body.trim().slice(0, 4000);
  if (body.length < 10) {
    return { ok: false, error: "Please write at least a sentence about the product." };
  }

  const eligibility = await checkEligibility(input.userId, input.productId, input.productSlug);
  if (!eligibility.canReview) {
    if (eligibility.reason === "already-reviewed") {
      return { ok: false, error: "You've already reviewed this product." };
    }
    if (eligibility.reason === "not-signed-in") {
      return { ok: false, error: "Please sign in to leave a review." };
    }
    return {
      ok: false,
      error: "Only customers who purchased this product can review it.",
    };
  }

  const compliance = screen(title, body);
  const status = rating >= 4 && !compliance.flagged ? "approved" : "pending";

  const admin = createAdminClient();

  // Snapshot the abbreviated author name — see migration 0011 for why this is
  // stored rather than joined. Only "Anna B." is persisted.
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", input.userId)
    .maybeSingle();

  const { error } = await admin.from("reviews").insert({
    product_id: input.productId,
    user_id: input.userId,
    order_id: eligibility.orderId,
    rating,
    title,
    body,
    verified: true,
    status,
    author_name: displayName(profile?.full_name),
  });

  if (error) {
    // 23505 = unique(user_id, product_id) — raced with another submission.
    if (error.code === "23505") {
      return { ok: false, error: "You've already reviewed this product." };
    }
    console.error("reviews: insert failed", error.message);
    return { ok: false, error: "Something went wrong saving your review. Please try again." };
  }

  return { ok: true, status };
}
