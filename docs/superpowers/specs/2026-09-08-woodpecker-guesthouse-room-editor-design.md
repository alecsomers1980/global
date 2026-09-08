# Woodpecker Guesthouse — Room Editor: Photos & Amenities

**Date:** 2026-09-08
**Status:** Approved, ready for implementation plan

## Problem

The admin room editor (`/admin/rooms/[id]`) covers name, description, bed type, bedrooms, bathrooms, max guests, rate, published, and a single pasted hero-image URL. Two fields that already exist on the `rooms` table and type (`amenities: string[]`, `gallery_images: string[]`) have **no admin UI at all** — they were populated once during the WordPress-export migration and have been unmanageable since. Staff need to add/remove room photos and edit amenities without a redeploy.

## Goals

- Admin can upload, delete, and reorder a room's photos, and pick one as the hero (card/detail) image — no more manual URL pasting.
- Admin can toggle a room's amenities from a curated, icon-labeled list.
- The public room-detail page shows one icon per amenity (replacing today's single generic icon + comma-separated text).
- No schema changes — both fields already exist as `text[]` columns.

## Non-goals

- Freeform/custom amenity text entry (deliberately closed to a curated set — extending the set later is a one-line addition to a constants file, not an admin-facing feature).
- Storage cleanup on delete (matches the existing Gallery admin's own `deleteImage`, which only removes the DB/array reference and leaves the file in the `site-media` bucket — not a new gap introduced by this work).
- Changes to `RoomCard` or how the public accommodation-index page reads `hero_image` — unchanged.

## Design

### 1. Amenities: curated list with icons

`src/lib/room-amenities.ts` — a fixed array of `{ key: string; label: string }`, one entry per curated amenity. Built from what's **actually** in the live data today (13 real values across the 8 rooms, "TV" and "Flat-screen TV" canonicalized into one `flatscreen_tv` entry) plus a handful of near-universal guesthouse toggles worth having available even though unused today:

| key | label | from real data? |
|---|---|---|
| `bar_fridge` | Bar fridge | yes |
| `kettle` | Kettle | yes |
| `aircon` | Air-con | yes |
| `flatscreen_tv` | Flat-screen TV | yes (merged w/ "TV") |
| `dstv` | DStv | yes |
| `garden_view` | Garden view | yes |
| `couch` | Couch | yes |
| `ensuite` | En-suite bathroom | yes |
| `jacuzzi` | Jacuzzi | yes |
| `fan` | Fan | yes |
| `veranda` | Veranda | yes |
| `balcony` | Balcony | yes |
| `interlinking` | Interlinking rooms | yes |
| `wifi` | WiFi | no — added as a common toggle |
| `safe` | Safe | no |
| `hairdryer` | Hairdryer | no |
| `non_smoking` | Non-smoking | no |
| `mosquito_net` | Mosquito net | no |
| `braai_area` | Braai area | no |

`src/components/admin/AmenityIcons.tsx` — one small hand-drawn SVG per key, same minimal-line-icon stroke style as the existing `DetailIcons.tsx`/`FacilityIcons.tsx` (`viewBox 0 0 24 24`, `stroke="currentColor"`, `strokeWidth 1.5`).

`src/components/admin/AmenitiesPicker.tsx` — controlled checkbox grid: `{ value: string[]; onChange: (next: string[]) => void }`. Renders icon + label per curated entry; checking/unchecking adds/removes that entry's `label` from the array (the `rooms.amenities` column stores labels, matching what's there today — not keys — so the public page's existing `.join(", ")` fallback and any other reader keeps working unchanged during rollout).

**One-time data migration:** the 8 existing rooms' amenity strings need to be re-mapped so "TV" becomes "Flat-screen TV" wherever it appears (the only real inconsistency found) — done as a one-off `UPDATE` during implementation, not a recurring migration step.

### 2. Photo manager (replaces the hero-image URL field)

`gallery_images` becomes the single list a room's photos live in — upload, delete, and reorder all act on it, in array order. `hero_image` stays its own column (`RoomCard` keeps reading it directly, the detail-page carousel already prefers `gallery_images` over it) — the admin now picks the hero from among the uploaded photos instead of pasting a URL.

`src/components/admin/RoomPhotoManager.tsx` — controlled: `{ roomId: string; galleryImages: string[]; heroImage: string | null; onChange: (next: { galleryImages: string[]; heroImage: string | null }) => void }`.

- **Upload:** multi-file picker → each file through the existing `/api/admin/upload` route (sharp→WebP optimize, writes to the `site-media` bucket) under folder `rooms/<roomId>`, same pattern the Gallery admin already uses. Returned URLs append to `galleryImages`.
- **Grid:** thumbnails in array order, each with a delete (×) button and a "Set as hero" toggle; the current hero gets a visible badge/border.
- **Reorder:** native HTML5 drag-and-drop (`draggable`, `onDragStart`/`onDragOver`/`onDrop`) — no new dependency, this project has none for this today.
- **Delete:** removes the URL from `galleryImages` only (file stays in Storage, unreferenced — matches the Gallery admin's existing behavior).
- **Edge cases:** the first photo ever uploaded auto-becomes hero (so `RoomCard` never shows blank). Deleting the current hero auto-promotes the new first photo in the array as hero, with an inline note so the admin notices and can re-pick if they want a different one.

### 3. Public detail page: icon-per-amenity

`src/app/accommodation/[slug]/page.tsx` currently renders one `AmenitiesIcon` + `room.amenities.join(", ")`. Change to a small wrap-grid of chips, one per amenity in `room.amenities`, each showing its matching icon (looked up by label against `room-amenities.ts`) + text. An amenity string that doesn't match any curated label (stale data, shouldn't happen after the migration above) falls back to plain text with the existing generic `AmenitiesIcon`, so nothing silently disappears.

### 4. Wiring

`src/app/admin/rooms/[id]/page.tsx`: replace the hero-image URL `<input>` with `<RoomPhotoManager>`, add `<AmenitiesPicker>` below the existing fields. `updateRoom()` (`src/lib/admin/rooms.ts`) already accepts a partial `Room`-shaped update — `amenities`, `gallery_images`, `hero_image` just join the existing save call, no changes needed there.

## Error handling

- Per-file upload failures show inline on that thumbnail slot, not a whole-batch failure — other files in the same batch still complete.
- Save failures reuse the form's existing error-banner pattern (already present in the current edit page).

## Testing

Manual click-through against the live admin (per project notes, this admin has never been driven end-to-end): upload, delete, reorder, hero-swap, amenity toggle, save — then verify the public accommodation index + detail pages reflect the change. No existing automated test suite in this project to extend.

## Open risks

- Curated amenity set is closed — a genuinely new amenity later needs a code change (one line in `room-amenities.ts`), not just an admin action. Accepted trade-off, discussed and confirmed.
