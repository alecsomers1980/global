# Day 5 (revised) — AI lifestyle images + branded overlay for every campaign post

## Goal

Every post the campaign generator creates gets a **brand-consistent image** attached. The image is **AI-generated lifestyle photography** (not a catalogue shot of a specific car) informed by what's in the client's inventory. Every image carries the workspace's logo overlay so the feed has a recognisable visual identity.

For Everest specifically: posts about 4×4s show an SUV outdoors, posts about hatchbacks show a small car in an urban scene, posts about financing show a tasteful lifestyle scene, etc. The Everest logo is placed top-left + a small badge bottom-centre on every image.

## Why this matters

The user clarified the campaign generator's purpose: **lifestyle / educational / evergreen content**, *not* "buy this specific 2022 T-Roc". Per-car sales posts are handled by Everest's existing trigger flow ([everest-motoring/src/app/admin/inventory/socialAction.js](../../../everest-motoring/src/app/admin/inventory/socialAction.js)). The campaign generator complements that with brand-building content.

Without images, the plan looks like text scaffolding when shown to Everest. With branded lifestyle images, the plan is a deliverable.

## Prerequisites

- Day 1 + Day 2 + scheduling fix merged.
- Day 5 (current) inventory pipeline still in place — we keep `posts.vehicle_id` for optional soft-linking, but the IMAGE is now AI-generated regardless.
- Read [`_context.md`](./_context.md).
- A **Gemini API key** in `.env.local` — `GEMINI_API_KEY=...`. Get one from https://aistudio.google.com/apikey (free tier covers v1 testing; paid for production at ~$0.039 per image).

## Files involved

- **Create**: `supabase/migrations/009_posts_image_prompt.sql` — records the image prompt + generation status per post (useful for regeneration / debugging).
- **Create**: `src/lib/media/generateLifestyleImage.ts` — calls Gemini 2.5 Flash Image with a text prompt; returns image bytes.
- **Create**: `src/lib/media/applyBrandOverlay.ts` — uses `sharp` to composite the workspace logo top-left + a text/badge bottom-centre.
- **Create**: `src/lib/media/uploadToStorage.ts` — saves the final composite to Supabase Storage and returns the public URL.
- **Modify**: `src/lib/ai/campaignGenerator.ts` — extend the system prompt so the AI also emits an `image_prompt` per post and groups posts by inventory segment naturally; soften vehicle-feature targeting to ~1-2 per month.
- **Modify**: `src/app/api/workspaces/campaign/generate/route.ts` — orchestrate image generation per post: prompt → base image → overlay → storage → set `posts.media_urls`.
- **Setup**: Create a public Supabase Storage bucket `campaign-media`.

## Migration 009

```sql
alter table public.posts
  add column if not exists image_prompt text,
  add column if not exists image_status text
    check (image_status in ('pending', 'generating', 'ready', 'failed', 'skipped'))
    default 'pending';
```

## Storage bucket setup (one-off, via Supabase dashboard SQL editor)

```sql
insert into storage.buckets (id, name, public)
values ('campaign-media', 'campaign-media', true)
on conflict (id) do nothing;

-- Public read for served images
create policy "Public read campaign-media"
  on storage.objects for select
  using (bucket_id = 'campaign-media');

-- Service role write
create policy "Service role write campaign-media"
  on storage.objects for insert
  with check (bucket_id = 'campaign-media');
```

## DeepSeek prompt

```
You are working on Ember Social, a Next.js 15 + Supabase social-media SaaS. The repo lives at ember-social/. Read ember-social/docs/roadmap/_context.md first — Supabase clients, slug-vs-UUID trap, publish spine, hard rules. Do not break the trigger → approve → cron → FB publish path.

CONTEXT (already shipped, working):
- Day 1: brand + social scan populates client_intelligence + brand_kits (brand_kits.logo_url is a real URL when set).
- Day 2: campaign generator produces FB/IG/TikTok variants per post. Per-post approval_token. Scheduling fix landed: SAST window 09:00–17:00 (UTC 07:00–15:00), starts from first non-Sunday of next calendar month, hours rotate across a goodHours pool.
- Day 5 (current): inventory-aware mode reads workspace.content_source. fetchVehicles works (slug computed server-side via computeVehicleSlug).
- posts.vehicle_id exists. posts.variants jsonb exists. publish.ts reads posts.content + posts.media_urls — untouched.

Task: Revised Day 5 — AI lifestyle images + branded overlay for every campaign post.

ONE new npm dep is acceptable: `sharp` (image compositing). Flag it explicitly in your response. Gemini API access is via REST fetch — no SDK needed.

────────────────────────────────────────────────────────
STEP 1 — Migration
────────────────────────────────────────────────────────

Create ember-social/supabase/migrations/009_posts_image_prompt.sql with the SQL from this spec's "Migration 009" section. Additive only.

────────────────────────────────────────────────────────
STEP 2 — Lifestyle image generator
────────────────────────────────────────────────────────

Create ember-social/src/lib/media/generateLifestyleImage.ts.

  export async function generateLifestyleImage(args: {
    prompt: string                  // e.g. "A black 4x4 SUV crossing a river in mountainous terrain, golden hour, professional automotive photography, no text, no logos, 4:5 aspect ratio"
    aspectRatio?: '1:1' | '4:5' | '9:16'  // default 4:5 (Instagram feed)
  }): Promise<{ ok: true, bytes: Buffer, mimeType: string } | { ok: false, error: string }>

Implementation:
- Use the Gemini 2.5 Flash Image API (model: `gemini-2.5-flash-image-preview` or the current stable model alias for image generation).
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_KEY}`
- POST body shape:
  {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } }
  }
- Parse the response: `data.candidates[0].content.parts` — find the part with `inlineData.data` (base64) and `inlineData.mimeType`.
- Return the decoded Buffer + mime.
- Tolerate errors → return `{ ok: false, error: '...' }`. Never throw.
- If GEMINI_API_KEY is missing, return `{ ok: false, error: 'GEMINI_API_KEY not set' }`.

Reference: https://ai.google.dev/gemini-api/docs/image-generation

────────────────────────────────────────────────────────
STEP 3 — Brand overlay
────────────────────────────────────────────────────────

Add `sharp` to package.json dependencies (call this out in your response — it's a native binary).

Create ember-social/src/lib/media/applyBrandOverlay.ts.

  export async function applyBrandOverlay(args: {
    baseImage: Buffer
    logoUrl?: string | null
    workspaceName: string
  }): Promise<Buffer>

Implementation with sharp:
- Load the base image. Get its dimensions.
- If logoUrl is set, fetch the logo bytes (sharp can ingest any common image format). Resize the logo to ~15% of the base width while preserving aspect ratio.
- Composite the logo at top-left with a small inset (~3% of base width on each side). If sharp supports it cheaply, apply a subtle drop shadow underneath (optional).
- Render a small "EVEREST Motoring"-style text badge centred at the bottom: white text on a semi-transparent dark rounded rectangle (~4% of base height tall). Use the workspaceName for the text. If sharp can render text natively use that; otherwise generate the badge as a small SVG and composite it.
- If logoUrl is null or fails to fetch: skip the logo step; still draw the bottom text badge so every image carries the brand name.
- Output JPEG quality 88. Return the Buffer.

If sharp throws for any reason, return the original baseImage Buffer (graceful degradation — better to ship a plain lifestyle image than fail the post entirely).

────────────────────────────────────────────────────────
STEP 4 — Storage upload
────────────────────────────────────────────────────────

Create ember-social/src/lib/media/uploadToStorage.ts.

  export async function uploadCampaignImage(args: {
    workspaceId: string
    postId: string
    bytes: Buffer
    mimeType?: string  // default 'image/jpeg'
  }): Promise<{ ok: true, publicUrl: string } | { ok: false, error: string }>

Implementation:
- Use createAdminClient() from @/lib/supabase/client.
- Path: `${workspaceId}/${postId}-${Date.now()}.jpg`.
- Upload to bucket 'campaign-media' with contentType: mimeType, upsert: true, cacheControl: '31536000'.
- After upload, call .from('campaign-media').getPublicUrl(path) and return the publicUrl.
- Tolerate errors → return { ok: false, error: ... }.

────────────────────────────────────────────────────────
STEP 5 — Generator prompt: add image_prompt + soften vehicle targeting
────────────────────────────────────────────────────────

Modify ember-social/src/lib/ai/campaignGenerator.ts.

Extend GeneratedPost:

  export interface GeneratedPost {
    pillar: string
    rationale: string
    day_offset: number
    vehicle_id?: string | null         // optional soft link — was Day 5 default ~70%, now ~10–20%
    image_prompt: string               // NEW — REQUIRED. Drives the AI image gen.
    variants: Partial<Record<'facebook' | 'instagram' | 'tiktok', { content: string; hashtags: string[] }>>
  }

When args.vehicles?.length > 0:

- Reframe the INVENTORY block in the system prompt as "USE THIS AS CONTEXT FOR SEGMENTS, NOT AS PRODUCTS TO LIST":

  "INVENTORY CONTEXT (informational only — describes what segments exist for lifestyle posts; do NOT write 'buy this 2022 T-Roc for R359,900' style posts. Per-vehicle sales posts are handled elsewhere):
   {short summary, grouped by segment, e.g.}
   - 4 SUVs / 4×4s (Range Rover Discovery, VW T-Roc, Toyota Fortuner, ...)
   - 3 hatchbacks (VW Polo, Toyota Yaris, ...)
   - 2 sedans (Mercedes C-Class, BMW 3 Series)
   - 2 family vehicles (Toyota Quantum, Hyundai Tucson)

   Use this to choose POST TOPICS that match what's actually for sale. e.g. if the inventory is heavy on 4×4s, write more outdoor-adventure-themed posts."

- Add output-shape rules:
  - About 80% of posts are pure lifestyle / educational with `vehicle_id: null`. The IMAGE shows the relevant segment generically.
  - About 10–20% may include `vehicle_id` linking to a specific vehicle from inventory (only the most premium/eye-catching), and the FB variant URL ends with the resolved /inventory/{slug} link.
  - EVERY post MUST include an `image_prompt` field — a 1-2 sentence visual brief in English describing the scene to generate. Examples:
    - "A black mid-size 4×4 SUV crossing a clear mountain river, dramatic golden-hour lighting, professional automotive photography, cinematic composition, 4:5 portrait, no text overlay"
    - "A small silver hatchback parked at a modern South African petrol station at dusk, urban setting, clean lighting, 4:5 portrait, no text overlay, no logos"
    - "Close-up of a confident young couple handing over car keys outside a dealership, daytime, warm lighting, lifestyle photography, 4:5 portrait, no text overlay"
  - Every image_prompt MUST end with the phrase "no text overlay, no logos" (we add branding ourselves in post-processing).
  - Aspect ratio default: 4:5 (Instagram feed friendly; FB and TikTok crop fine from this).

Carry image_prompt through to the returned GeneratedPost (default to a generic brand prompt if AI omits it).

When args.vehicles is empty: still emit image_prompt for every post (lifestyle imagery). Behaviour is identical except no inventory-aware segment grouping.

────────────────────────────────────────────────────────
STEP 6 — Orchestrator: generate image per post
────────────────────────────────────────────────────────

Modify ember-social/src/app/api/workspaces/campaign/generate/route.ts.

After looking up the workspace, also fetch the brand kit:

  const { data: brandKit } = await supabase
    .from('brand_kits')
    .select('logo_url')
    .eq('workspace_id', resolvedId)
    .single()

  const logoUrl = (brandKit as any)?.logo_url || null

  // Fetch workspace name for the bottom badge
  const { data: wsName } = await supabase.from('workspaces').select('name').eq('id', resolvedId).single()
  const workspaceName = (wsName as any)?.name || 'Ember Social'

In the per-post loop, AFTER computing scheduledDate but BEFORE inserting:

  // ── Image generation ──
  let mediaUrls = vehicleAttachedMediaUrls   // existing logic — only used if vehicle_id matched
  let imageStatus: 'pending' | 'generating' | 'ready' | 'failed' | 'skipped' = 'skipped'

  if (post.image_prompt) {
    imageStatus = 'generating'
    const gen = await generateLifestyleImage({ prompt: post.image_prompt, aspectRatio: '4:5' })
    if (gen.ok) {
      const branded = await applyBrandOverlay({ baseImage: gen.bytes, logoUrl, workspaceName })
      // For the upload we need a post_id, but we haven't inserted yet — use a pre-generated UUID for the post.
      const newPostId = crypto.randomUUID()
      const up = await uploadCampaignImage({ workspaceId: resolvedId, postId: newPostId, bytes: branded })
      if (up.ok) {
        mediaUrls = [up.publicUrl]
        imageStatus = 'ready'
        // Pass newPostId as the post's id so storage path matches the row.
        // (See insert below — use newPostId as the inserted id.)
      } else {
        imageStatus = 'failed'
        errors.push(`Post ${i} image upload failed: ${up.error}`)
      }
    } else {
      imageStatus = 'failed'
      errors.push(`Post ${i} image gen failed: ${gen.error}`)
    }
  }

When inserting the post:
- If image gen succeeded, explicitly set posts.id = the newPostId you generated (so the storage path matches).
- Set posts.image_prompt = post.image_prompt.
- Set posts.image_status = imageStatus.
- Set posts.media_urls = mediaUrls (the branded composite, OR the vehicle's photos if vehicle_id matched and image gen failed/skipped, OR null).

Concurrency note: generate images SEQUENTIALLY in the per-post loop. Parallel calls may rate-limit on Gemini's free tier and would make debugging harder. Add a small `await new Promise(r => setTimeout(r, 500))` between Gemini calls to be polite.

────────────────────────────────────────────────────────
STEP 7 — Env var
────────────────────────────────────────────────────────

Add to ember-social/.env.local:
  GEMINI_API_KEY=your_key_from_aistudio.google.com

────────────────────────────────────────────────────────
CONSTRAINTS
────────────────────────────────────────────────────────

1. Don't break publish.ts. media_urls is already a string[] of public URLs — that's what Day 5 produces.
2. Don't break the trigger route (Everest per-car flow).
3. resolveWorkspaceId() before any uuid-typed write.
4. ONE new npm dep allowed: sharp. Flag it explicitly in the response. No other new deps.
5. Migrations additive only.
6. Image generation MUST be tolerant — if it fails for a post, that post still inserts (with image_status='failed' and media_urls = vehicle-photos-if-any OR null). The batch must NOT abort.
7. Sequential image generation. No Promise.all. Small delay between calls.
8. Sharp gracefully degrades — if compositing throws, return the base image.
9. Storage path: `${workspaceId}/${postId}-${timestamp}.jpg` in bucket `campaign-media`.
10. South African English in user-visible copy. Sparse comments.

────────────────────────────────────────────────────────
ACCEPTANCE CRITERIA
────────────────────────────────────────────────────────

[ ] supabase/migrations/009_posts_image_prompt.sql exists with image_prompt + image_status columns.
[ ] src/lib/media/generateLifestyleImage.ts exists with the exact exported signature. Tolerates errors.
[ ] src/lib/media/applyBrandOverlay.ts exists. Uses sharp. Composites logo top-left + workspace-name badge bottom-centre. Gracefully degrades if sharp throws.
[ ] src/lib/media/uploadToStorage.ts exists. Uploads to bucket campaign-media. Returns public URL.
[ ] src/lib/ai/campaignGenerator.ts: GeneratedPost has image_prompt (required); INVENTORY block is reframed as segment context, not a product list; ~80% of posts have vehicle_id null.
[ ] /api/workspaces/campaign/generate orchestrates: fetch brand kit → loop posts → generate image → overlay → upload → set media_urls + image_prompt + image_status; sequential calls with small delay; tolerant of per-post image failures.
[ ] On Everest with GEMINI_API_KEY set: clicking Generate Marketing Plan produces ~10–14 posts in next-calendar-month, SAST 09:00–17:00, each post has a non-null media_urls pointing to {SUPABASE_URL}/storage/v1/object/public/campaign-media/{workspace_id}/{post_id}-*.jpg. Each image is a branded composite (logo top-left + workspace-name bottom badge). ≤2 posts have a vehicle_id linking to a real /inventory/{slug} URL.
[ ] If GEMINI_API_KEY is missing: posts still insert with image_status='failed' and media_urls=null. The batch doesn't abort.
[ ] Existing trigger flow still works.
[ ] npm run build clean. Only one new dep added: sharp.

────────────────────────────────────────────────────────
OUTPUT FORMAT
────────────────────────────────────────────────────────

Return:
1. Full content of each new file as a fenced code block prefixed by the file path.
2. Unified diff for each modified file.
3. Short summary (≤ 10 lines): what changed, deps added (sharp), anything you flagged or simplified, any acceptance-criteria item you couldn't confirm without running code.
```

## Out of scope (defer)

- Explicit number-plate replacement on generated cars. The reference image has a stylised plate; v1 relies on the prompt's "no text overlay, no logos" plus the overlay step to keep brand consistency. v2 could add a second Gemini edit pass to specifically branding-up any visible plate.
- Per-platform aspect ratios (1:1 for IG square vs 9:16 for TikTok). v1 generates 4:5 and lets each platform crop. v2 can branch.
- Image regeneration UI (e.g. agency clicks "regenerate this image"). The `image_prompt` column is persisted so a future endpoint can re-run gen for one post.
- Video generation. Out of scope for the campaign generator; Everest's trigger flow handles reels per car.
- Cost monitoring / budget caps per workspace.
- Alternative providers (Replicate, fal.ai). Single provider for v1.
