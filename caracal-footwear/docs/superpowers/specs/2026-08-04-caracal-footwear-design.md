# Caracal Footwear — E-commerce Site Design

**Date:** 2026-08-04
**Status:** Approved (brainstorming complete, pending implementation plan)
**Client:** Caracal Footwear — Donald, 082 451 0359, donald@caracallodge.co.za

---

## 1. What we're building

A premium e-commerce site for Caracal Footwear, a South African handcrafted vellies
(veldskoen / desert boot) brand. Customers browse the range, pick a style, colour and
size, and pay online via PayFast. Donald runs the catalogue, stock and orders himself
through an admin back-office.

The build follows the Dianas Bulbinella architecture, which is proven and already
deployed. The visual treatment is new: a dark, cinematic "Wild by Nature" art direction
built with the `cinematic-ui` skill.

### Brand facts (from client-supplied flyers and photographs)

Source material lives in `intake/reference/` (27 images).

| Fact | Value |
| --- | --- |
| Taglines | "Wild by nature" · "Handcrafted. Durable. Unique." · "Wild by nature. Built to last." · "Comfort. Style. Made for anywhere." |
| Logo | Caracal (lynx) head in a circle, black/orange |
| Contact | Donald — 082 451 0359 · donald@caracallodge.co.za |
| Price | R550 per pair — **unconfirmed, see Open Questions** |
| Delivery | Free over R1,000 · 5-day lead time · countrywide |
| Sizes | 4 (ladies) to 15 (mens) |
| Materials | Genuine leather · non-slip TPR sole · handmade |
| Flyer colours | White · Red · Navy · Tan · Olive Green · Black (plus traditional tans and browns) |
| Known style numbers | 402 (Chelsea) · 403 (Hiker) · 420 (Chukka) |

### Style families identified from photographs

1. **Chukka / desert boot** — lace-up, 2–3 eyelet, ankle height. Smooth leather, nubuck, suede.
2. **Low-cut vellie** — oxford/derby, below the ankle.
3. **Chelsea boot** — elastic side gusset, pull tab, chunky lug sole.
4. **Hiker** — D-ring eyelets, padded collar, two-tone panels.
5. **Signature (decorated)** — airbrush-style wildlife art panels (lion, leopard,
   buffalo-at-sunset), game hide panels (zebra, leopard), and floral panels
   (protea, succulent).

### Competitive position (researched 2026-08-04)

| Brand | Price range |
| --- | --- |
| **Caracal** | **R550** (per flyer, unconfirmed) |
| Veldskoen | R1,199 – R1,799 |
| Freedom of Movement | R1,695 – R2,695 |
| Jim Green | ~R3,200 – R6,400 |

Three gaps Caracal can own:

1. **No competitor sells decorated vellies.** Veldskoen offers no colour customiser at
   all; Freedom of Movement only badges some products "PERSONALISE ME". Caracal's
   Signature tier is genuinely unmatched in this market and should be a headline
   collection, not a footnote.
2. **Size range.** Freedom of Movement carries UK 3–13 with only five women's products.
   Caracal covers 4–15 and advertises "no order too small".
3. **Price.** If R550 is correct, Caracal is a third of Veldskoen and a quarter of FOM
   for a comparable handmade genuine-leather product.

---

## 2. Decisions taken

| Decision | Choice | Rationale |
| --- | --- | --- |
| Fulfilment | **Stocked inventory** | Client's call. Real stock counts per variant, decrement on sale, show sold-out. |
| Catalogue source | **Placeholders from photos** | No price list available yet. Seeded data is clearly marked and replaced through the admin before launch. |
| Art direction | **Wild by Nature — dark cinematic** | Matches the existing printed flyer, so print and web read as one brand. The Signature tier looks best on dark. |
| Design skill | **`cinematic-ui`** on `/`, `/signature`, `/story` | Premium feel where it earns attention; clean and fast everywhere transactional. |
| Accounts | **None — guest checkout** | Client's call. Removes signup/login/password-reset scope entirely. |
| Signature tier | **Own products in their own collection** | Each design gets a page, gallery, price and SEO surface. Makes the range look larger than it is. |
| Payments | **PayFast** | SA standard, already proven in the Dianas build. |

### Consequence of "no accounts"

Reviews cannot be tied to a verified purchase. They are therefore **open submission**
(name + email + rating + body) routed to an **admin moderation queue**, and only appear
publicly once Donald approves them. This is stated explicitly because it is the one
place where the no-accounts decision changes a feature's behaviour.

---

## 3. Architecture

### Stack

Mirrors `dianas-bulbinella`:

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — Postgres, Storage (product imagery), Auth (admin only), RLS
- **PayFast** — payment gateway + ITN webhook
- **Resend** — transactional email
- **Zustand** — cart state, persisted to localStorage
- **GSAP** — ScrollTrigger motion on cinematic routes only
- **Anthropic API** — Field Journal draft generation

> **Note:** Next.js 16 has breaking changes from earlier versions. Per the Dianas
> `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` before writing
> code rather than relying on training data.

### Repository and deployment

- Project folder: `caracal-footwear/` under Antigravity.
- Its own private GitHub repo, per the monorepo-split standard.
- Vercel, **git auto-deploy** (the eastlake/execair pattern — not the vercel CLI).
- Supabase keep-alive GitHub Action (cron Mon/Thu insert into `keep_alive`) so the
  free-plan database never pauses.
- Commit the scaffold in the first session — OneDrive has nearly lost uncommitted work before.

---

## 4. Data model

### `products`
`id` · `slug` · `style_no` · `name` · `description` · `category` (`chukka` | `low_cut` |
`chelsea` | `hiker`) · `is_signature` (bool) · `signature_type` (`wildlife` | `hide` |
`floral`, null otherwise) · `base_price` · `featured` · `active` · `created_at`

`is_signature` is **orthogonal to `category`**, not an alternative to it. A lion-panel
vellie is `category = low_cut` **and** `is_signature = true`, so it appears both in
`/range/low-cut` and in `/signature`. There is no "signature" category value.

### `product_variants`
`id` · `product_id` · `colour_name` · `colour_hex` · `size` · `sku` · `stock_qty` ·
`price_override` (nullable) · `active`

Unique constraint on (`product_id`, `colour_name`, `size`).
`stock_qty` has a check constraint `>= 0`.

### `product_images`
`id` · `product_id` · `colour_name` (nullable — null means "applies to all colours") ·
`url` · `alt` · `sort_order`

Per-colour images are what make the swatch click swap the gallery.

### `orders`
`id` · `order_number` · `customer_name` · `email` · `phone` · `address_line1` ·
`address_line2` · `city` · `province` · `postal_code` · `subtotal` · `delivery_fee` ·
`total` · `status` (`pending` | `paid` | `failed` | `cancelled` | `stock_conflict` |
`fulfilled`) · `payfast_payment_id` · `created_at`

### `order_items`
`id` · `order_id` · `variant_id` · `product_name` (snapshot) · `colour` (snapshot) ·
`size` (snapshot) · `qty` · `unit_price` (snapshot)

Snapshots mean a later price or name change never rewrites order history.

### `reviews`
`id` · `product_id` · `author_name` · `email` · `rating` (1–5) · `body` ·
`status` (`pending` | `approved` | `rejected`) · `created_at`

### `journal_posts`
`id` · `slug` · `title` · `excerpt` · `body_md` · `hero_image` ·
`status` (`draft` | `pending` | `published`) · `published_at`

### `site_settings`
Key/value: delivery threshold (default `1000`), delivery fee, lead time text
(default `5 working days`), contact phone, contact email, WhatsApp number, hero copy.

Everything the client might want to change without a developer lives here.

### `keep_alive`
`id` · `created_at`. Written by the GitHub Action.

### The variant-explosion problem

Six colours × twelve sizes is **72 stock lines per style**. Hand-creating those will
make Donald abandon the admin. Two pieces of admin UI solve it and are **required, not
optional**:

1. **Bulk variant generator** — tick the colours, tick the size range, generate the
   whole grid in one action.
2. **Stock grid** — a spreadsheet-style matrix (colours down, sizes across), type
   quantities, one save.

---

## 5. Routes

### Public

| Route | Purpose |
| --- | --- |
| `/` | Cinematic homepage |
| `/range` | Full catalogue with filters (category, colour, size, price) |
| `/range/[category]` | `chukka` · `low-cut` · `chelsea` · `hiker` |
| `/signature` | Cinematic Signature Collection landing |
| `/product/[slug]` | PDP — gallery, colour swatches, size selector, stock state, reviews |
| `/cart` | Cart |
| `/checkout` | Guest details + delivery, hands off to PayFast |
| `/checkout/success` · `/checkout/cancelled` | PayFast returns |
| `/journal` · `/journal/[slug]` | Field Journal |
| `/story` | Brand and craft story (cinematic) |
| `/size-guide` | 4–15 conversion table + measure-your-foot guide |
| `/care` | Leather care |
| `/contact` | Form + WhatsApp link |
| `/faq` · `/shipping-returns` · `/privacy` · `/terms` | Support and legal |

### Admin — `/admin`, gated by Supabase Auth

Dashboard · Products (CRUD) · Stock grid · Orders · Reviews moderation · Journal
approve-queue · Settings.

Product image handling follows the gallery admin standard: **multi-upload,
auto-optimize on upload, category delete, bulk image delete** — built in the first pass,
not retrofitted.

### API

| Endpoint | Purpose |
| --- | --- |
| `POST /api/checkout` | Validate cart server-side, create order, sign PayFast payload |
| `POST /api/payfast/notify` | ITN webhook — verify, mark paid, decrement stock, send email |
| `POST /api/reviews` | Submit a review (→ `pending`) |
| `POST /api/contact` | Contact form |
| `POST /api/cron/journal` | Generate a Field Journal draft |
| `POST /api/cron/publish` | Publish approved journal posts |

Per the blog-generator standard, the journal ships **both** the scheduled cron **and** a
manual "Generate now" button in the admin.

---

## 6. The cinematic homepage

Nine scroll beats:

1. **Hero** — full-bleed rim-lit boot on charcoal. `WILD BY NATURE` in heavy condensed
   display type with a mask reveal, orange rule beneath, "Handcrafted vellies. Built to
   last. Sizes 4 to 15." Primary CTA to the range.
2. **Colour sweep** — pinned horizontal scroll through all six flyer colours, the boot
   recolouring as it travels.
3. **Craft pillars** — genuine leather · non-slip TPR sole · handmade, over a
   stitched-edge macro photograph.
4. **Signature teaser** — the lion, leopard and buffalo panels full-bleed on dark,
   scroll-triggered. This is the differentiator; it gets the most screen.
5. **Range grid** — the four categories as cards.
6. **Size statement** — "Sizes 4 to 15. No order too small."
7. **Reviews** — approved reviews as social proof.
8. **Journal teaser** — latest posts.
9. **Footer** — Donald's WhatsApp, delivery promise, legal links.

### Motion budget

GSAP ScrollTrigger runs on `/`, `/signature` and `/story` **only**. There is **no motion
on PDP, cart or checkout** — animation in a purchase flow costs conversions.
`prefers-reduced-motion` is respected everywhere: transforms collapse to instant state
changes, nothing is lost.

---

## 7. Design tokens

```
canvas    #14110F   charcoal
surface   #1E1A17   raised panels
accent    #C25A1E   burnt orange (from the logo)
accent-hi #D96B2A   hover
tan       #B5763A   leather
cognac    #A8542A   leather
camel     #C89660   leather
text      #F5F0E8   bone
muted     #A39A90   secondary text
```

- **Display type:** heavy condensed grotesk, tight tracking, for statement lines.
- **Body type:** Inter.
- Film-grain overlay and sunset-gradient washes tie the site back to the printed flyer.
- Contrast: all text/background pairs meet WCAG AA. Bone on charcoal and bone on burnt
  orange both pass; burnt orange is **not** used for body text on charcoal.

---

## 8. Error handling

These are the cases that actually bite in a stocked shop:

- **Stock decrements on PayFast ITN confirmation, never at add-to-cart.** A `stock_qty >= 0`
  check constraint plus an atomic decrement prevents overselling under concurrent orders.
- **If a variant sells out between cart and payment**, the order is marked
  `stock_conflict` and both Donald and the customer are emailed. Money is not silently
  kept against stock that doesn't exist.
- **The ITN handler is idempotent.** PayFast retries; a duplicate notification must not
  decrement stock twice. Guarded on `payfast_payment_id`.
- **ITN is verified** — signature, source IP against PayFast's published ranges, and
  amount matched against the stored order total.
- **Prices are re-validated server-side at checkout.** The cart carries a snapshot for
  display only; a client-submitted price is never trusted.
- **Forms** (contact, reviews) use honeypot + submission-timing anti-bot. No CAPTCHA, no
  extra infrastructure — the pattern already in the Lublaw `ContactForm`.
- **Image uploads** go to Supabase Storage, served through `next/image`, auto-optimized
  on upload.

---

## 9. Success criteria

The build is done when all of these are demonstrated, not asserted:

1. A full order completes on the PayFast **sandbox**: order row created, stock
   decremented, confirmation email to the customer and notification to Donald both sent.
2. A concurrent-order test cannot drive `stock_qty` below zero.
3. A duplicate ITN does not double-decrement.
4. Review flow completes: submit → `pending` → approve in admin → visible on PDP.
5. Journal flow completes: generate (both cron and manual button) → approve → publish.
6. Lighthouse performance **≥ 90** on `/range` and `/product/[slug]`; **≥ 75** on the
   cinematic `/`.
7. Verified at 390px width, not just desktop.
8. The `design-self-audit` rubric is run and passed before the build is called done.

---

## 10. Open questions for the client

None of these block the build — each has a working default — but all should be
confirmed before launch.

1. **Is the price R550 or R1,550?** The flyer digit was obscured by WhatsApp UI overlays
   in the supplied photograph. *Default:* R550, stored per-product and in
   `site_settings`, so correcting it is one admin edit rather than a rebuild.
2. **Is Caracal Footwear connected to Caracal Lodge?** The contact address is
   `donald@caracallodge.co.za`. If so, that is a genuinely strong origin story for
   `/story`. *Default:* `/story` is written around the craft and the caracal-as-emblem
   only, with no lodge claim made.
3. **Full style and price list.** We have 402, 403 and 420 from box labels. *Default:*
   seed those three plus the six flyer colours as clearly-marked placeholders.
4. **Company registration details** for the Terms and Privacy pages. *Default:* pages
   ship with the legal structure in place and the registration line marked as
   outstanding, in the same way the HSLabour build handles it.
5. **Does Donald hold real stock counts today?** The stocked model assumes he can supply
   opening quantities. *Default:* seed every variant at zero and let him fill the stock
   grid before launch.
6. **What is the delivery fee on orders under R1,000?** The flyer states free delivery
   over R1,000 but does not state the fee below it. *Default:* a flat R99 nationwide,
   held in `site_settings` so Donald can change it without a deploy.

---

## 11. Explicitly out of scope for v1

- Customer accounts, saved addresses, order history, re-order (client's decision).
- A "build your own vellie" configurator. The Signature tier ships as fixed products
  instead. Revisit if the decorated range sells well.
- Bespoke-request enquiry form.
- Dealer/stockist locator (Dianas has one; Caracal has no dealer network stated).
- Multi-currency or international shipping — countrywide South Africa only.
