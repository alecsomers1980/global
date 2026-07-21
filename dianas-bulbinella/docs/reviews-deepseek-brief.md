# DeepSeek delegation brief — Reviews build

**How to run:** open a `ds` Claude Code session (DeepSeek-backed) in `dianas-bulbinella/` and paste the "TASK" block below. Claude (Opus) wrote the migration + spec and will review your output — implement to the spec, don't redesign it.

---

## TASK

Implement the product-reviews feature for Diana's Bulbinella. The schema and the full spec already exist — build the application layer to match them exactly.

**Authoritative spec:** `docs/reviews-plan.md` (read it fully first). **Migration is DONE:** `supabase/migrations/0010_reviews.sql` — do NOT modify it; build against the tables/columns it defines.

### Hard constraints (read before writing code)
1. **This is a modified Next.js** (see `AGENTS.md`) — read the relevant guide in `node_modules/next/dist/docs/` before using any Next API; do not assume APIs from memory.
2. **Reviews are inserted server-side with the service-role client only** — same pattern as orders (see `src/app/api/payfast/notify/route.ts` and the checkout route for how the service-role Supabase client is obtained). There is deliberately no anon/authenticated insert RLS policy.
3. **Surgical changes** — match existing component/style conventions; don't refactor or "improve" unrelated code. Reuse existing utilities (`formatZAR`, `is_staff` is handled at the DB layer, `touch_updated_at`, etc.).
4. **Compliance is non-negotiable** — the compliance screen (below) gates auto-approve. Keep the term list in sync with `docs/compliance-rules.md`.

### Locked behaviour (from the spec)
- **Verified buyers only:** a submitter must be signed in AND have a fulfilled order (`orders.status in ('paid','completed','shipped','collected')`) containing the product (`order_items.product_slug = product.slug`). Non-buyers are rejected and never see a form.
- **Auto-approve rule:** `verified && rating >= 4 && !complianceFlagged` → insert `status='approved'`; otherwise `status='pending'`. A compliance flag forces `pending` regardless of stars.
- **One review per user per product** (DB `unique(user_id, product_id)` → handle the duplicate error with a friendly message).

### Files to create
- `src/lib/reviews.ts` — `canReview(userId, slug)` (verified-buyer check), `getApprovedReviews(productId)`, submit helper. Types.
- `src/lib/compliance.ts` — export the disease/cure term array (from `docs/compliance-rules.md` §2 "Never use") + `screen(text): { flagged: boolean; hits: string[] }`. Reuse this in the review route.
- `src/app/api/reviews/route.ts` — `POST`: auth required → verified gate → compliance screen → compute status → service-role insert. Return friendly errors (not-a-buyer, duplicate, validation).
- `src/components/reviews/Stars.tsx` — shared read + input star component.
- `src/components/reviews/ReviewsSection.tsx` + `ReviewForm.tsx` (client) — list of approved reviews (first-name + initial, date, verified badge, staff reply), "No reviews yet — be the first to review this product" empty state, form shown **only** when `canReview` is true, standing line *"Reviews reflect individual customer experience and are not medical advice."*
- `src/app/admin/reviews/page.tsx` + `src/components/admin/ReviewControls.tsx` — moderation queue (default filter `pending`); Approve / Hide / Delete / Reply. Mirror `admin/orders/page.tsx` + `OrderStatusControls.tsx` + add the nav item to `AdminSidebar.tsx`.

### Files to edit
- `src/lib/catalog.ts` — ⚠️ **the product select lists explicit columns and does NOT include the new rating columns.** Add `rating_avg, rating_count` to the select string AND to the `Product` type/mapper, or cards/pages can't show stars.
- `src/app/product/[slug]/page.tsx` + `src/components/product/ProductGallery.tsx` — render `<ReviewsSection>` below the accordion; add a star summary (`rating_avg` ★ · `rating_count`) near the title; emit `AggregateRating`/`Review` JSON-LD **only when `rating_count > 0`** (never fabricate).
- `src/components/shop/ProductCard.tsx` — compact `★ 4.8 (12)` under the title when `rating_count > 0`.
- Email (do LAST): add a review-request template to `src/lib/email/templates.ts` and send via the existing `sendEmail` (`src/lib/resend.ts`); trigger from the fulfilment path or extend the `api/cron/reorder-reminders` pattern. ⚠️ `RESEND_API_KEY` is absent locally — the existing `getResend()` already returns null without it, so guard for that and don't crash.

### Do NOT
- Modify `0010_reviews.sql` or any other migration.
- Add an insert RLS policy (inserts are service-role only).
- Allow non-verified users to submit.
- Emit review schema when there are no approved reviews.
- Touch unrelated files/formatting.

### Self-check before you finish
- `npm run dev` (port 3005): `/`, `/shop`, and a product page compile and return 200.
- Submitting as a non-buyer is rejected; as a buyer it inserts; a 5★ clean review shows immediately; a 2★ or a review containing a term from `compliance.ts` lands in the admin `pending` queue.
- Product cards + product page show stars once a product has an approved review; no schema when count is 0.
- Report exactly what you changed and anything you couldn't verify.

---

_After DeepSeek finishes: Claude reviews `lib/reviews.ts` + `lib/compliance.ts` + the API route (the compliance/verified/auto-approve logic — the higher-stakes bits), then the migration gets applied in Supabase and the flow is driven end-to-end._
