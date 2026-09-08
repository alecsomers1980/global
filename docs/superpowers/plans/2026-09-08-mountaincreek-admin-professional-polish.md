# Mountain Creek Lodge — Admin Professional Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Mountain Creek Lodge admin area a consistent, professional shell (sidebar nav, shared page-header/button/input primitives) without changing its boutique-lodge brand or any functional behavior, plus add a real editable "Bedrooms" field to Accommodation units.

**Architecture:** Introduce five small shared UI primitives (`src/components/admin/ui/`), extract the Packages tab out of `app/admin/page.js` into its own `PackagesManager.js` (matching the existing pattern of the other four managers), rebuild `app/admin/page.js`'s shell around a left sidebar + `PageHeader`, then pass through each of the five managers replacing one-off Tailwind class strings with the shared primitives. Add `bedrooms` as a real column end-to-end (migration → lib → form → public page).

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS, Supabase (Postgres + JS client). No new dependencies.

## Global Constraints

- No new npm dependencies.
- No visual/structural change to the public-facing site, except `app/accommodation/page.js`'s bedroom count (Task 1).
- No functional behavior changes in any admin manager — same fields, same CRUD flows, same upload/drag-reorder behavior. This is markup/class-string substitution only.
- Keep the existing dark `#0f1117` background / `#1a1d27` card / `#C07750` terracotta accent / serif-heading brand — do not introduce a new palette.
- No automated test runner exists in this project — verification is manual (drive the running app via `npm run dev`), per every prior fix in this project.
- Every task's diff must build cleanly (route returns 200, no console errors) before moving to the next task.

---

### Task 1: Bedrooms field (migration, data layer, admin form, public page)

**Files:**
- Create: `supabase/migrations/0003_accommodation_bedrooms.sql`
- Modify: `src/lib/accommodation.js` (`fromRow`/`toRow`)
- Modify: `src/components/admin/AccommodationManager.js` (form state + new field)
- Modify: `app/accommodation/page.js:296-307` (replace guessed bedroom count)

**Interfaces:**
- Produces: `unit.bedrooms` (number) available everywhere `unit` objects flow (`getUnits`, `getActiveUnits`, `getUnitById`), and a `bedrooms` field in the `AccommodationManager` form alongside `sleeps`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0003_accommodation_bedrooms.sql`:

```sql
alter table accommodation_units
  add column if not exists bedrooms integer;

update accommodation_units
  set bedrooms = ceil(sleeps / 2.0)
  where bedrooms is null;

alter table accommodation_units
  alter column bedrooms set default 1,
  alter column bedrooms set not null;
```

- [ ] **Step 2: Apply the migration to Supabase**

This project has no migration runner — every prior schema change here was applied directly via the Supabase service role key. Run once from the project root (`mountaincreek-lodge/`):

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const sql = fs.readFileSync('supabase/migrations/0003_accommodation_bedrooms.sql', 'utf8');
supabase.rpc('exec_sql', { sql }).then(({ error }) => { if (error) { console.error(error); process.exit(1); } console.log('applied'); });
"
```

If the project's Supabase instance has no `exec_sql` RPC helper (check by running the above — a `function exec_sql does not exist` error means it doesn't), instead open the Supabase SQL Editor for this project and paste/run the three statements from Step 1 by hand, then verify with a quick read:

```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
supabase.from('accommodation_units').select('name, sleeps, bedrooms').then(({ data, error }) => { if (error) throw error; console.log(data); });
"
```

Expected: every row has a non-null `bedrooms`, roughly matching `ceil(sleeps / 2)` (e.g. Main House sleeps 10 → bedrooms 5).

- [ ] **Step 3: Add `bedrooms` to the data layer**

In `src/lib/accommodation.js`, update `fromRow`:

```js
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    sleeps: row.sleeps,
    bedrooms: row.bedrooms,
    tagline: row.tagline,
    description: row.description,
    features: row.features || [],
    size: row.size,
    span: row.span,
    images: row.images || [],
    active: row.active,
  };
}
```

And `toRow`:

```js
function toRow(unit) {
  return {
    name: unit.name,
    sleeps: unit.sleeps,
    bedrooms: unit.bedrooms,
    tagline: unit.tagline,
    description: unit.description,
    features: unit.features,
    size: unit.size,
    span: unit.span,
    images: unit.images,
    active: unit.active,
  };
}
```

- [ ] **Step 4: Add the Bedrooms field to the admin form**

In `src/components/admin/AccommodationManager.js`, add state next to `sleeps` (near line 34):

```js
  const [sleeps, setSleeps] = useState(1);
  const [bedrooms, setBedrooms] = useState(1);
```

In `resetForm` (both branches, near lines 45-66), add alongside the existing `setSleeps` calls:

```js
      setSleeps(unit.sleeps || 1);
      setBedrooms(unit.bedrooms || 1);
```

and in the `else` branch:

```js
      setSleeps(1);
      setBedrooms(1);
```

In `handleSubmit`'s `prepared` object (near line 104-114), add `bedrooms: Number(bedrooms),` next to `sleeps: Number(sleeps),`.

In the form JSX, right after the existing "sleeps" field block (the one with `<label>Sleeps</label>`, around line 206-219), add a matching field:

```jsx
        {/* bedrooms */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Bedrooms
          </label>
          <input
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            min="0"
            required
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>
```

- [ ] **Step 5: Use the real bedroom count on the public page**

In `app/accommodation/page.js`, replace lines 300-306:

```jsx
            <span className="font-sans text-sm text-primary font-medium">
              {unit.sleeps <= 2
                ? "Studio"
                : unit.sleeps <= 4
                ? `${Math.ceil(unit.sleeps / 2)} Bedrooms`
                : `${Math.ceil(unit.sleeps / 2)} Bedrooms`}
            </span>
```

with:

```jsx
            <span className="font-sans text-sm text-primary font-medium">
              {unit.bedrooms === 0
                ? "Studio"
                : `${unit.bedrooms} Bedroom${unit.bedrooms === 1 ? "" : "s"}`}
            </span>
```

- [ ] **Step 6: Manual verification**

Start the dev server if not already running (`npm run dev` from `mountaincreek-lodge/`). In the admin, edit a room, confirm the new "Bedrooms" field shows the backfilled value, change it, save, reload the edit form — value persisted. On `/accommodation`, confirm that room now shows the edited bedroom count, and an unedited room still shows its backfilled (guessed) count with no console errors.

- [ ] **Step 7: Commit**

```bash
git add mountaincreek-lodge/supabase/migrations/0003_accommodation_bedrooms.sql mountaincreek-lodge/src/lib/accommodation.js mountaincreek-lodge/src/components/admin/AccommodationManager.js mountaincreek-lodge/app/accommodation/page.js
git commit -m "feat(mountaincreek-lodge): add real editable bedrooms field

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Shared admin UI primitives

**Files:**
- Create: `src/components/admin/ui/PageHeader.js`
- Create: `src/components/admin/ui/Card.js`
- Create: `src/components/admin/ui/Button.js`
- Create: `src/components/admin/ui/FieldLabel.js`
- Create: `src/components/admin/ui/TextInput.js`

**Interfaces:**
- Produces: `PageHeader({ title, action, showViewSite })`, `Card({ children, className, padding })`, `Button({ variant, children, ...props })` with `variant` one of `"primary" | "secondary" | "danger" | "dangerFilled"`, `FieldLabel({ children })`, `TextInput({ className, ...props })` plus an exported `inputClass` string constant for `<textarea>`/`<select>` elements that can't use the `<TextInput>` wrapper directly.

- [ ] **Step 1: Create `PageHeader.js`**

```jsx
export default function PageHeader({ title, action, showViewSite = true }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h1 className="text-white text-2xl font-serif">{title}</h1>
      <div className="flex items-center gap-4">
        {showViewSite && (
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            View Site →
          </a>
        )}
        {action}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `Card.js`**

```jsx
export default function Card({ children, className = "", padding = "p-8" }) {
  return (
    <div
      className={`bg-[#1a1d27] rounded-xl border border-white/5 ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `Button.js`**

```jsx
const VARIANTS = {
  primary:
    "bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors disabled:opacity-60",
  secondary:
    "text-white/40 hover:text-white/70 px-6 py-3 text-sm transition-colors",
  danger:
    "text-red-400/60 hover:text-red-400 px-3 transition-colors",
  dangerFilled:
    "bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Create `FieldLabel.js`**

```jsx
export default function FieldLabel({ children }) {
  return (
    <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}
```

- [ ] **Step 5: Create `TextInput.js`**

```jsx
export const inputClass =
  "w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors";

export default function TextInput({ className = "", ...props }) {
  return <input className={`${inputClass} ${className}`} {...props} />;
}
```

- [ ] **Step 6: Verify the files compile**

Run: `cd mountaincreek-lodge && npx next build --webpack 2>&1 | tail -30` is too slow for a quick check — instead just confirm no import errors by starting the dev server and hitting `/admin` (these files aren't imported anywhere yet, so this step just confirms no syntax errors):

```bash
node --check src/components/admin/ui/PageHeader.js 2>&1 || true
```

(Skip `node --check` for the `.js` files with JSX — Node can't parse JSX. Instead rely on Task 3+'s dev-server checks once these are actually imported.)

- [ ] **Step 7: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/ui/
git commit -m "feat(mountaincreek-lodge): add shared admin UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Extract Packages into `PackagesManager.js`

**Files:**
- Create: `src/components/admin/PackagesManager.js`
- Modify: `app/admin/page.js` (remove `PackageForm`, packages state/handlers, and the inline packages JSX; render `<PackagesManager />` instead)

**Interfaces:**
- Consumes: `getPackages`, `addPackage`, `updatePackage`, `deletePackage`, `generateSlug` from `@/lib/packages`; `Button`, `Card`, `FieldLabel`, `TextInput`, `inputClass` from `@/components/admin/ui/*`.
- Produces: `export default function PackagesManager()` — no props, matches the shape of `AccommodationManager`/`GalleryManager`/etc.

- [ ] **Step 1: Create `PackagesManager.js`**

This moves `emptyForm`, `CATEGORIES`, `PackageForm`, and the packages list/create/edit/delete state and JSX out of `app/admin/page.js` verbatim (same logic, same fields), using the shared primitives for buttons/labels/inputs where `admin/page.js` used the same raw classes. `PackageForm`'s image field keeps its existing `FileReader`-to-data-URL upload — that's a pre-existing inconsistency with the other managers' `/api/admin/upload` pipeline, but changing it is out of scope for this visual-polish pass.

```jsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
  generateSlug,
} from "@/lib/packages";
import Button from "@/components/admin/ui/Button";
import Card from "@/components/admin/ui/Card";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput, { inputClass } from "@/components/admin/ui/TextInput";

const CATEGORIES = ["Safari", "Adventure", "Romantic", "Family", "Dining", "Custom"];

const emptyForm = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  category: "Safari",
  price: "",
  duration: "",
  maxGuests: "",
  includes: [""],
  image: "",
  tag: "",
  active: true,
};

function PackageForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const fileRef = useRef(null);

  const update = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "title" && !initial ? { slug: generateSlug(value) } : {}),
    }));

  const updateInclude = (index, value) => {
    const newIncludes = [...form.includes];
    newIncludes[index] = value;
    setForm((prev) => ({ ...prev, includes: newIncludes }));
  };

  const addInclude = () =>
    setForm((prev) => ({ ...prev, includes: [...prev.includes, ""] }));

  const removeInclude = (index) =>
    setForm((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update("image", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: form.price ? Number(form.price) : null,
      maxGuests: form.maxGuests ? Number(form.maxGuests) : null,
      includes: form.includes.filter((i) => i.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Package Name *</FieldLabel>
          <TextInput
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Sunrise Safari Escape"
          />
        </div>
        <div>
          <FieldLabel>URL Slug</FieldLabel>
          <TextInput
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="text-white/60"
            placeholder="auto-generated-from-title"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Short Description *</FieldLabel>
        <TextInput
          required
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
          placeholder="Brief tagline for cards"
        />
      </div>
      <div>
        <FieldLabel>Full Description</FieldLabel>
        <textarea
          rows={4}
          value={form.fullDescription}
          onChange={(e) => update("fullDescription", e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Detailed description for the detail page"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <FieldLabel>Category</FieldLabel>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Price (ZAR)</FieldLabel>
          <TextInput
            type="number"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            placeholder="2500"
          />
        </div>
        <div>
          <FieldLabel>Duration</FieldLabel>
          <TextInput
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            placeholder="2 Nights / 3 Days"
          />
        </div>
        <div>
          <FieldLabel>Max Guests</FieldLabel>
          <TextInput
            type="number"
            value={form.maxGuests}
            onChange={(e) => update("maxGuests", e.target.value)}
            placeholder="4"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel>Tag / Badge</FieldLabel>
          <TextInput
            value={form.tag || ""}
            onChange={(e) => update("tag", e.target.value || null)}
            placeholder="e.g. MOST POPULAR, NEW (leave blank for none)"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="w-5 h-5 rounded accent-[#C07750]"
            />
            <span className="text-white/70 text-sm">Active (visible on website)</span>
          </label>
        </div>
      </div>

      <div>
        <FieldLabel>What&apos;s Included</FieldLabel>
        <div className="space-y-2">
          {form.includes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <TextInput
                value={item}
                onChange={(e) => updateInclude(i, e.target.value)}
                className="flex-1 py-2.5 text-sm"
                placeholder={`Item ${i + 1}`}
              />
              {form.includes.length > 1 && (
                <Button type="button" variant="danger" onClick={() => removeInclude(i)}>
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addInclude}
          className="mt-2 text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
        >
          + Add item
        </button>
      </div>

      <div>
        <FieldLabel>Image</FieldLabel>
        <div className="flex items-start gap-4">
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="w-28 h-20 object-cover rounded-lg border border-white/10"
            />
          )}
          <div className="flex-1">
            <TextInput
              value={form.image?.startsWith("data:") ? "" : form.image || ""}
              onChange={(e) => update("image", e.target.value)}
              className="py-2.5 text-sm mb-2"
              placeholder="/images/accommodation/IMG_8185.jpg"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-[#C07750] hover:text-[#C07750]/80 transition-colors"
            >
              or upload an image file
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-white/5">
        <Button type="submit">{initial ? "UPDATE PACKAGE" : "CREATE PACKAGE"}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function PackagesManager() {
  const [packages, setPackages] = useState([]);
  const [view, setView] = useState("list");
  const [editPkg, setEditPkg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const refreshPackages = () => {
    getPackages()
      .then(setPackages)
      .catch((err) => console.error("Failed to load packages:", err));
  };

  useEffect(() => {
    refreshPackages();
  }, []);

  const handleCreate = async (data) => {
    try {
      await addPackage(data);
      refreshPackages();
      setView("list");
    } catch (err) {
      console.error("Failed to create package:", err);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updatePackage(editPkg.id, data);
      refreshPackages();
      setEditPkg(null);
      setView("list");
    } catch (err) {
      console.error("Failed to update package:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePackage(id);
      refreshPackages();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete package:", err);
    }
  };

  return (
    <>
      {(view === "create" || view === "edit") && (
        <Card className="mb-10">
          <h2 className="text-white text-xl font-serif mb-6">
            {view === "create" ? "Create New Package" : `Edit: ${editPkg?.title}`}
          </h2>
          <PackageForm
            initial={
              view === "edit"
                ? {
                    ...editPkg,
                    price: editPkg?.price?.toString() || "",
                    duration: editPkg?.duration || "",
                    maxGuests: editPkg?.maxGuests?.toString() || "",
                    includes: editPkg?.includes?.length > 0 ? editPkg.includes : [""],
                    tag: editPkg?.tag || "",
                  }
                : null
            }
            onSave={view === "create" ? handleCreate : handleUpdate}
            onCancel={() => {
              setView("list");
              setEditPkg(null);
            }}
          />
        </Card>
      )}

      {view === "list" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/40 text-sm">
              {packages.length} package{packages.length !== 1 ? "s" : ""}
            </p>
            <Button onClick={() => setView("create")}>+ NEW PACKAGE</Button>
          </div>

          <div className="space-y-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} padding="p-5" className="flex flex-col md:flex-row items-start md:items-center gap-5">
                {pkg.image && (
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full md:w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium text-base truncate">{pkg.title}</h3>
                    {pkg.tag && (
                      <span className="bg-[#C07750]/20 text-[#C07750] text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0">
                        {pkg.tag}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                        pkg.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {pkg.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm truncate">{pkg.shortDescription}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                    {pkg.price && <span>R{pkg.price.toLocaleString()} pp</span>}
                    {pkg.duration && <span>{pkg.duration}</span>}
                    {pkg.category && <span>{pkg.category}</span>}
                    <span>/packages/{pkg.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/packages/${pkg.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/20 hover:text-white/60 p-2 transition-colors"
                    title="View on site"
                  >
                    ↗
                  </a>
                  <button
                    onClick={() => {
                      setEditPkg(pkg);
                      setView("edit");
                    }}
                    className="text-white/20 hover:text-[#C07750] p-2 transition-colors"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(pkg.id)}
                    className="text-white/20 hover:text-red-400 p-2 transition-colors"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="max-w-sm mx-4" padding="p-8">
            <h3 className="text-white text-lg font-serif mb-3">Delete Package?</h3>
            <p className="text-white/50 text-sm mb-6">
              This action cannot be undone. The package will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button variant="dangerFilled" onClick={() => handleDelete(deleteConfirm)}>
                DELETE
              </Button>
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
```

Note: the two icon-only row actions (view/edit) previously used inline SVGs; this extraction swaps them for the simple `↗`/`✎` glyphs already used identically elsewhere in this codebase (e.g. `RedLitchiManager`'s edit button), for visual consistency with the rest of the admin — this is the one intentional, in-scope visual tweak in this task, not a functional change.

- [ ] **Step 2: Strip Packages out of `app/admin/page.js`**

Delete the `CATEGORIES` const (line 25), `emptyForm` const (lines 27-40), the entire `PackageForm` function (lines 149-427), the packages-related state (`packages`, `view`, `editPkg`, `deleteConfirm` — lines 434, 435, 436, 437), `refreshPackages`/`handleCreate`/`handleUpdate`/`handleDelete` (lines 457-492), the `useEffect` that calls `refreshPackages()` (lines 446-450), and the entire `{activeTab === "packages" && ( ... )}` block (lines 556-751). Remove the now-unused imports (`getPackages, addPackage, updatePackage, deletePackage, generateSlug` from `@/lib/packages`).

In their place, import and render `PackagesManager`:

```js
import PackagesManager from "@/components/admin/PackagesManager";
```

```jsx
{activeTab === "packages" && <PackagesManager />}
```

(This single line replaces the whole deleted block, placed alongside the other `{activeTab === "..." && <XManager />}` lines — see Task 4 for the full shell layout this fits into.)

- [ ] **Step 3: Manual verification**

Start the dev server, log into `/admin`, confirm the Packages tab still lists, creates, edits, and deletes packages exactly as before, and the delete confirmation modal still works.

- [ ] **Step 4: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/PackagesManager.js mountaincreek-lodge/app/admin/page.js
git commit -m "refactor(mountaincreek-lodge): extract Packages tab into PackagesManager

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Admin shell — sidebar navigation + PageHeader + login/forgot/reset restyle

**Files:**
- Modify: `app/admin/page.js` (`LoginScreen`, `AdminPage` shell)
- Modify: `app/admin/forgot/page.js`
- Modify: `app/admin/reset/page.js`

**Interfaces:**
- Consumes: `PageHeader`, `Button`, `FieldLabel`, `TextInput` from `@/components/admin/ui/*`.
- Produces: `AdminPage` renders a sidebar + top `PageHeader` shell; active tab persisted via `?tab=` query param.

- [ ] **Step 1: Restyle `LoginScreen` with the shared primitives**

In `app/admin/page.js`, replace the `LoginScreen` function's form fields/buttons (the ones between the `<form onSubmit={handleSubmit}>` and its closing tag, lines 89-138) — same structure, using `FieldLabel`/`TextInput`/`Button`:

```jsx
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, remember }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-serif mb-2">Mountain Creek Lodge</h1>
          <p className="text-white/40 text-sm tracking-wider uppercase">Admin Portal</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <FieldLabel>Password</FieldLabel>
            <div className="relative mb-4">
              <TextInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                className="pr-16"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 px-4 text-white/40 hover:text-white/70 text-xs uppercase tracking-wider transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-white/50 text-xs">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#C07750]"
                />
                Stay signed in for 7 days
              </label>
              <Link href="/admin/forgot" className="text-[#C07750] hover:text-[#C07750]/80 text-xs transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "SIGNING IN…" : "SIGN IN"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-white/20 text-xs mt-8">
          &copy; {new Date().getFullYear()} Mountain Creek Lodge
        </p>
      </div>
    </div>
  );
}
```

Add the two new imports (`Card`, and the others already listed) at the top of `app/admin/page.js`:

```js
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";
```

- [ ] **Step 2: Replace the tab bar with a sidebar + PageHeader shell**

Replace the `AdminPage` function's return block for the authenticated view (previously lines 506-555, now shifted after Task 3's deletions — locate by the `{/* Top Bar */}` and `{/* Tab Bar */}` comments) with:

```jsx
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0f1117] border-r border-white/5 flex flex-col p-6">
        <div className="mb-10">
          <h1 className="text-white text-lg font-serif leading-tight">Mountain Creek Lodge</h1>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-1">Admin</p>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                activeTab === tab.id
                  ? "bg-[#C07750] text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="text-white/30 hover:text-red-400 text-sm transition-colors text-left px-4 py-2.5"
        >
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <PageHeader title={TABS.find((t) => t.id === activeTab)?.label} />

        {activeTab === "accommodation" && <AccommodationManager />}
        {activeTab === "gallery" && <GalleryManager />}
        {activeTab === "red-litchi" && <RedLitchiManager />}
        {activeTab === "account" && <AccountManager />}
        {activeTab === "packages" && <PackagesManager />}
      </main>
    </div>
  );
```

- [ ] **Step 3: Persist the active tab via URL query param**

Replace `const [activeTab, setActiveTab] = useState("packages");` with a version that reads/writes `?tab=`:

```js
import { useSearchParams, useRouter, usePathname } from "next/navigation";
```

```js
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "packages";
  const setActiveTab = (tab) => {
    router.push(`${pathname}?tab=${tab}`, { scroll: false });
  };
```

Remove the old `useState` line for `activeTab`. Since `useSearchParams` requires a Suspense boundary in the App Router, wrap the exported default in one — rename the existing `AdminPage` function to `AdminPageInner` and add:

```jsx
import { Suspense } from "react";
```

```jsx
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-white/40 text-sm">Loading...</p></div>}>
      <AdminPageInner />
    </Suspense>
  );
}
```

(rename `export default function AdminPage()` to `function AdminPageInner()` for the existing large function.)

- [ ] **Step 4: Restyle Forgot Password and Reset Password screens**

In `app/admin/forgot/page.js`, replace the card body (lines 38-67) using the shared primitives — same fields/behavior:

```jsx
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";
```

```jsx
        <Card>
          {sent ? (
            <p className="text-white/70 text-sm text-center">
              If that email matches our admin account, a reset link is on its way. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldLabel>Admin Email</FieldLabel>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="mb-4"
                placeholder="you@example.com"
              />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "SENDING…" : "SEND RESET LINK"}
              </Button>
            </form>
          )}
        </Card>
```

In `app/admin/reset/page.js`, apply the same substitution inside `ResetPasswordForm` (lines 71-116) and the outer `Card` wrapper (lines 132-136):

```jsx
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";
```

```jsx
  return (
    <form onSubmit={handleSubmit}>
      <FieldLabel>New Password</FieldLabel>
      <div className="relative mb-4">
        <TextInput
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="pr-16"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-0 px-4 text-white/40 hover:text-white/70 text-xs uppercase tracking-wider transition-colors"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <FieldLabel>Confirm New Password</FieldLabel>
      <TextInput
        type={showPassword ? "text" : "password"}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
        className="mb-4"
      />

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "UPDATING…" : "UPDATE PASSWORD"}
      </Button>
    </form>
  );
}
```

and wrap the outer card:

```jsx
        <Card>
          <Suspense fallback={<p className="text-white/40 text-sm text-center">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
```

- [ ] **Step 5: Manual verification**

Drive the running app: sign out and confirm the login screen still authenticates; use "Forgot password?" and confirm the request still submits; the sidebar shows all 5 sections, clicking each switches content and highlights the active item, and reloading the page on `/admin?tab=gallery` (for example) keeps Gallery active; Sign Out still works.

- [ ] **Step 6: Commit**

```bash
git add mountaincreek-lodge/app/admin/page.js mountaincreek-lodge/app/admin/forgot/page.js mountaincreek-lodge/app/admin/reset/page.js
git commit -m "feat(mountaincreek-lodge): admin sidebar shell + shared primitives on auth screens

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Restyle AccommodationManager with shared primitives

**Files:**
- Modify: `src/components/admin/AccommodationManager.js`

**Interfaces:**
- Consumes: `Card`, `Button`, `FieldLabel`, `TextInput` from `@/components/admin/ui/*`.

- [ ] **Step 1: Add imports**

```js
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";
```

- [ ] **Step 2: Remove the section's own list-header row (the shell's `PageHeader` now covers it)**

Replace `renderList`'s opening header block:

```jsx
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-serif">
          Accommodation Units ({units.length})
        </h2>
        <button
          onClick={handleNew}
          className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
        >
          + NEW UNIT
        </button>
      </div>
```

with:

```jsx
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">
          {units.length} unit{units.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={handleNew}>+ NEW UNIT</Button>
      </div>
```

- [ ] **Step 3: Swap the form and list-row card wrappers for `Card`**

Replace `renderForm`'s outer wrapper open/close:

```jsx
    <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8">
```
→
```jsx
    <Card>
```
(and its matching closing `</div>` → `</Card>`).

Replace each list-row wrapper:

```jsx
            <div
              key={unit.id}
              className="bg-[#1a1d27] rounded-xl border border-white/5 p-5 flex flex-col md:flex-row items-start md:items-center gap-5"
            >
```
→
```jsx
            <Card
              key={unit.id}
              padding="p-5"
              className="flex flex-col md:flex-row items-start md:items-center gap-5"
            >
```
(and its matching closing `</div>` → `</Card>`).

Replace the delete-confirmation modal's card:

```jsx
        <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-8 max-w-sm mx-4">
```
→
```jsx
        <Card padding="p-8" className="max-w-sm mx-4">
```
(closing `</div>` → `</Card>`).

- [ ] **Step 4: Swap every `<label className="block text-white/50 text-xs uppercase tracking-widest mb-2">...</label>` for `<FieldLabel>...</FieldLabel>`**

There are 9 of these in the file (Name, Tagline, Sleeps, the new Bedrooms field from Task 1, Description, Size, Card Width, Active, Features, Images). For each, replace:

```jsx
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Name
          </label>
```

with:

```jsx
          <FieldLabel>Name</FieldLabel>
```

(same substitution for each label's text content — Tagline, Sleeps, Bedrooms, Description, Size, Card Width, Active, Features, Images — the "Active (visible on public site)" one keeps its full text inside `<FieldLabel>`).

- [ ] **Step 5: Swap plain text `<input>` elements for `<TextInput>`**

Name, Tagline, and feature-list inputs currently look like:

```jsx
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
```

Replace with:

```jsx
          <TextInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
```

Apply the same pattern to the Tagline input, the Sleeps/Bedrooms number inputs (keep `min`/`required` props), and the per-feature `<input>` inside `features.map(...)` (keep its `placeholder`). The `<textarea>` (Description) and two `<select>` elements (Size, Card Width) keep their own JSX tags but swap their `className` from the long literal string to `` `${inputClass} resize-y` `` (textarea) or plain `inputClass` (selects) — import `inputClass` alongside `TextInput`: `import TextInput, { inputClass } from "@/components/admin/ui/TextInput";`.

- [ ] **Step 6: Swap remove/delete buttons for `Button variant="danger"`/`"dangerFilled"`**

The feature-row and image-tile remove buttons:

```jsx
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
              >
                ✕
              </button>
```

→

```jsx
              <Button type="button" variant="danger" onClick={() => removeFeature(idx)}>
                ✕
              </Button>
```

The delete-confirmation modal's DELETE button:

```jsx
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              DELETE
            </button>
```

→

```jsx
            <Button variant="dangerFilled" onClick={confirmDelete}>DELETE</Button>
```

Leave the image-tile's overlay ✕ button (absolute-positioned, circular, on top of a thumbnail) as its own inline styling — it's a distinct visual treatment (floating icon button on an image) that doesn't match the `Button` primitive's shapes, and forcing it through `Button` would need a new variant for a single call site. Same for the drag-handle (⠿) and position-badge spans — decorative, not buttons.

- [ ] **Step 7: Swap remaining action buttons for `Button`**

Form submit/cancel:

```jsx
          <button
            type="submit"
            className="bg-[#C07750] text-white px-8 py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
          >
            {editingUnit ? "UPDATE" : "CREATE"}
          </button>
          <button
            type="button"
            onClick={handleCancelForm}
            className="text-white/40 hover:text-white/70 px-6 py-3 text-sm transition-colors"
          >
            Cancel
          </button>
```

→

```jsx
          <Button type="submit">{editingUnit ? "UPDATE" : "CREATE"}</Button>
          <Button type="button" variant="secondary" onClick={handleCancelForm}>Cancel</Button>
```

Delete-modal Cancel:

```jsx
            <button
              onClick={cancelDelete}
              className="text-white/40 hover:text-white/70 px-4 py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
```

→

```jsx
            <Button variant="secondary" onClick={cancelDelete}>Cancel</Button>
```

Leave the list row's "View"/"Edit"/"Delete" text links and the "+ Add feature"/"+ Add image path" text-only buttons as-is — they're plain text links with hover-underline-style treatment distinct from `Button`'s padded/bordered look, matching the "or upload an image file" pattern in Packages that was also left alone.

- [ ] **Step 8: Manual verification**

Drive the running app: create a unit, edit one (confirm the Bedrooms field from Task 1 is present and styled consistently with Sleeps), delete one (confirm modal still works), add/remove a feature, add/remove/reorder images via drag — all functionally identical to before, now visually using the shared primitives. No console errors.

- [ ] **Step 9: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/AccommodationManager.js
git commit -m "refactor(mountaincreek-lodge): restyle AccommodationManager with shared UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Restyle GalleryManager with shared primitives

**Files:**
- Modify: `src/components/admin/GalleryManager.js`

**Interfaces:**
- Consumes: `Card`, `Button`, `FieldLabel`, `TextInput` from `@/components/admin/ui/*`.

Gallery has two independent sub-sections (Categories, Images) each with their own add-forms — there is no single page-level "+New" action for the shell's `PageHeader` to own here, so `PageHeader` is not used inside this file; the shell's top bar just shows "Gallery" with no action button (already the default via Task 4's `<PageHeader title={...} />` with no `action` prop). This task only swaps card wrappers, buttons, labels, and inputs for the shared primitives — same two sub-sections, same behavior.

- [ ] **Step 1: Add imports**

```js
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput, { inputClass } from "@/components/admin/ui/TextInput";
```

- [ ] **Step 2: Swap the two section wrappers for `Card`**

```jsx
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8">
```
(Categories section) → `<Card>`, closing `</div>` → `</Card>`.

```jsx
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8 mt-10">
```
(Images section) → `<Card className="mt-10">`, closing `</div>` → `</Card>`.

- [ ] **Step 3: Swap inputs/labels/buttons**

New-category input + button:

```jsx
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
            className="flex-1 bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
          <button
            onClick={handleAddCategory}
            className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors whitespace-nowrap"
          >
            + ADD CATEGORY
          </button>
```

→

```jsx
          <TextInput
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
            className="flex-1"
          />
          <Button onClick={handleAddCategory} className="whitespace-nowrap">+ ADD CATEGORY</Button>
```

Category row's delete button:

```jsx
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
                    title="Delete category"
                  >
                    ✕
                  </button>
```

→

```jsx
                  <Button variant="danger" onClick={() => handleDeleteCategory(cat.id)} title="Delete category">
                    ✕
                  </Button>
```

Image-path label + input, category-select label, and "+ ADD IMAGE" button:

```jsx
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Image Path
            </label>
            <input
              type="text"
              placeholder="/images/accommodation/IMG_8185.jpg"
              value={newImageSrc}
              onChange={(e) => setNewImageSrc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddImage();
              }}
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            />
```

→

```jsx
            <FieldLabel>Image Path</FieldLabel>
            <TextInput
              type="text"
              placeholder="/images/accommodation/IMG_8185.jpg"
              value={newImageSrc}
              onChange={(e) => setNewImageSrc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddImage();
              }}
            />
```

```jsx
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Category
            </label>
            <select
              value={newImageCategoryId}
              onChange={(e) => setNewImageCategoryId(e.target.value)}
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            >
```

→

```jsx
            <FieldLabel>Category</FieldLabel>
            <select
              value={newImageCategoryId}
              onChange={(e) => setNewImageCategoryId(e.target.value)}
              className={inputClass}
            >
```

```jsx
          <button
            onClick={handleAddImage}
            className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors whitespace-nowrap self-end"
          >
            + ADD IMAGE
          </button>
```

→

```jsx
          <Button onClick={handleAddImage} className="whitespace-nowrap self-end">+ ADD IMAGE</Button>
```

Bulk-delete button:

```jsx
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 text-white px-4 py-1.5 rounded-lg font-semibold tracking-wider text-xs uppercase hover:bg-red-600 transition-colors"
              >
                Delete Selected ({selectedIds.size})
              </button>
```

→

```jsx
              <Button variant="dangerFilled" className="px-4 py-1.5 text-xs" onClick={handleBulkDelete}>
                Delete Selected ({selectedIds.size})
              </Button>
```

Per-image grid tile's delete ✕ and its category `<select>` keep their existing overlay styling (same reasoning as Task 5 Step 6 — floating icon buttons over a thumbnail aren't a `Button` shape); leave those two untouched. Leave the filter pills and "Select All"/"Clear" text buttons untouched too — they're a distinct pill/toggle pattern, not the primary/secondary/danger button vocabulary.

- [ ] **Step 4: Manual verification**

Drive the running app: add/rename/delete a category, add an image by path and by upload, filter by category, select/clear/bulk-delete images — all identical behavior, restyled.

- [ ] **Step 5: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/GalleryManager.js
git commit -m "refactor(mountaincreek-lodge): restyle GalleryManager with shared UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Restyle RedLitchiManager with shared primitives

**Files:**
- Modify: `src/components/admin/RedLitchiManager.js`

**Interfaces:**
- Consumes: `Card`, `Button`, `FieldLabel`, `TextInput` from `@/components/admin/ui/*`.

Same reasoning as Task 6: Menu and Gallery Images are two independent sub-sections with no single page-level action, so no `PageHeader` usage here.

- [ ] **Step 1: Add imports**

```js
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";
```

- [ ] **Step 2: Swap the two section wrappers for `Card`**

```jsx
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8">
```
(Menu section) → `<Card>`.

```jsx
      <div className="mt-10 bg-[#1a1d27] rounded-xl border border-white/5 p-8">
```
(Gallery section) → `<Card className="mt-10">`.

- [ ] **Step 3: Swap labels, inputs, and buttons**

The three `<label className="block text-white/50 text-xs uppercase tracking-widest mb-2">` labels ("CURRENT MENU PDF", "UPLOAD NEW MENU PDF", "OR PASTE MENU PATH") → `<FieldLabel>` with the same text each.

Menu-path input + SAVE button:

```jsx
            <input
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
              placeholder="/Red Litchi Official Menu.pdf"
              value={menuInputUrl}
              onChange={(e) => setMenuInputUrl(e.target.value)}
            />
            <button
              onClick={handleSaveUrl}
              className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors flex-shrink-0"
            >
              SAVE
            </button>
```

→

```jsx
            <TextInput
              placeholder="/Red Litchi Official Menu.pdf"
              value={menuInputUrl}
              onChange={(e) => setMenuInputUrl(e.target.value)}
            />
            <Button onClick={handleSaveUrl} className="flex-shrink-0">SAVE</Button>
```

Add-image input + button:

```jsx
          <input
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="/images/Red Litchi/Gallery/IMG-20241029-WA0008.jpg"
            value={gallerySrcInput}
            onChange={(e) => setGallerySrcInput(e.target.value)}
          />
          <button
            onClick={handleAddImage}
            className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors flex-shrink-0"
          >
            + ADD IMAGE
          </button>
```

→

```jsx
          <TextInput
            placeholder="/images/Red Litchi/Gallery/IMG-20241029-WA0008.jpg"
            value={gallerySrcInput}
            onChange={(e) => setGallerySrcInput(e.target.value)}
          />
          <Button onClick={handleAddImage} className="flex-shrink-0">+ ADD IMAGE</Button>
```

Per-tile edit-mode Save/Cancel:

```jsx
                      <button
                        onClick={() => saveEditing(img.id)}
                        className="bg-[#C07750] text-white text-xs px-4 py-2 rounded-lg font-semibold tracking-wider hover:bg-[#a8654a] transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-white/40 hover:text-white/70 text-xs px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
```

→

```jsx
                      <Button className="text-xs px-4 py-2" onClick={() => saveEditing(img.id)}>Save</Button>
                      <Button variant="secondary" className="text-xs px-4 py-2" onClick={cancelEditing}>Cancel</Button>
```

Leave the per-tile edit-mode text `<input>` (inside the overlay, `w-full ... text-sm`) and the overlay edit/delete icon buttons as-is — same floating-over-thumbnail reasoning as Tasks 5-6.

- [ ] **Step 4: Manual verification**

Drive the running app: upload a menu PDF and confirm it updates; paste a menu path and save; add a gallery image by path and by upload; edit an existing image's path inline and save/cancel; delete an image — all identical behavior.

- [ ] **Step 5: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/RedLitchiManager.js
git commit -m "refactor(mountaincreek-lodge): restyle RedLitchiManager with shared UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Restyle AccountManager with shared primitives

**Files:**
- Modify: `src/components/admin/AccountManager.js`

**Interfaces:**
- Consumes: `Card`, `Button`, `FieldLabel`, `TextInput` from `@/components/admin/ui/*`.

This is the smallest file and has no page-level action either (a single settings form) — no `PageHeader` usage here, same as Tasks 6-7.

- [ ] **Step 1: Add imports and swap the wrapper**

```js
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";
```

```jsx
    <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8 max-w-lg">
```
→
```jsx
    <Card className="max-w-lg">
```
(closing `</div>` → `</Card>`).

- [ ] **Step 2: Swap the three labeled password fields**

Each of the three fields follows this shape (shown for "Current Password"; identical substitution for "New Password" and "Confirm New Password", keeping each one's own `value`/`onChange`/`minLength`/`autoComplete` props):

```jsx
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Current Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>
```

→

```jsx
        <div>
          <FieldLabel>Current Password</FieldLabel>
          <TextInput
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
```

- [ ] **Step 3: Swap the submit button**

```jsx
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#C07750] text-white px-8 py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors disabled:opacity-60"
        >
          {submitting ? "UPDATING…" : "UPDATE PASSWORD"}
        </button>
```

→

```jsx
        <Button type="submit" disabled={submitting}>
          {submitting ? "UPDATING…" : "UPDATE PASSWORD"}
        </Button>
```

- [ ] **Step 4: Manual verification**

Drive the running app: change the admin password with correct current password (success message shows), then with a wrong one (error message shows), confirm mismatched new/confirm passwords are rejected client-side, and "Show passwords" still toggles visibility on all three fields.

- [ ] **Step 5: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/AccountManager.js
git commit -m "refactor(mountaincreek-lodge): restyle AccountManager with shared UI primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Full deploy verification

**Files:** none (verification-only task).

- [ ] **Step 1: Full manual pass on the dev server**

With all 8 prior tasks complete, do one end-to-end pass covering everything in the spec's Testing section: all 5 sections' list/create/edit/delete flows, login/forgot/reset, sidebar navigation + URL persistence, and the Bedrooms field on both admin and public accommodation page. No console errors anywhere.

- [ ] **Step 2: Deploy**

```bash
cd mountaincreek-lodge && npx vercel --prod
```

- [ ] **Step 3: Verify production**

Hit the deployed `/admin` and confirm it loads (200) and the login screen renders with the new styling. This project's admin routes require an authenticated session cookie to go further than the login screen non-interactively (as established in the earlier upload-fix work), so the deeper click-through (sidebar, each section, bedrooms field) is a manual pass by the site owner on the live URL after this deploy.
