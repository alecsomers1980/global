# Rehoboth Herbal Co. — website design spec

**Date:** 2026-08-30
**Status:** design agreed, awaiting spec review before implementation planning
**Design canvas:** https://claude.ai/code/artifact/f0f3bf53-f89c-46e3-bc7c-9106c09384fa

---

## 1. What this is

A South African herbal products producer in Low's Creek, Mpumalanga, selling
direct to the public online for the first time. They currently reach customers
only through resellers.

**Rehoboth Farm** — Portion 21 of Farm 277JU Lovedale, Honeybird, Low's Creek,
Mpumalanga. Products are grown, dried and packed on the same farm. Purchases
support rural farming development through Foundations for Farming.

The name is Genesis 26:22 — the third well Isaac dug, the one nobody fought him
over, named for the room it made. The emblem (a well and bucket inside a leaf)
already tells this story; the site leads with it.

---

## 2. Discovery findings

These were established from the client's own material during briefing, not assumed.

### 2.1 There is an existing site
`rehobothco.co.za` resolves and is printed on every product label. It is an
unfinished WooCommerce theme demo: Lorem Ipsum FAQ content, placeholder *poster*
products priced R23.99–R17.99, and typos in the body copy ("All our payments our
SSL secured", "substainable farmers trough the Foundations for Farming").

Treat as greenfield for content, but the domain is real and is the presumed
launch target. No redirect map is needed — there is no genuine content to preserve.

### 2.2 Rehoboth already sells through resellers, above the pricelist's retail column

| Product | Reseller retail (Go Natural) | Pricelist "retail +30%" | Distributor cost |
|---|---|---|---|
| Moringa Powder 150g | R182 | R136 | R105 |
| Artemisia A3 150g | R288 | R217 | R167 |

Stockists mark up ~73% over cost, not 30%. **If the Rehoboth site sells at the
pricelist retail column it undercuts its own stockists by 25–33%.** This is a
commercial decision for the client, not a build decision — see §8.

Reseller product pages carry no description, ingredients or directions, so there
is no existing copy to inherit and a proper product page is an easy competitive win.

### 2.3 The catalogue is 21 SKUs
Twenty are confirmed by barcode artwork; tinctures have no barcode yet.

| Product | Formats |
|---|---|
| Artemisia Annua A3 | 150g powder, 90 caps, 1kg, 50ml ointment, oil |
| Artemisia Afra | 150g powder, 90 caps, 1kg |
| Moringa Oleifera | 150g powder, 90 caps, 1kg, 50ml ointment, oil |
| Turmeric with pepper | 150g powder, 90 caps |
| Rosemary | 150g powder, 90 caps |
| Neem | 50g ointment |
| Lip Balm | 10g |
| Boerseep | 150–170g |
| Tinctures | 30ml |

### 2.4 Brand assets are complete and good
- **Logo:** 16 variants (4 lockups × black/white). Brand colour `#6C8781`, confirmed
  identical in the logo artwork and in every vector label. Mint-white `#F3FFF8`.
- **Photography:** 50 shots, professionally styled, in two distinct sets —
  *Style A* (white ceramic plate, pale wood, top-down; shots 001–004) and
  *Style B* (warm rustic wood, banana leaf, glass jars of loose powder, ointment
  tins in soil; shots 005–050). Style B is the majority and the stronger set.
- **Per-product accents, already printed on the labels:**
  Rosemary `#649D82` · Artemisia A3 `#517C00` · Moringa `#2B4E17` ·
  Turmeric `#E3923A` · Artemisia Afra `#727A75`.
  Use this system on product pages rather than inventing one.
- **Labels:** 5 vector PDFs carrying ingredients, directions and barcodes.
- **Video:** a client walkthrough exists on OneDrive but has not been retrieved
  (see §8).

---

## 3. Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Audience | Retail D2C now, distributor tier later | Ships sooner; schema leaves room so the trade tier needs no migration |
| v1 scope | Shop + admin + editorial journal | The journal is how this category earns organic search |
| Product copy | Label-sourced facts + written marketing copy, client signs off | Labels are the legal source of truth for ingredients and directions |
| Visual direction | **C — The Well** | Light base for commerce, one dark cinematic band for the brand story and video |
| Compliance stance | Site is claim-free; label exposure documented for the client | See §6 |
| Fulfilment | **Unresolved** — client question | Default assumption: flat-rate national courier + collection |

---

## 4. Design direction — "The Well"

Light `#FAFCFB` base with teal-tinted greys. One dark teal cinematic band
(`#10201C`) carrying the client video, placed between the hero and the range.
Asymmetric 7/5 hero split. Marcellus for display, Karla for body. Brand teal
`#6C8781` for primary actions; per-product accents on product pages.

Homepage anatomy, top to bottom:
1. Nav — wordmark left, five links right, cart
2. Hero — emblem + "Genesis 26:22" eyebrow, headline, one primary CTA, one video CTA
3. Dark video band — full-bleed muted autoloop
4. Range — 4-up product grid, link through to all 21
5. Three proof beats — one plant per bottle / traditionally used / farming that gives back
6. Stockist band — "Become a stockist", the visible door to the distributor tier
7. Compliance disclaimer block
8. Footer

---

## 5. Architecture

Follows the `dianas-bulbinella` pattern, the closest sibling in this workspace.

- **Next.js 16** (App Router), React 19, TypeScript, Tailwind 4
- **Supabase** — Postgres, Auth, Storage for product media
- **PayFast** — sandbox credentials first, live on client handover
- **Resend** — order confirmations and form mail
- **Framer Motion** — scroll reveals (the animation the references are liked for)
- **Vercel** — git-push auto-deploy
- Code generation delegated to **DeepSeek**; Claude acts as architect

### 5.1 Data model (first cut)

- `products` — slug, name, botanical name, accent colour, description, traditional-use
  copy, ingredients, directions, disclaimer flag, active
- `product_variants` — product_id, format (powder/capsules/ointment/oil/bar/tincture),
  size label, barcode, `price_retail`, `price_trade`, `min_qty_trade`, stock
- `orders` / `order_items` — with `channel` enum (`retail` | `trade`) reserved from day one
- `customers` — Supabase Auth, with a `trade_status` column reserved
- `posts` — journal, with draft/approved/published states
- `keep_alive` — per the workspace standard, so the free-tier DB never pauses

Holding `price_trade` and `min_qty_trade` on the variant from the start is what
makes the distributor tier a feature flag rather than a migration.

### 5.2 Standards this build must meet
From established workspace conventions:
- Login needs forgot-password, show-password and keep-me-signed-in in the first pass
- Every emailing/DB-writing form needs honeypot + timing anti-bot
- The gallery/media admin needs multi-upload, auto-optimise, category delete, bulk delete
- The journal generator ships both a scheduled cron **and** a manual "generate now"
  button, with an approval queue and a compliance guard
- Supabase keep-alive GitHub Action from day one
- No Supabase client constructed during render or prerender

---

## 6. Compliance — the material risk

The printed labels make claims that, under the **Medicines and Related Substances
Act 101 of 1965**, make these products *medicines*:

> "Assists in supporting the treatment of malaria, hepatitis, and certain cancers"
> "Supports protection against bacterial and viral threats"
> "IMMUNE BOOSTER CAPSULES"
> Turmeric: "Helps manage arthritis, cholesterol levels, anxiety, and muscle pain"
> Rosemary label is headed "MEDICINAL"

Selling an unregistered medicine is an offence. SAHPRA polices *Artemisia*
specifically — it is the plant at the centre of the malaria and COVID claim wave.
Google also treats this as YMYL content and suppresses unbacked health claims, so
fixing it is a ranking gain, not only risk reduction.

**Agreed position:** the website carries no medical claims. Product copy uses
traditional-use framing ("traditionally used in South Africa to support…"),
cosmetic function language for topicals, and a mandatory disclaimer block on every
product page. Rules ported from `dianas-bulbinella/docs/compliance-rules.md`.

**This protects the site. It does not protect the labels.** A separate written note
goes to the client setting out the label exposure so they can take it to a
regulatory consultant. Producing compliant replacement label copy is offered as
follow-on work — the labels are vector, so new text drops into existing artwork.

Not legal advice.

---

## 7. Out of scope for v1

Gated trade pricing and distributor accounts (schema is ready, UI is not);
subscriptions; multi-currency; reviews; loyalty; replacement label artwork.

---

## 8. Open questions for the client

1. **Fulfilment** — courier flat-rate, weight/zone tiered, or collection too?
2. **Retail pricing vs stockists** — sell at the pricelist retail column and undercut
   your own resellers by ~25%, or price at reseller parity (~R182/R288) and protect them?
3. **Label claims** — who is the regulatory contact, and is there existing advice?
4. **Domain** — launch on `rehobothco.co.za`? Who holds the registrar and DNS?
5. **The video** — the OneDrive share has not downloaded (local network failures);
   a local copy is the quickest unblock.
6. **Company details** — registration number, trading address, Information Officer
   for the POPIA notice.
7. **Tinctures** — which botanical(s), and is a barcode coming?

---

## 9. Success criteria

- All 21 SKUs live with label-sourced ingredients and directions, client-approved
- A PayFast sandbox order completes end to end and writes a correct order record
- Zero disease-claim terms in any title, slug, body, alt text or meta description,
  verified by an automated scan before launch
- Lighthouse ≥ 90 on mobile for home, shop and product
- Admin can add a product, change a price and publish a journal post without a developer
- The site renders correctly at 390px width
