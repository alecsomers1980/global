# Woodpecker Guesthouse Room Editor (Photos + Amenities) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins add/remove room photos (with drag-reorder and a hero pick) and toggle amenities from a curated icon-labeled list, in the existing `/admin/rooms/[id]` editor — and show those amenities as icon chips on the public room-detail page.

**Architecture:** Two new self-contained, controlled React components (`AmenitiesPicker`, `RoomPhotoManager`) backed by a plain data file of curated amenities + one SVG icon per amenity. Both wire into the existing `admin/rooms/[id]/page.tsx` form, whose `updateRoom()` call already accepts a `Partial<Room>` patch — no new lib functions or schema changes needed. A one-off Node script canonicalizes the one inconsistent existing amenity string ("TV" → "Flat-screen TV") so all 8 rooms' real data matches the curated labels.

**Tech Stack:** Next.js 16 (App Router, TypeScript), Supabase (Postgres via `@supabase/supabase-js`, Storage), Tailwind v4. No new dependencies.

## Global Constraints

- No new npm dependencies (spec: reuse native HTML5 drag-and-drop, not a library).
- No schema changes — `rooms.amenities` and `rooms.gallery_images` already exist as `text[]` columns.
- Amenities are a closed, curated set (spec: no freeform admin text entry).
- This repo has **no automated test runner** (confirmed: `package.json` has only `dev`/`build`/`start` scripts, no test framework). Every task's verification step is either `npx tsc --noEmit` (logic-only tasks) or a live manual check against `npm run dev` (UI tasks) — per the approved spec's own Testing section.
- Per project convention: **do not run `npm run build` while `npm run dev` is active** in the same directory — it corrupts the `.next` manifest. Use `npx tsc --noEmit` for a build-free type check instead.
- Match existing code style exactly: Tailwind utility classes copied from sibling admin components (`GalleryManager.tsx`), same icon SVG shape (`viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"`) as `src/components/site/DetailIcons.tsx`.
- Work happens in the git worktree at `C:/tmp/woodpecker-deploy/woodpecker-guesthouse` (branch `feat/woodpecker-guesthouse`) — do not touch the main Antigravity working directory.

---

### Task 1: Curated amenities data + icon set

**Files:**
- Create: `src/components/admin/AmenityIcons.tsx`
- Create: `src/lib/room-amenities.ts`
- Test: none (no test runner) — verify with `npx tsc --noEmit`

**Interfaces:**
- Consumes: `BathIcon` from `@/components/site/DetailIcons` (existing).
- Produces: `AMENITIES: AmenityDef[]` and `findAmenityByLabel(label: string): AmenityDef | undefined` from `@/lib/room-amenities`, where `AmenityDef = { key: string; label: string; Icon: ComponentType<{ className?: string }> }`. Tasks 2 and 5 both import from here.

- [ ] **Step 1: Create the icon set**

Create `src/components/admin/AmenityIcons.tsx`:

```tsx
// One small line icon per curated room amenity — same minimal stroke style
// as src/components/site/DetailIcons.tsx (viewBox 24x24, stroke=currentColor,
// strokeWidth 1.5). "En-suite bathroom" reuses the existing BathIcon instead
// of duplicating it — see room-amenities.ts.

type Props = { className?: string };

export function BarFridgeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="2" width="12" height="20" rx="1" />
      <line x1="6" y1="9" x2="18" y2="9" />
      <line x1="9" y1="4.5" x2="9" y2="6.5" />
      <line x1="9" y1="11.5" x2="9" y2="14" />
    </svg>
  );
}

export function KettleIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3a6 6 0 0 0-6-6H9a4 4 0 0 0-4 4v5Z" />
      <path d="M15 12l4-2" />
      <circle cx="9" cy="8" r="1" />
    </svg>
  );
}

export function AirconIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <path d="M6 14c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0" />
      <path d="M6 18c1 1 2 1 3 0s2-1 3 0 2 1 3 0 2-1 3 0" />
    </svg>
  );
}

export function FlatscreenTvIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <path d="M9 20h6M12 16v4" />
    </svg>
  );
}

export function DstvIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 16a9 9 0 0 1 9-9" />
      <path d="M12 7l8 8" />
      <circle cx="20" cy="15" r="1.5" />
      <path d="M12 16v5M9 21h6" />
    </svg>
  );
}

export function GardenViewIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l5 7h-3l4 6h-3l3 6H6l3-6H6l4-6H7Z" />
      <line x1="12" y1="21" x2="12" y2="19" />
    </svg>
  );
}

export function CouchIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      <rect x="3" y="12" width="18" height="6" rx="2" />
      <path d="M5 18v2M19 18v2" />
    </svg>
  );
}

export function JacuzziIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2Z" />
      <path d="M6 14V8a2 2 0 0 1 4 0" />
      <circle cx="15" cy="8" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FanIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c0-3 2-6 5-6s2 4-1 5" />
      <path d="M14 12c3 0 6 2 6 5s-4 2-5-1" />
      <path d="M10 12c-3 0-6-2-6-5s4-2 5 1" />
    </svg>
  );
}

export function VerandaIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-5 9 5" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function BalconyIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10h16" />
      <path d="M4 10v10M20 10v10" />
      <path d="M7 10v6M11 10v6M13 10v6M17 10v6" />
    </svg>
  );
}

export function InterlinkingIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="6" width="8" height="12" rx="1" />
      <rect x="14" y="6" width="8" height="12" rx="1" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

export function WifiIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 8.5a15 15 0 0 1 20 0" />
      <path d="M5.5 12a10 10 0 0 1 13 0" />
      <path d="M9 15.5a5 5 0 0 1 6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SafeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="9" x2="12" y2="10.5" />
    </svg>
  );
}

export function HairdryerIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5" />
      <path d="M4 9h13l4 1-1 3-3-1H4a4 4 0 0 1 0-3Z" />
      <path d="M7 12l-1.5 7" />
    </svg>
  );
}

export function NonSmokingIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 15h11v3H3z" />
      <path d="M16 15c1-1 1-2 0-3" />
      <circle cx="12" cy="12" r="9" />
      <line x1="5" y1="19" x2="19" y2="5" />
    </svg>
  );
}

export function MosquitoNetIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v4" />
      <path d="M4 21c0-6 3.5-11 8-11s8 5 8 11" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function BraaiAreaIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3c-1.5 2-2 3.5-1 5 .3-.7.8-1 .8-1 .2 1 .8 1.6.8 2.4 0 1.5-1.3 2.6-2.8 2.6A2.8 2.8 0 0 1 7 9.2C7 6.6 9 4.3 12 3Z" />
      <line x1="5" y1="16" x2="19" y2="16" />
      <line x1="7" y1="16" x2="7" y2="21" />
      <line x1="17" y1="16" x2="17" y2="21" />
    </svg>
  );
}
```

- [ ] **Step 2: Create the curated amenities list**

Create `src/lib/room-amenities.ts`:

```ts
import type { ComponentType } from "react";
import {
  BarFridgeIcon,
  KettleIcon,
  AirconIcon,
  FlatscreenTvIcon,
  DstvIcon,
  GardenViewIcon,
  CouchIcon,
  JacuzziIcon,
  FanIcon,
  VerandaIcon,
  BalconyIcon,
  InterlinkingIcon,
  WifiIcon,
  SafeIcon,
  HairdryerIcon,
  NonSmokingIcon,
  MosquitoNetIcon,
  BraaiAreaIcon,
} from "@/components/admin/AmenityIcons";
import { BathIcon } from "@/components/site/DetailIcons";

export type AmenityDef = {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

// Curated, closed set — 13 entries match real data already in the 8 rooms
// (see the 2026-09-08 design spec), 6 are common guesthouse toggles added
// even though unused today. Adding a new amenity later means adding one
// entry here, not an admin-facing "custom" feature (deliberate trade-off,
// approved in the spec).
export const AMENITIES: AmenityDef[] = [
  { key: "bar_fridge", label: "Bar fridge", Icon: BarFridgeIcon },
  { key: "kettle", label: "Kettle", Icon: KettleIcon },
  { key: "aircon", label: "Air-con", Icon: AirconIcon },
  { key: "flatscreen_tv", label: "Flat-screen TV", Icon: FlatscreenTvIcon },
  { key: "dstv", label: "DStv", Icon: DstvIcon },
  { key: "garden_view", label: "Garden view", Icon: GardenViewIcon },
  { key: "couch", label: "Couch", Icon: CouchIcon },
  { key: "ensuite", label: "En-suite bathroom", Icon: BathIcon },
  { key: "jacuzzi", label: "Jacuzzi", Icon: JacuzziIcon },
  { key: "fan", label: "Fan", Icon: FanIcon },
  { key: "veranda", label: "Veranda", Icon: VerandaIcon },
  { key: "balcony", label: "Balcony", Icon: BalconyIcon },
  { key: "interlinking", label: "Interlinking rooms", Icon: InterlinkingIcon },
  { key: "wifi", label: "WiFi", Icon: WifiIcon },
  { key: "safe", label: "Safe", Icon: SafeIcon },
  { key: "hairdryer", label: "Hairdryer", Icon: HairdryerIcon },
  { key: "non_smoking", label: "Non-smoking", Icon: NonSmokingIcon },
  { key: "mosquito_net", label: "Mosquito net", Icon: MosquitoNetIcon },
  { key: "braai_area", label: "Braai area", Icon: BraaiAreaIcon },
];

export function findAmenityByLabel(label: string): AmenityDef | undefined {
  return AMENITIES.find((a) => a.label === label);
}
```

- [ ] **Step 3: Type-check**

Run: `cd /c/tmp/woodpecker-deploy/woodpecker-guesthouse && npx tsc --noEmit`
Expected: no errors (exit code 0). This confirms both new files compile and the `BathIcon` import path is correct — it's the only cross-check possible before Task 2 wires the picker in visually.

- [ ] **Step 4: Commit**

```bash
cd /c/tmp/woodpecker-deploy/woodpecker-guesthouse
git add src/components/admin/AmenityIcons.tsx src/lib/room-amenities.ts
git commit -m "feat(woodpecker-guesthouse): add curated amenities list with icons

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: AmenitiesPicker component

**Files:**
- Create: `src/components/admin/AmenitiesPicker.tsx`
- Test: none — verify with `npx tsc --noEmit`

**Interfaces:**
- Consumes: `AMENITIES` from `@/lib/room-amenities` (Task 1).
- Produces: default export `AmenitiesPicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void })`. Task 4 renders this directly.

- [ ] **Step 1: Create the component**

Create `src/components/admin/AmenitiesPicker.tsx`:

```tsx
"use client";

import { AMENITIES } from "@/lib/room-amenities";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export default function AmenitiesPicker({ value, onChange }: Props) {
  const toggle = (label: string) => {
    if (value.includes(label)) onChange(value.filter((v) => v !== label));
    else onChange([...value, label]);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {AMENITIES.map(({ key, label, Icon }) => {
        const checked = value.includes(label);
        return (
          <label
            key={key}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
              checked ? "border-terracotta bg-terracotta/5 text-ink" : "border-line text-muted"
            }`}
          >
            <input type="checkbox" checked={checked} onChange={() => toggle(label)} className="accent-terracotta" />
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </label>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AmenitiesPicker.tsx
git commit -m "feat(woodpecker-guesthouse): add AmenitiesPicker admin component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: RoomPhotoManager component

**Files:**
- Create: `src/components/admin/RoomPhotoManager.tsx`
- Test: none — verify with `npx tsc --noEmit`

**Interfaces:**
- Consumes: `uploadFiles(files: File[], folder: string): Promise<{ urls: string[]; errors: string[] }>` from `@/lib/admin/gallery` (existing, unchanged — this is the same helper `GalleryManager.tsx` already uses).
- Produces: default export `RoomPhotoManager({ roomId, galleryImages, heroImage, onChange }: { roomId: string; galleryImages: string[]; heroImage: string | null; onChange: (next: { galleryImages: string[]; heroImage: string | null }) => void })`. Task 4 renders this directly.

- [ ] **Step 1: Create the component**

Create `src/components/admin/RoomPhotoManager.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { uploadFiles } from "@/lib/admin/gallery";

type Props = {
  roomId: string;
  galleryImages: string[];
  heroImage: string | null;
  onChange: (next: { galleryImages: string[]; heroImage: string | null }) => void;
};

export default function RoomPhotoManager({ roomId, galleryImages, heroImage, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const { urls, errors } = await uploadFiles(files, `rooms/${roomId}`);
      const nextGallery = [...galleryImages, ...urls];
      // First photo ever uploaded auto-becomes hero, so RoomCard never
      // shows blank while an admin is still mid-setup on a new room.
      const nextHero = heroImage ?? (nextGallery.length > 0 ? nextGallery[0] : null);
      onChange({ galleryImages: nextGallery, heroImage: nextHero });
      if (errors.length > 0) setUploadError(errors.join("; "));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (url: string) => {
    const nextGallery = galleryImages.filter((u) => u !== url);
    // Deleting the current hero auto-promotes the new first photo — admin
    // can immediately re-pick a different one via "Set as hero".
    const nextHero = heroImage === url ? (nextGallery[0] ?? null) : heroImage;
    onChange({ galleryImages: nextGallery, heroImage: nextHero });
  };

  const handleSetHero = (url: string) => {
    onChange({ galleryImages, heroImage: url });
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...galleryImages];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onChange({ galleryImages: next, heroImage });
    setDragIndex(null);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        disabled={uploading}
        className="text-sm text-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-terracotta file:text-white file:font-semibold file:text-sm file:cursor-pointer hover:file:bg-terracotta-deep disabled:opacity-60"
      />
      {uploading && <span className="text-muted text-xs ml-2">Uploading…</span>}
      {uploadError && <p className="text-red-600 text-xs mt-2">{uploadError}</p>}

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
          {galleryImages.map((url, i) => {
            const isHero = url === heroImage;
            return (
              <div
                key={url}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border cursor-move ${
                  isHero ? "border-terracotta ring-2 ring-terracotta" : "border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(url)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => handleSetHero(url)}
                  className={`absolute bottom-2 left-2 right-2 text-xs font-semibold py-1 rounded transition-colors ${
                    isHero ? "bg-terracotta text-white" : "bg-black/60 text-white hover:bg-black/80"
                  }`}
                >
                  {isHero ? "Hero photo" : "Set as hero"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/RoomPhotoManager.tsx
git commit -m "feat(woodpecker-guesthouse): add RoomPhotoManager admin component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: One-off amenities data migration

**Files:**
- Create: `scripts/migrate-room-amenities.mjs`
- Test: none (data script) — verify by re-querying the live table after running

**Interfaces:**
- Consumes: none from earlier tasks (pure data fix, can run independently) — but must run before Task 5's public-page chips ship, so "TV" isn't left unmatched against `AMENITIES` labels.
- Produces: nothing other tasks import — updates live Supabase data only.

- [ ] **Step 1: Create the script**

Create `scripts/migrate-room-amenities.mjs`:

```js
// One-off: canonicalizes "TV" -> "Flat-screen TV" in rooms.amenities so
// every existing value matches a label in src/lib/room-amenities.ts (only
// Budget Room has bare "TV" today — the other 7 rooms already say
// "Flat-screen TV"). Needed for the admin AmenitiesPicker checkboxes and
// the public icon-chip lookup (findAmenityByLabel) to recognize it.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey);

const { data: rooms, error } = await supabase.from("rooms").select("id, name, amenities");
if (error) throw error;

for (const room of rooms) {
  if (!room.amenities.includes("TV")) continue;
  const next = room.amenities.map((a) => (a === "TV" ? "Flat-screen TV" : a));
  const deduped = [...new Set(next)]; // in case "Flat-screen TV" is already present too
  const { error: updateError } = await supabase.from("rooms").update({ amenities: deduped }).eq("id", room.id);
  if (updateError) throw updateError;
  console.log(`${room.name}: ${JSON.stringify(room.amenities)} -> ${JSON.stringify(deduped)}`);
}
console.log("Done.");
```

- [ ] **Step 2: Run it**

Run: `cd /c/tmp/woodpecker-deploy/woodpecker-guesthouse && node --env-file=.env.local scripts/migrate-room-amenities.mjs`
Expected output: exactly one line — `Budget Room: ["Fan","TV","DStv"] -> ["Fan","Flat-screen TV","DStv"]` — followed by `Done.`

- [ ] **Step 3: Verify against live data**

Run:
```bash
curl -s "https://zobqmbjojquckapwonhu.supabase.co/rest/v1/rooms?select=name,amenities&name=eq.Budget%20Room" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```
Expected: `amenities` for Budget Room now reads `["Fan","Flat-screen TV","DStv"]`, no `"TV"` anywhere in the response.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-room-amenities.mjs
git commit -m "chore(woodpecker-guesthouse): migrate 'TV' amenity to 'Flat-screen TV'

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Wire AmenitiesPicker + RoomPhotoManager into the admin room editor

**Files:**
- Modify: `src/app/admin/rooms/[id]/page.tsx` (full file, shown below)

**Interfaces:**
- Consumes: `AmenitiesPicker` (Task 2), `RoomPhotoManager` (Task 3), existing `updateRoom` from `@/lib/admin/rooms` (unchanged signature — `Partial<Room>` patch).
- Produces: nothing later tasks depend on — this is the last code change; Task 6 is independent (public page).

- [ ] **Step 1: Replace the file**

Replace the full contents of `src/app/admin/rooms/[id]/page.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoomByIdAdmin, updateRoom } from "@/lib/admin/rooms";
import type { Room } from "@/lib/types";
import AmenitiesPicker from "@/components/admin/AmenitiesPicker";
import RoomPhotoManager from "@/components/admin/RoomPhotoManager";

export default function AdminRoomEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getRoomByIdAdmin(params.id).then(setRoom);
  }, [params.id]);

  if (!room) return <p className="text-muted">Loading…</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await updateRoom(room.id, {
      name: room.name,
      description: room.description,
      bed_type: room.bed_type,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      max_guests: room.max_guests,
      rate_from: room.rate_from,
      amenities: room.amenities,
      hero_image: room.hero_image,
      gallery_images: room.gallery_images,
      published: room.published,
    });
    setSaving(false);
    if (updateError) setError(updateError);
    else {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">{room.name}</h1>
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-line bg-white p-6">
        <div>
          <label className="block text-sm text-ink mb-1">Name</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={room.name}
            onChange={(e) => setRoom({ ...room, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Description</label>
          <textarea
            rows={4}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={room.description}
            onChange={(e) => setRoom({ ...room, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Bed type</label>
            <input
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bed_type}
              onChange={(e) => setRoom({ ...room, bed_type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Rate from (ZAR/night)</label>
            <input
              type="number"
              step="0.01"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.rate_from ?? ""}
              onChange={(e) => setRoom({ ...room, rate_from: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Bedrooms</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bedrooms}
              onChange={(e) => setRoom({ ...room, bedrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Bathrooms</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bathrooms}
              onChange={(e) => setRoom({ ...room, bathrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Max guests</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.max_guests}
              onChange={(e) => setRoom({ ...room, max_guests: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-ink mb-2">Amenities</label>
          <AmenitiesPicker value={room.amenities} onChange={(amenities) => setRoom({ ...room, amenities })} />
        </div>

        <div>
          <label className="block text-sm text-ink mb-2">Photos</label>
          <RoomPhotoManager
            roomId={room.id}
            galleryImages={room.gallery_images}
            heroImage={room.hero_image}
            onChange={({ galleryImages, heroImage }) =>
              setRoom({ ...room, gallery_images: galleryImages, hero_image: heroImage })
            }
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={room.published}
            onChange={(e) => setRoom({ ...room, published: e.target.checked })}
          />
          Published (visible on the public site)
        </label>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {saved && <p className="text-sm text-olive-deep bg-olive/10 rounded-lg px-3 py-2">Saved.</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-terracotta text-white px-6 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification against the live admin**

1. Run: `npm run dev` (if not already running)
2. Log in at `http://localhost:3000/admin/login` as `alec@emb3r.co.za`
3. Go to `http://localhost:3000/admin/rooms`, open any room
4. Confirm: the old "Hero image URL" text field is gone, replaced by a photo grid + upload button; an "Amenities" checkbox grid with icons appears above "Photos"
5. Upload a test image (any local image file) — confirm it appears in the grid and, if this room had no photos before, is auto-marked "Hero photo"
6. Drag a second uploaded photo to the first position — confirm the order visually swaps
7. Click "Set as hero" on a different photo — confirm the badge moves
8. Click ✕ on a photo — confirm it's removed from the grid
9. Toggle a couple of amenity checkboxes, click "Save changes" — confirm "Saved." appears
10. Reload the page — confirm the photo order, hero pick, and amenity selections all persisted

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/rooms/[id]/page.tsx
git commit -m "feat(woodpecker-guesthouse): wire amenities + photo manager into room editor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Public room-detail page — icon-per-amenity chips

**Files:**
- Modify: `src/app/accommodation/[slug]/page.tsx:1-9` and `:65-73`

**Interfaces:**
- Consumes: `findAmenityByLabel` from `@/lib/room-amenities` (Task 1).
- Produces: nothing — final task.

- [ ] **Step 1: Update the import block**

In `src/app/accommodation/[slug]/page.tsx`, replace lines 1-9:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoomBySlug, getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";
import Reveal from "@/components/site/Reveal";
import RoomGallery from "@/components/site/RoomGallery";
import { GuestsIcon, BedIcon, RoomsIcon, BathIcon, AmenitiesIcon } from "@/components/site/DetailIcons";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed
```

with:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoomBySlug, getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";
import Reveal from "@/components/site/Reveal";
import RoomGallery from "@/components/site/RoomGallery";
import { GuestsIcon, BedIcon, RoomsIcon, BathIcon, AmenitiesIcon } from "@/components/site/DetailIcons";
import { findAmenityByLabel } from "@/lib/room-amenities";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed
```

(Only the new import line and nothing else changes here.)

- [ ] **Step 2: Replace the amenities block**

In the same file, replace this block (originally lines 65-73):

```tsx
              {room.amenities.length > 0 && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <AmenitiesIcon className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted text-xs">Amenities</p>
                    <p className="text-ink font-medium">{room.amenities.join(", ")}</p>
                  </div>
                </div>
              )}
```

with:

```tsx
              {room.amenities.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-muted text-xs mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {room.amenities.map((label) => {
                      const match = findAmenityByLabel(label);
                      const Icon = match?.Icon ?? AmenitiesIcon;
                      return (
                        <div key={label} className="flex items-center gap-1.5 text-sm text-ink">
                          <Icon className="w-4 h-4 text-terracotta shrink-0" />
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
```

(`AmenitiesIcon` stays imported and used here as the fallback for any amenity string that doesn't match a curated label — per the spec, nothing should silently disappear.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `curl -s http://localhost:3000/accommodation/deluxe-suite-room | grep -o "Bar fridge\|Kettle\|Air-con"`
Expected: all three amenity labels present in the HTML (Deluxe Suite Room's real amenities per the live data).

Then open `http://localhost:3000/accommodation/deluxe-suite-room` in a browser and visually confirm each amenity shows its own icon next to its label, not one generic icon with a comma-separated list.

- [ ] **Step 5: Commit**

```bash
git add src/app/accommodation/\[slug\]/page.tsx
git commit -m "feat(woodpecker-guesthouse): icon-per-amenity chips on room detail page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Push the branch**

```bash
git push origin feat/woodpecker-guesthouse
```

---

## Self-Review Notes

- **Spec coverage:** §1 Amenities → Tasks 1, 2, 4, 6. §2 Photo manager → Task 3. §3 Public detail page → Task 6. §4 Wiring → Task 5. Migration note → Task 4. All spec sections have a task.
- **Placeholder scan:** none found — every step has complete code or an exact command with expected output.
- **Type consistency:** `AmenityDef` (Task 1) used identically in `AmenitiesPicker` (Task 2) and `findAmenityByLabel` (Task 6). `RoomPhotoManager`'s `onChange` shape (`{ galleryImages, heroImage }`) matches exactly how Task 5 destructures it. `updateRoom`'s `Partial<Room>` patch in Task 5 uses the same field names (`amenities`, `hero_image`, `gallery_images`) as the `Room` type.
