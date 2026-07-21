import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { screen } from "@/lib/compliance";
import ReviewControls from "@/components/admin/ReviewControls";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "hidden", label: "Hidden" },
] as const;

type ReviewRow = {
  id: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  verified: boolean;
  staff_reply: string;
  author_name: string;
  created_at: string;
  products: { title: string; slug: string } | null;
};

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  // Default to the moderation queue — that's the only tab needing action.
  const tab = TABS.some((t) => t.key === params.tab) ? params.tab! : "pending";

  const supabase = await createClient();

  const [{ data, error }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("reviews")
      .select(
        "id, rating, title, body, status, verified, staff_reply, author_name, created_at, products(title, slug)"
      )
      .eq("status", tab)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const reviews = (data ?? []) as unknown as ReviewRow[];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        {pendingCount ? (
          <span className="text-sm text-muted">{pendingCount} awaiting moderation</span>
        ) : null}
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/reviews?tab=${t.key}`}
            className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${
              tab === t.key
                ? "bg-forest text-paper border-forest"
                : "border-line text-muted hover:bg-black/5"
            }`}
          >
            {t.label}
            {t.key === "pending" && pendingCount ? ` (${pendingCount})` : ""}
          </Link>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">Could not load reviews: {error.message}</p>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted text-sm">Nothing here.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            // Re-run the screen at render time so staff see WHY a review was
            // held — the flag itself was decided at submission.
            const compliance = screen(r.title, r.body);
            return (
              <div key={r.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-amber">{"★".repeat(r.rating)}</span>
                      <span className="text-muted">{r.rating}/5</span>
                      {r.products && (
                        <Link
                          href={`/product/${r.products.slug}`}
                          className="font-medium hover:text-forest"
                        >
                          {r.products.title}
                        </Link>
                      )}
                      {r.verified && (
                        <span className="bg-forest/10 text-forest text-[11px] rounded-full px-2 py-0.5">
                          Verified buyer
                        </span>
                      )}
                      {compliance.flagged && (
                        <span
                          className="bg-red-100 text-red-700 text-[11px] rounded-full px-2 py-0.5"
                          title="Held for review — remove or reject before publishing"
                        >
                          ⚠ Compliance: {compliance.hits.join(", ")}
                        </span>
                      )}
                    </div>

                    {r.title && <p className="mt-2 font-medium text-sm">{r.title}</p>}
                    <p className="mt-1 text-sm text-muted whitespace-pre-wrap">{r.body}</p>
                    <p className="mt-2 text-xs text-muted">
                      {r.author_name || "Customer"} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {r.staff_reply && (
                      <p className="mt-2 text-xs bg-paper rounded-lg p-3">
                        <span className="font-semibold">Reply:</span> {r.staff_reply}
                      </p>
                    )}
                  </div>

                  <ReviewControls id={r.id} status={r.status} staffReply={r.staff_reply ?? ""} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
