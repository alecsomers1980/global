# Mountain Creek Lodge — Drag-to-Reorder Room Images

## Problem

In the Accommodation admin (add/edit room form), images are managed as a list of
URL text-input rows. There is no way to reorder them; the first image in the
array is used as the unit's cover thumbnail elsewhere in the site/admin, so
order matters but currently can only be changed by re-typing/re-adding paths
in the desired sequence.

## Scope

Front-end only, confined to the images sub-section of the room form in
[`src/components/admin/AccommodationManager.js`](../../../mountaincreek-lodge/src/components/admin/AccommodationManager.js).

- No backend or schema change: `images` is already saved as an ordered array
  by `addUnit`/`updateUnit` ([`src/lib/accommodation.js`](../../../mountaincreek-lodge/src/lib/accommodation.js)); reordering the
  in-memory array before submit is sufficient.
- No changes to the public-facing site, `GalleryManager.js`, or any other
  admin manager.
- Desktop-only admin tool — no touch/mobile drag support required.
- No new dependencies.

## Design

### Layout

Replace the current per-image list row (URL input + remove button + thumbnail
preview) with a responsive thumbnail grid, matching the tile style already
used in `GalleryManager.js`'s image grid (`grid grid-cols-2 sm:grid-cols-3
md:grid-cols-4 gap-4`, `aspect-square` tiles, dark card background, rounded
border).

Each tile shows:
- The image (`object-cover`, fills tile).
- A drag handle icon (⠿) top-left, `cursor-grab` / `cursor-grabbing`.
- A remove button (✕) top-right, same style/behavior as today's remove.
- A small position badge (bottom-left, e.g. "1") so the cover image (position
  1) is visually obvious.

The multi-file upload input stays above the grid, unchanged in behavior
(`uploadFiles`, appends to `images`). The existing "+ Add image path" manual
URL entry moves below the grid as a smaller, secondary fallback (still needed
for pasting an existing path directly) — same `addImage`/`updateImage`
behavior as today, just visually de-emphasized.

### Drag-and-drop mechanics

Native HTML5 drag-and-drop, no library:

- Each tile has `draggable="true"`.
- `onDragStart(index)` stores the dragged index in component state
  (`draggedIndex`).
- `onDragOver` on a tile calls `preventDefault()` (required to allow drop) and
  optionally applies a visual "drop target" highlight.
- `onDrop(targetIndex)` removes the item at `draggedIndex` from `images` and
  re-inserts it at `targetIndex`, then calls `setImages` with the new array
  and clears `draggedIndex`.
- `onDragEnd` clears `draggedIndex` (covers drag-cancel, e.g. dropping outside
  any tile).

This is purely client-side state until the form is submitted, same as the
rest of the form today (no autosave per drag).

### Out of scope / explicitly not doing

- Touch or keyboard-based reordering.
- Animated transitions during drag (native DnD doesn't give this for free;
  not worth adding a library for it here).
- Changing how `images[0]` is used as the cover elsewhere in the codebase —
  that behavior already exists and this feature just makes it easy to control
  which image ends up at index 0.

## Testing

Manual verification in the running admin (`npm run dev`):
1. Edit a room with 3+ images, drag the last tile to the first position, save,
   reload the edit form — order persisted.
2. Drag a tile to the middle of the grid — order updates correctly, no
   duplicate/dropped images.
3. Remove a tile mid-grid — remaining images keep their relative order and
   the position badges renumber.
4. Add images via file upload and via the manual path fallback — both still
   append to the end of the grid in the order added.
