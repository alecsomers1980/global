# Reviews — build scope (Week 2)

**Decision:** Supabase-native reviews (own the data, POPIA-clean, R0 new subscription). Review-request emails ride the existing Resend setup. See vault `clients/dianas-bulbinella/design-conversion-plan.md`.

**Why it's the top conversion lever:** social proof converts first-time buyers, and `Review` + `AggregateRating` schema is real SEO gain — which matters double here because Google treats this catalogue as YMYL (health). Genuine, moderated reviews *help* rankings; they must never carry medical claims (see `compliance-rules.md`).

## Locked decisions (2026-07-19)
- **Q1 → Verified buyers only.** Only a signed-in customer with a fulfilled order for the product may submit. Non-buyers never see a form (they see the "be the first" prompt but it's gated to eligible buyers). Every review is therefore `verified = true`.
- **Q2 → "Be the first" empty state.** The reviews section always renders; with zero approved reviews it shows "No reviews yet — be the first to review this product" (the form/CTA only for eligible verified buyers).
- **Q3 → Conditional auto-approve.** A verified review that is **4–5★ AND passes the compliance screen** is inserted `status='approved'` (shows immediately). Anything **1–3★, or with a compliance flag**, is inserted `status='pending'` for manual moderation. ⚠️ Residual risk: the term-list screen isn't exhaustive, so auto-approved 4–5★ can still theoretically carry an unusual claim — accepted trade-off; staff can hide any review retroactively.

## Success criteria
1. A signed-in customer who bought a product can leave a star rating + text review on its page; non-buyers cannot.
2. **Moderation:** clean verified 4–5★ auto-approve; 1–3★ or compliance-flagged go to a `pending` queue for staff.
3. Approved reviews render on the product page with an aggregate star summary; product cards show a compact star + count.
4. `AggregateRating`/`Review` JSON-LD emitted on product pages (only when ≥1 approved review).
5. Staff can approve / hide / delete (and optionally reply) from `/admin`, and see the pending queue.
6. A post-purchase "leave a review" email goes out via Resend once an order is fulfilled.

## 1. Data model — `supabase/migrations/0010_reviews.sql`
Idempotent, same conventions as existing migrations (run in SQL editor or `supabase db push`).

```
public.reviews
  id           uuid pk default gen_random_uuid()
  product_id   uuid not null references products(id) on delete cascade
  user_id      uuid not null references auth.users(id) on delete cascade
  order_id     uuid references orders(id) on delete set null   -- provenance for "verified"
  rating       int  not null check (rating between 1 and 5)
  title        text default ''
  body         text not null default ''
  verified     boolean not null default false                  -- bought it (set server-side)
  status       text not null default 'pending'
                 check (status in ('pending','approved','hidden'))
  staff_reply  text default ''
  created_at   timestamptz default now()
  updated_at   timestamptz default now()
  unique (user_id, product_id)      -- one review per customer per product (mirrors wishlist_items)
```
- Indexes: `(product_id, status)`, `(status)`, `(created_at)`.
- `touch_updated_at()` trigger (reuse existing).
- **Denormalised aggregate on `products`** (avoids N queries when rendering a grid of cards):
  `alter table products add column rating_avg numeric(2,1) default 0, rating_count int default 0;`
  Maintained by a trigger `recount_product_rating()` on reviews insert/update/delete that recomputes avg+count over `status='approved'` for that product_id.

### RLS (mirror the orders/wishlist pattern)
- **Insert:** none for anon/authenticated — reviews are **inserted server-side via the service-role route** (exactly like orders). The route enforces auth + sets `verified`/`status`.
- **Select:** `using (status = 'approved' or public.is_staff())`.
- **Update/Delete:** `public.is_staff()` only (moderation + reply).

## 2. Verified-buyer logic (server route)
On submit, look up whether this `user_id` has a fulfilled order containing the product:
```
select 1 from order_items oi
  join orders o on o.id = oi.order_id
 where o.user_id = :uid
   and oi.product_slug = :slug
   and o.status in ('paid','completed','shipped','collected')
```
- Match → `verified = true`, `order_id` stored, submission proceeds.
- **No match → reject** (verified-buyers-only, Q1). API returns a friendly "Only customers who purchased this product can review it." The UI never shows a form to a non-eligible user.

## 3. Server / API surface (`src/lib/reviews.ts` + route)
- `POST /api/reviews` — auth required; validates rating/body, runs the **verified-buyer gate** (reject if not a buyer), **runs the compliance screen** (§6), then decides status: `verified && rating>=4 && !flagged → 'approved'`, else `'pending'`. Inserts via service-role. Rejects duplicate (unique violation → friendly "you've already reviewed this").
- `canReview(userId, slug)` — the verified-buyer check, reused by the product page to decide whether to render the form.
- `getApprovedReviews(productId)` — for the product page (server component).
- Aggregate comes straight off `products.rating_avg / rating_count` (already loaded by catalog).

## 4. Customer-facing UI
- **Product page** (`product/[slug]/page.tsx` + `ProductGallery.tsx`):
  - Star summary next to the title (`rating_avg` ★ · `rating_count` reviews) — anchors to the reviews section.
  - New `ReviewsSection` below the accordion. Zero approved reviews → "No reviews yet — be the first to review this product" (Q2). List renders first-name + initial, date, verified badge, staff reply. The `ReviewForm` (client) shows **only to eligible verified buyers** (`canReview` true); others see a contextual line ("Only customers who purchased can review" / "Sign in"). Reuses the star input style.
- **Product card** (`ProductCard.tsx`): compact `★ 4.8 (12)` under the title when `rating_count > 0`. Cheap — data already on the product.
- **Star component** (`components/reviews/Stars.tsx`): shared read + input.

## 5. Admin moderation (`/admin/reviews`)
- New sidebar item (mirror `AdminSidebar` + `admin/orders` list pattern).
- Table: product, stars, excerpt, verified, status, date. Row controls (mirror `OrderStatusControls`/`ApplicationControls`): **Approve / Hide / Delete**, optional **Reply**.
- Default filter = `pending` (the moderation queue).

## 6. Compliance gate (non-negotiable — ties to the blocker)
Reviews are user-generated, but publishing one is the brand endorsing it.
- The compliance screen (auto-flag body/title against the `compliance-rules.md` disease/cure term list — cancer, cures, treats, eczema, etc.) runs on **every** submission and is a hard input to the auto-approve decision: **any flag forces `status='pending'`** regardless of star rating. Flagged reviews are highlighted in the admin queue so staff consciously edit or reject.
- Standing line under the reviews section: *"Reviews reflect individual customer experience and are not medical advice."*
- Because auto-approve (Q3) publishes clean 4–5★ without a human pass, the term list is the only automated guard on those — keep it in sync with `compliance-rules.md`, and staff can hide any live review retroactively.

## 7. Review-request email (Resend — reuse existing pattern)
- Extend the existing cron pattern (`api/cron/reorder-reminders`) or hook order status → `shipped/collected`: N days after fulfilment, email the customer a link to review each purchased product.
- Template in `lib/email/templates.ts`; send via `lib/resend.ts`. ⚠️ needs `RESEND_API_KEY` set (currently absent locally).
- Guard: one request per order_item; skip if already reviewed.

## 8. SEO
- JSON-LD `Product` → `aggregateRating` + up to a few `review` nodes, emitted only when `rating_count > 0` (never fabricate).

## Out of scope (phase 2)
Photo reviews, Q&A, helpful-voting, review incentives/discounts. (These are the Judge.me/Okendo features — revisit only if Diana wants them.)

## Effort / sequencing
1. Migration `0010` + rating trigger → verify with a seeded review.
2. `lib/reviews.ts` + `POST /api/reviews` + verified + compliance screen.
3. Product-page display + form + Stars component.
4. Product-card star summary.
5. Admin moderation page.
6. JSON-LD.
7. Review-request email (last — depends on `RESEND_API_KEY`).

Roughly a 1–1.5 day build; DeepSeek implements from this doc, Claude reviews the migration + compliance screen (higher-stakes bits).

## Open questions
_All resolved 2026-07-19 — see "Locked decisions" at the top._
