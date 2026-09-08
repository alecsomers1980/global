# Mountain Creek Lodge — Room Image Drag-to-Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In the Mountain Creek Lodge admin's room add/edit form, let an admin drag room images into a new order (the array order also determines which image is used as the room's cover thumbnail).

**Architecture:** Single-component change. Replace the images sub-section of `AccommodationManager.js`'s room form with a thumbnail grid (matching `GalleryManager.js`'s existing tile style) that supports native HTML5 drag-and-drop reordering of the in-memory `images` array. The manual "add image by path" entry moves into a collapsed fallback below the grid. No backend/schema change — `images` already saves as an ordered array.

**Tech Stack:** Next.js (App Router), React client component, Tailwind CSS, native HTML5 drag-and-drop (no new dependency).

## Global Constraints

- No new npm dependencies.
- No changes to `src/lib/accommodation.js`, `GalleryManager.js`, or the public site.
- Desktop-only drag support (no touch/keyboard reordering).
- This project has no automated test runner configured (`package.json` has no `test` script and no jest/vitest/playwright) — verification is manual, driving the running admin UI, per the spec's Testing section.

---

### Task 1: Draggable thumbnail grid for room images

**Files:**
- Modify: `mountaincreek-lodge/src/components/admin/AccommodationManager.js:39-43` (state), `:146-154` (image helpers), `:311-368` (images JSX block)

**Interfaces:**
- Consumes: existing `images` / `setImages` state, existing `addImage(void)`, `updateImage(index, value)`, `removeImage(index)` helpers, existing `uploading`, `uploadError`, `fileInputRef`, `handleFileUpload(e)` — all unchanged in signature.
- Produces: no new exports; this is a leaf UI change within the same component.

- [ ] **Step 1: Add drag state and reorder handlers**

In `mountaincreek-lodge/src/components/admin/AccommodationManager.js`, find the existing image helpers (around line 146):

```js
  const addImage = () => setImages([...images, ""]);
  const updateImage = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };
```

Leave those three exactly as they are, and add drag handlers directly below them:

```js
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Drag-to-reorder for the images grid
  const [draggedIndex, setDraggedIndex] = useState(null);
  const handleImageDragStart = (index) => setDraggedIndex(index);
  const handleImageDragOver = (e) => e.preventDefault();
  const handleImageDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
    setDraggedIndex(null);
  };
  const handleImageDragEnd = () => setDraggedIndex(null);
```

(`useState` is already imported at the top of the file — no import changes needed.)

- [ ] **Step 2: Replace the images JSX block with the thumbnail grid**

Find the current images block (starts at the `{/* images dynamic list */}` comment, around line 311, ends at the closing `</div>` before `{/* form actions */}` around line 368):

```jsx
        {/* images dynamic list */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Images (file paths)
          </label>
          {images.map((img, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => updateImage(idx, e.target.value)}
                  className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
                  placeholder="/images/accommodation/IMG_8185.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
                >
                  ✕
                </button>
              </div>
              {img.trim() !== "" && (
                <img
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover rounded border border-white/10 mt-2"
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={addImage}
              className="text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
            >
              + Add image path
            </button>
            <span className="text-white/20 text-xs">or</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-white/60 text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#C07750] file:text-white file:font-semibold file:text-xs file:cursor-pointer hover:file:bg-[#a8654a] disabled:opacity-60"
            />
            {uploading && (
              <span className="text-white/40 text-xs">Uploading...</span>
            )}
          </div>
          {uploadError && (
            <p className="text-red-400 text-xs mt-2">{uploadError}</p>
          )}
        </div>
```

Replace it with:

```jsx
        {/* images */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Images
          </label>

          {images.some((img) => img.trim() !== "") && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, idx) =>
                img.trim() === "" ? null : (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleImageDragStart(idx)}
                    onDragOver={handleImageDragOver}
                    onDrop={() => handleImageDrop(idx)}
                    onDragEnd={handleImageDragEnd}
                    className={`relative aspect-square bg-[#0f1117] rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing ${
                      draggedIndex === idx ? "opacity-40" : "border-white/10"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <span className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black/60 rounded-full text-white/70 text-sm">
                      ⠿
                    </span>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-white/60 text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#C07750] file:text-white file:font-semibold file:text-xs file:cursor-pointer hover:file:bg-[#a8654a] disabled:opacity-60"
            />
            {uploading && (
              <span className="text-white/40 text-xs">Uploading...</span>
            )}
          </div>
          {uploadError && (
            <p className="text-red-400 text-xs mt-2">{uploadError}</p>
          )}

          <details className="mt-3">
            <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60 transition-colors">
              Add image by path instead
            </summary>
            <div className="mt-2 space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors text-sm"
                    placeholder="/images/accommodation/IMG_8185.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
              >
                + Add image path
              </button>
            </div>
          </details>
        </div>
```

- [ ] **Step 3: Type-check**

Run: `cd mountaincreek-lodge && npx next lint --file src/components/admin/AccommodationManager.js`
Expected: no errors (warnings about the codebase's existing patterns are fine; there must be no "is not defined" / unused-variable error introduced by this change).

Do **not** run `npm run build` if `npm run dev` is already running in this project (corrupts the `.next` manifest) — `next lint` on the single file is sufficient here.

- [ ] **Step 4: Manual verification — drive the running admin**

Start the dev server if it isn't already running: `cd mountaincreek-lodge && npm run dev`

Then in the browser, on the admin's Accommodation section:
1. Edit a room that has 3+ images. Confirm the images now render as a grid of tiles (not text-input rows), each with a ⠿ drag handle, a numbered badge, and a ✕ remove button.
2. Drag the last tile onto the first tile. Confirm it moves to position 1 and the badges renumber (1, 2, 3, ...).
3. Drag a tile into the middle of the grid. Confirm no image is duplicated or dropped, and the rest keep their relative order.
4. Click ✕ on a middle tile. Confirm it's removed and the remaining tiles renumber with no gaps.
5. Upload a new image via the file input, and separately expand "Add image by path instead" and add a path. Confirm both append a new tile at the end of the grid.
6. Save the room (UPDATE). Re-open it for editing. Confirm the image order you left it in persisted.

Expected: all six checks pass with no console errors.

- [ ] **Step 5: Commit**

```bash
git add mountaincreek-lodge/src/components/admin/AccommodationManager.js
git commit -m "feat(mountaincreek-lodge): drag-to-reorder room images in admin

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
