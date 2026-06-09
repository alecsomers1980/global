# Day 4 — Per-platform composer previews + Everest polish

## Goal

1. **Composer per-platform tabs** with mobile-frame live previews so the agency sees exactly what the post will look like on each platform before approving.
2. **First-comment field** for IG (hashtags posted as the first comment after publish — keeps the caption clean, standard best practice).
3. **Everest end-to-end pass:** run the Day 1 scan, generate the Day 2 plan, export the Day 3 PDF, send the `/plan/<token>` link to Everest for sign-off.
4. **GBP wiring (stretch):** wire `lib/gbp.ts` into `publish.ts` behind a feature flag — Everest is a dealership, GBP local posts are high leverage.

## Why this matters

Day 1–3 produce the data and the client-facing artefact. Day 4 is the *polish* that makes the agency trust the output, and the *operational pass* that gets Everest's first plan signed off and publishing. Without per-platform previews, the agency can't confidently approve variants — the IG variant might be too long, the TikTok hook might be flat. Previews close that gap.

## Prerequisites

- Days 1–3 merged.
- Read [`_context.md`](./_context.md).

## Files involved

- **Modify**: `src/components/PostPreviewCard.tsx` — generalise to accept a `platform` prop and render the right aspect ratio + chrome.
- **Create**: `src/components/PlatformFramePreview.tsx` — mobile-frame wrapper that renders FB/IG/TikTok-styled previews.
- **Modify**: `src/app/dashboard/workspaces/[id]/compose/page.tsx` — add per-platform tabs (FB/IG/TikTok), live preview, IG first-comment field.
- **Create**: `supabase/migrations/009_posts_first_comment.sql` — `posts.first_comment text`.
- **Modify**: `src/lib/publish.ts` — after a successful IG publish, post `first_comment` as a comment on the new media.
- **Modify** (stretch): `src/lib/publish.ts` — add `publishToGoogleBusiness()` branch gated on `process.env.GBP_PUBLISHING_ENABLED === 'true'`.
- **Modify** (operational): seed/refresh Everest's intelligence via the Day 1 scan, run Day 2 generation, share the `/plan/<token>` URL.

## Migration 009

```sql
alter table public.posts
  add column if not exists first_comment text;
```

## DeepSeek prompt

> You are working on Ember Social. Read `ember-social/docs/roadmap/_context.md` first. Do not break the publish spine. No new npm deps for the core work (GBP stretch may need none either since `lib/gbp.ts` already exists).
>
> **Task — Day 4: Per-platform previews + IG first-comment + GBP wiring.**
>
> **Step 1.** Apply migration `supabase/migrations/009_posts_first_comment.sql` (the SQL in this spec's "Migration 009" section).
>
> **Step 2.** Create `src/components/PlatformFramePreview.tsx`. Props: `{ platform: 'facebook'|'instagram'|'tiktok', content: string, hashtags?: string[], firstComment?: string, mediaUrl?: string, brandKit?: { logo_url?: string, primary_color?: string }, workspaceName: string }`. Render a chrome-accurate mobile-frame preview:
>
> - **Facebook**: 1.91:1 image area, name + "Sponsored" line, content below image, Like / Comment / Share row. Truncate content at 280 chars with "...See more".
> - **Instagram**: 4:5 default (or square if it's a square image), avatar + username, image, heart/comment/send/save row, caption below with username, **truncate at 125 chars** with "... more". If `firstComment` is set, render it as the first comment below the caption with the workspace name.
> - **TikTok**: 9:16 frame, content over a video poster, side action stack (heart/comment/share/save), brand username at bottom-left, hashtags woven into the bottom caption.
> - Style with inline CSS to keep the component self-contained. Use lucide icons for the action rows.
> - Mobile-frame border + notch is fine to be lightweight (rounded rectangle + small camera dot). Don't over-engineer.
>
> **Step 3.** Modify `src/app/dashboard/workspaces/[id]/compose/page.tsx`:
>
> - Above the existing textarea, add a tab row: `Facebook | Instagram | TikTok`. The active tab determines which variant of the post is being edited.
> - Internal state shape: `{ variants: { facebook: {content, hashtags}, instagram: {content, hashtags}, tiktok: {content, hashtags} }, firstComment: string, mediaUrls: string[], platforms: string[], scheduled_at: ... }`. If a post is opened for editing, hydrate from `posts.variants`.
> - The character counter shows the per-platform limit (FB 600, IG 220, TikTok 150).
> - Below the textarea, add an "Instagram first comment" textarea (visible only on the IG tab) — hashtags here, max 500 chars.
> - **Live preview** column on the right (desktop) or below (mobile): `<PlatformFramePreview platform={activeTab} ... />`. Re-rendering on every keystroke.
> - On Save: persist `variants`, `first_comment`, `platforms`, `media_urls`, `scheduled_at`, `status='draft'` (or `pending_approval` if the user hits "Send for approval").
>
> **Step 4.** Modify `src/lib/publish.ts`. After `publishToInstagram` returns successfully:
>
> - If the post has a non-empty `first_comment`, POST `https://graph.facebook.com/v19.0/{ig_media_id}/comments?message={first_comment}&access_token={page_access_token}`.
> - Wrap in try/catch — failure to post the first comment must NOT mark the post as failed (the main post already succeeded). Log + record into `last_error` as a soft note prefixed with `first_comment_warning: ...`.
>
> **Step 5 (stretch).** Wire GBP publishing in `src/lib/publish.ts`:
>
> - Add a `publishToGoogleBusiness(account, content, mediaUrls)` function that uses the token-refresh helpers already in `src/lib/gbp.ts`.
> - Gate the entire branch behind `if (process.env.GBP_PUBLISHING_ENABLED === 'true')`. Otherwise throw "GBP publishing disabled by feature flag" — which becomes a friendly `last_error`.
> - This is **stretch** — skip if other steps run long.
>
> **Step 6 (operational).** This step is for the human operator (Alec), not GLM-5.1. Documented here so it isn't forgotten:
>
> 1. Run the Day 1 scan on Everest with `https://everestmotoring.co.za`.
> 2. Verify `historical_voice`, `posting_cadence_observed.facebook`, `best_performing_hours.facebook` are populated.
> 3. Click "Generate Marketing Plan" — confirm a `campaign_batch` is created and ~17 posts land in approvals.
> 4. Open the `strategy_rationale` and sanity-check the *why*.
> 5. Download the PDF from `/api/workspaces/campaign/pdf?token=<batch_token>`.
> 6. Send `/plan/<token>` to Everest. Wait for first round of comments / change-requests.
> 7. Iterate based on feedback. Approved posts publish automatically via the existing cron.
>
> **Constraints**:
>
> - No new npm deps (use existing lucide for icons, inline CSS for the frames).
> - Sparse comments. Match existing UI styling (`glass-card`, orange `#f97316`, lucide icons).
> - Mobile-frame previews must be self-contained (don't load external assets per render).
> - Don't touch the trigger/cron paths.

## Acceptance criteria

- [ ] Migration 009 applied.
- [ ] Compose page has FB/IG/TikTok tabs, per-platform character limits, IG-only first-comment field.
- [ ] Live preview re-renders on keystroke and matches the active tab.
- [ ] Saving a post persists `variants`, `first_comment`, `platforms` correctly. Existing `content` column is back-compat-filled from the FB variant.
- [ ] After IG publish, the `first_comment` (if set) appears as a comment on the IG post. A failure here logs a `first_comment_warning:` into `last_error` but does NOT mark the post as failed.
- [ ] (Stretch) GBP publishing path is wired and gated by `GBP_PUBLISHING_ENABLED`.
- [ ] Everest operational pass complete: scan done, plan generated, PDF downloaded, `/plan/<token>` shared.
- [ ] `npm run build` and `npm run lint` clean.

## Out of scope (defer)

- AI-generated media per variant (D1).
- Predicted-engagement scoring (D2).
- TikTok / YouTube / LinkedIn publishing — separate roadmap items (B2).
- Drag-and-drop calendar with IG grid preview — competitor-parity polish for a later sprint.
- Email digests of pending change-requests — later.

## Optional finishing pass (1–2 hour polish if time permits)

- Add a "Last scan: {timestamp}" line on the workspace overview, with a "Re-scan" button.
- Add the `strategy_rationale` as a dismissible banner on `/dashboard/workspaces/<id>/approvals`.
- IG grid preview: a 3×3 grid on the workspace overview showing the next 9 IG variants' (placeholder) media tiles. Stub if no media yet.
