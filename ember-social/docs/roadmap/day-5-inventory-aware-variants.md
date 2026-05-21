# Day 5 — Inventory-aware campaign variants

## Goal

For workspaces with an inventory (Everest's `cars` table being the canonical example), the campaign generator pulls real product records, weaves their actual details into each post's variants, and attaches the existing product photos as `media_urls`. The brand's photographic look-and-feel is preserved because we re-use what's already in the client's database — no AI image generation.

For workspaces without an inventory, the generator falls back to Day 2's text-only behaviour with no changes for those clients.

## Why this matters

The user clarified that for Everest, "the car look and feel must stay the same and be used as the inspiration/picture of the post." Everest already has a beautiful per-car post builder in [everest-motoring/src/app/admin/inventory/socialAction.js](../../../everest-motoring/src/app/admin/inventory/socialAction.js) that pushes feed/reel/video posts via the trigger API. That covers *transactional* posts (one car drop = three posts).

Day 5's generator covers *campaign* content — the agency's 30-day strategic plan — and must reach into the same inventory so the marketing plan features real, sellable vehicles instead of generic copy.

## Prerequisites

- Day 2 merged and verified (campaign generator producing text variants).
- Read [`_context.md`](./_context.md).
- Workspace `client_supabase_url` + `client_supabase_service_key` already set (Everest is configured).

## Files involved

- **Create**: `supabase/migrations/008_workspaces_content_source.sql` — adds `workspaces.content_source jsonb`.
- **Create**: `src/lib/inventory/fetchVehicles.ts` — generic helper to fetch a client's inventory rows via their `client_supabase_url`.
- **Modify**: `src/lib/ai/campaignGenerator.ts` — when `content_source.type === 'vehicles'`, fetch vehicles, inject summaries into the prompt, parse vehicle picks back out.
- **Modify**: `src/app/api/workspaces/campaign/generate/route.ts` — pass workspace config + vehicles to the generator, then set `posts.vehicle_id` and `posts.media_urls` per generated post.
- **Modify**: `src/app/dashboard/workspaces/[id]/intelligence/page.tsx` — surface a small "Content source" config card so the agency can toggle inventory mode for a workspace (optional UI; can be SQL-only for v1 with just an info banner).
- **Seed**: SQL snippet to enable inventory mode for Everest.

## Migration 008

```sql
alter table public.workspaces
  add column if not exists content_source jsonb default '{}'::jsonb;
```

`content_source` shape (informational):

```jsonc
// Vehicles source (Everest)
{
  "type": "vehicles",
  "table": "cars",
  "filter": { "status": "eq.available" },
  "fields": "id,make,model,year,price,mileage,transmission,fuel_type,description,main_image_url,gallery_urls,features,slug",
  "site_base_url": "https://everestmotoring.co.za",
  "vehicle_path_template": "/cars/{slug}",
  "vehicle_post_share_within_days": 30
}

// No inventory (other clients) — empty object {} or omitted entirely
```

Enable for Everest after migration:

```sql
update public.workspaces
set content_source = '{
  "type": "vehicles",
  "table": "cars",
  "filter": { "status": "eq.available" },
  "fields": "id,make,model,year,price,mileage,transmission,fuel_type,description,main_image_url,gallery_urls,features,slug",
  "site_base_url": "https://everestmotoring.co.za",
  "vehicle_path_template": "/cars/{slug}",
  "vehicle_post_share_within_days": 30
}'::jsonb
where slug = 'everest-motoring';
```

## DeepSeek prompt

```
You are working on Ember Social, a Next.js 15 + Supabase social-media SaaS. The repo lives at ember-social/. Read ember-social/docs/roadmap/_context.md first — Supabase clients, slug-vs-UUID trap, publish spine, hard rules. Do not break the trigger → approve → cron → FB publish path. No new npm dependencies.

CONTEXT (already shipped, working):
- Day 1: client_intelligence has historical_voice, posting_cadence_observed, best_performing_hours, top_performing_themes.
- Day 2: campaign generator produces FB/IG/TikTok variants in posts.variants jsonb, with pillar + rationale. Each post gets its own unique approval_token.
- Workspaces have client_supabase_url + client_supabase_service_key for cross-supabase access (Everest is configured pointing at txwdlldcteblbejnrmen.supabase.co).
- posts.vehicle_id text column already exists (migration 002). publish.ts is untouched and reads only posts.content + posts.media_urls.

Task: Inventory-aware campaign variants — Day 5 of the Everest sprint.

────────────────────────────────────────────────────────
STEP 1 — Migration
────────────────────────────────────────────────────────

Create ember-social/supabase/migrations/008_workspaces_content_source.sql:

  alter table public.workspaces
    add column if not exists content_source jsonb default '{}'::jsonb;

Additive only.

────────────────────────────────────────────────────────
STEP 2 — Inventory fetch helper
────────────────────────────────────────────────────────

Create ember-social/src/lib/inventory/fetchVehicles.ts.

  export interface VehicleSummary {
    id: string
    slug?: string | null
    make?: string | null
    model?: string | null
    year?: number | null
    price?: number | null
    mileage?: number | null
    transmission?: string | null
    fuel_type?: string | null
    description?: string | null
    main_image_url?: string | null
    gallery_urls?: string[] | null
    features?: string[] | null
  }

  export async function fetchVehiclesForWorkspace(args: {
    clientSupabaseUrl: string
    clientServiceKey: string
    table: string
    fields: string                     // comma-separated for PostgREST select
    filter?: Record<string,string>     // e.g. { status: 'eq.available' }
    limit?: number                     // default 40
    notSharedWithinDays?: number       // e.g. 30 — excludes social_shared_at >= now() - N days
  }): Promise<VehicleSummary[]>

Implementation:
- Build a PostgREST URL: `${clientSupabaseUrl}/rest/v1/${table}?select=${fields}&order=created_at.desc&limit=${limit ?? 40}`.
- For each entry in filter, append `&{key}={value}` (e.g. status=eq.available).
- If notSharedWithinDays is set, add `&or=(social_shared_at.is.null,social_shared_at.lt.${ISO_OF_NOW_MINUS_N_DAYS})`.
- Headers: apikey + Bearer of clientServiceKey.
- Tolerate failure: log + return [] (never throw — the generator must still work in text-only fallback).

────────────────────────────────────────────────────────
STEP 3 — Generator: inventory-aware mode
────────────────────────────────────────────────────────

Modify ember-social/src/lib/ai/campaignGenerator.ts.

Update the args type:

  export async function generateCampaign(args: {
    workspaceId: string
    durationDays: number
    connectedPlatforms: string[]
    intel: any
    vehicles?: VehicleSummary[]   // NEW — when non-empty, AI is asked to feature them
    siteBaseUrl?: string          // NEW — for {url} placeholder in output
    vehiclePathTemplate?: string  // NEW — e.g. "/cars/{slug}"
  }): Promise<CampaignResult>

Extend the GeneratedPost type with an optional vehicle_id:

  export interface GeneratedPost {
    pillar: string
    rationale: string
    day_offset: number
    vehicle_id?: string | null     // NEW — the id of the vehicle this post features, or null
    variants: Partial<Record<'facebook' | 'instagram' | 'tiktok', { content: string; hashtags: string[] }>>
  }

Prompt changes when args.vehicles?.length > 0:
- Append an INVENTORY block to the system prompt listing each vehicle as compact JSON (id, year, make, model, price ZAR, mileage km, transmission, fuel_type, top 3 features, a 1-sentence description trim — keep each line under 200 chars).
- Add output-shape rules:
  - Add `vehicle_id` to the per-post shape (string id from INVENTORY, or null).
  - 70% of posts should feature a real vehicle (pick from INVENTORY). 30% can be brand/lifestyle/financing posts with vehicle_id = null.
  - Do not feature the same vehicle twice in the plan.
  - Variant content must reference real vehicle details (year, make, model, price, mileage, key feature) — no invented specs.
  - Always include the vehicle URL: `{siteBaseUrl}{vehiclePathTemplate replacing {slug}}` at the end of the FB variant content.
- All other rules from Day 2 still apply (Sunday-skip, char limits, hashtag counts, observed voice).

Parsing changes:
- Carry `vehicle_id` through to the returned GeneratedPost (default null).

When args.vehicles is empty/undefined: behave exactly as Day 2 (text-only). No vehicle references in the prompt.

────────────────────────────────────────────────────────
STEP 4 — Orchestrator: pass inventory + persist media + vehicle_id
────────────────────────────────────────────────────────

Modify ember-social/src/app/api/workspaces/campaign/generate/route.ts.

After resolving workspaceId, also fetch the workspace's content_source jsonb and client_supabase_url + client_supabase_service_key:

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('content_source, client_supabase_url, client_supabase_service_key')
    .eq('id', resolvedId)
    .single()

  const source = (workspace as any)?.content_source || {}
  let vehicles: VehicleSummary[] = []
  if (source.type === 'vehicles' &&
      (workspace as any).client_supabase_url &&
      (workspace as any).client_supabase_service_key) {
    vehicles = await fetchVehiclesForWorkspace({
      clientSupabaseUrl: (workspace as any).client_supabase_url,
      clientServiceKey: (workspace as any).client_supabase_service_key,
      table: source.table || 'cars',
      fields: source.fields || 'id,make,model,year,price,mileage,transmission,fuel_type,description,main_image_url,gallery_urls,features,slug',
      filter: source.filter || {},
      limit: 40,
      notSharedWithinDays: source.vehicle_post_share_within_days || 30,
    })
  }

Pass to the generator:

  const result = await generateCampaign({
    workspaceId: resolvedId,
    durationDays: days,
    connectedPlatforms,
    intel,
    vehicles,
    siteBaseUrl: source.site_base_url,
    vehiclePathTemplate: source.vehicle_path_template,
  })

When inserting each post:
- If `post.vehicle_id` is a non-empty string AND that id matches a vehicle in the fetched list:
  - Lookup the matched vehicle.
  - Set `posts.vehicle_id = matchedVehicle.id`.
  - Set `posts.media_urls = [matchedVehicle.main_image_url, ...(matchedVehicle.gallery_urls || []).slice(0,2)].filter(Boolean)`.
- Else:
  - Set `posts.vehicle_id = null`.
  - Set `posts.media_urls = null` (text-only post, as Day 2 behaved).

Everything else (per-post approval_token, status='pending_approval', scheduled_at via getNextAvailableDate, etc.) stays from Day 2.

────────────────────────────────────────────────────────
STEP 5 — Surface content_source in the UI (info-only for v1)
────────────────────────────────────────────────────────

Modify ember-social/src/app/dashboard/workspaces/[id]/intelligence/page.tsx.

Below the "Scan brand + social" card, add a small read-only info card titled "Content source" that displays the current content_source.type (or "Text-only" if empty). For Everest it will show "Vehicles · cars table · 40-vehicle pool".

Editing the content_source is OUT OF SCOPE for v1 — agency operators set it via SQL. Keep the card read-only to avoid breaking other clients.

────────────────────────────────────────────────────────
STEP 6 — Enable inventory mode for Everest
────────────────────────────────────────────────────────

Add a one-off SQL snippet to docs/roadmap/day-5-inventory-aware-variants.md (this file already contains it under "Migration 008"). The operator runs:

  update public.workspaces
  set content_source = '{
    "type": "vehicles",
    "table": "cars",
    "filter": { "status": "eq.available" },
    "fields": "id,make,model,year,price,mileage,transmission,fuel_type,description,main_image_url,gallery_urls,features,slug",
    "site_base_url": "https://everestmotoring.co.za",
    "vehicle_path_template": "/cars/{slug}",
    "vehicle_post_share_within_days": 30
  }'::jsonb
  where slug = 'everest-motoring';

────────────────────────────────────────────────────────
CONSTRAINTS
────────────────────────────────────────────────────────

1. Don't touch publish.ts. It already handles media_urls correctly.
2. Don't touch the trigger route. Everest's per-car flow stays intact.
3. resolveWorkspaceId() before any uuid-typed write.
4. No new npm deps.
5. Migrations additive only.
6. fetchVehicles MUST tolerate failure — return [] on any error so the campaign generator falls back to text-only.
7. The orchestrator MUST tolerate posts where post.vehicle_id is set but no matching vehicle exists (e.g. AI hallucinated an id). Fall back to text-only for that post (media_urls = null, vehicle_id = null).
8. Sparse comments. South African English ("colour", "metres").

────────────────────────────────────────────────────────
ACCEPTANCE CRITERIA
────────────────────────────────────────────────────────

[ ] supabase/migrations/008_workspaces_content_source.sql exists, additive.
[ ] src/lib/inventory/fetchVehicles.ts exists with the exported function signature above. Tolerates errors, returns [].
[ ] src/lib/ai/campaignGenerator.ts accepts vehicles + siteBaseUrl + vehiclePathTemplate; when vehicles.length > 0, prompt features the inventory and outputs include vehicle_id per post.
[ ] src/app/api/workspaces/campaign/generate/route.ts reads workspace.content_source, fetches vehicles when type='vehicles', passes them to generator, and persists posts.vehicle_id + posts.media_urls (main_image_url + up to 2 gallery_urls) for vehicle-bound posts.
[ ] Intelligence page shows a read-only "Content source" card stating the type ("Vehicles" or "Text-only").
[ ] On Everest after running the seed SQL and clicking "Generate Marketing Plan": ~70% of created posts have a non-null vehicle_id and non-null media_urls with at least one image URL pointing to txwdlldcteblbejnrmen.supabase.co; the FB variant content mentions real make/model/year from the matched vehicle; the URL at the end of the FB variant is a https://everestmotoring.co.za/cars/{slug} link.
[ ] Existing trigger spine still works for Everest's per-car posts (manual sanity: trigger an Everest car post via socialAction.js — should land in pending_approval as before).
[ ] npm run build clean. No new npm deps.

────────────────────────────────────────────────────────
OUTPUT FORMAT
────────────────────────────────────────────────────────

Return:
1. Full content of each new file as a fenced code block prefixed by the file path.
2. Unified diff for each modified file.
3. Short summary (≤ 10 lines): what changed, anything you flagged or simplified, any acceptance-criteria item you couldn't confirm without running code.
```

## Out of scope (defer)

- Per-platform vehicle-image picking (different aspect ratio per platform) — single shared `media_urls` for v1.
- Auto-rotation logic that tracks which vehicles have been featured across multiple campaign batches over time — for v1, just exclude vehicles `social_shared_at` < N days ago.
- Video posts in the campaign plan (reels/walkthroughs) — keep Day 5 to feed-style image posts; the existing trigger flow already handles reels per car.
- UI editor for `content_source` — SQL-only for v1.
- Other inventory types (real-estate listings, e-commerce products) — schema supports them via `content_source.type` but no implementation in Day 5.
