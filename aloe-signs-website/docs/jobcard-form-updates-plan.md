# Jobcard Form Updates — Implementation Spec

**Author:** Claude (architect). **Implementer:** DeepSeek v4.
**Date:** 2026-07-07. File mostly touched: `app/portal/admin/jobcards/[id]/page.tsx` (+ `lib/jobcard-charges.ts`, `app/api/setup-jobcards/route.ts`, `app/api/portal/admin/jobcards/[id]/route.ts`).

Five changes requested. Each below has the exact data shape + behaviour.

---

## 1. HP Latex — multiple products, each with its own meters & cost

**Today:** one `digital_details_json.running_meters` + shared `materials_json` checkboxes; charge = meters × Σ(selected HP-latex material prices). `materials_json` is ALSO used by the Flatbed section — leave Flatbed untouched.

**New:** per-product rows in `digital_details_json.rows`:
```
digital_details_json = { rows: [ { material: string, meters: string, type_other?: string, custom_price?: string } ], print_date?: string }
```
- Each row: a **material** dropdown (from `getHpLatexMaterials(settings)`), a **meters** number, and a shown **cost** = `meters × price(material)`. If material === 'Other', show a name input (`type_other`) + `custom_price` (R/m), cost = meters × custom_price. (Mirror the Vinyl Cut row pattern.)
- **+ Add product** and per-row **remove** (trash) buttons.
- Keep one "Date Printed" field for the whole department (`digital_details_json.print_date`).
- Remove the HP-latex `materials_json` checkbox block from the HP Latex panel only (Flatbed's identical block at the Flatbed panel stays).

**`lib/jobcard-charges.ts`:**
- Add `getHpLatexRows(jobcard)` → returns `digital_details_json.rows` if a non-empty array; else, **back-compat**, synthesise one row from the old shape: `[{ material: <first selected hp-latex name in materials_json or ''>, meters: digital_details_json.running_meters }]` (so existing jobcards still price).
- Add `getHpLatexRowRate(row, settings)`: price of `row.material` from `getHpLatexMaterials`; if 'Other' → `parseFloat(row.custom_price)||0`.
- Rewrite `computeHpLatexCharge` = Σ over rows of `meters × getHpLatexRowRate(row)`.
- `syncAutoLines` HP-latex block: emit **one `_auto:'hp_latex'` line per row** (item `HP Latex — <material>`, qty = meters, price = row rate, total = meters×rate). Keep the existing `_auto !== 'hp_latex'` filter.
- `computeHpLatexRate` / `getSelectedHpLatexNames` may stay (unused) or be removed if no other importer — check imports in the page before deleting; safest to leave them.

## 2. Vinyl Cut — allow more than one product row

Structure already supports it (`vinyl_cut_details_json` array, charges already sum per row). Just wire the UI:
- Add a **+ Add product** button under the vinyl table calling the existing `handleAddVinylRow`.
- Add a per-row **remove** (trash) button (new column in the table) calling existing `handleRemoveVinylRow(idx)`.
- Show a small per-row cost `R (meters × getVinylCutRowRate(row, settings))` in each row.
(`handleAddVinylRow`/`handleRemoveVinylRow` already exist in the page; just render controls for them.)

## 3. Installation — three clearly-labelled lines

Replace the current Installation panel body (`{jobcard.track_installation && (...)}`) with three labelled blocks. Keep Safety-File Yes/No and the Additional-equipment textarea below the three lines (don't drop them).

**Line 1 — "Installation address & vehicles":** existing `installation_address` textarea + the `install_bakkie` / `install_truck` / `install_trailer` checkboxes.

**Line 2 — "Everyone working on site":** number inputs `install_riggers`, `install_applicators`, `install_builders`, `install_minions`. (Move `install_electrical` OUT of here — it becomes a tool in line 3.)

**Line 3 — "Tools required":** a row of checkboxes backed by a new JSON blob `install_tools_json` (object of booleans). Keys + labels:
`basic`=Basic, `applicate`=Applicate, `electrical`=Electrical, `special`=Special, `set_build`=Set Build, `generator`=Generator, `compressor`=Compressor, `ladders`=Ladders, `scaffold`=Scaffold, `cherry_picker`=Cherry Picker.
Add a handler `handleToolToggle(key)` that flips `install_tools_json[key]`.

## 4. Header — Quote number & Purchase order number

In the header **Job Info (Block 3)**, right after the existing `<InputLine label="Invoice:" name="invoice" .../>`, add two lines:
```
<InputLine label="Quote No:" name="quote_number" jobcard={jobcard} handleChange={handleChange} />
<InputLine label="PO No:" name="purchase_order_number" jobcard={jobcard} handleChange={handleChange} />
```

## 5. Outsource — multiple companies with sent/return dates

Add a detail panel `{jobcard.prod_outsource && (...)}` immediately after the Outsource `<DeptRow .../>` line. Backed by array `outsource_details_json`:
```
outsource_details_json = [ { company: string, date_sent: string(YYYY-MM-DD), return_date: string } ]
```
- Table/rows: Company (text), Date Sent (date), Return Date (date), remove button.
- **+ Add company** button.
- Handlers `handleAddOutsourceRow()`, `handleOutsourceRowChange(idx, field, value)`, `handleRemoveOutsourceRow(idx)` (model on the vinyl handlers).

---

## Schema — `app/api/setup-jobcards/route.ts` (add to COLUMNS)
```
{ name: 'quote_number', type: 'VARCHAR(255)' },
{ name: 'purchase_order_number', type: 'VARCHAR(255)' },
{ name: 'outsource_details_json', type: "JSONB DEFAULT '[]'::jsonb" },
{ name: 'install_tools_json', type: "JSONB DEFAULT '{}'::jsonb" },
```
(`digital_details_json` already exists — shape change only.)

## PUT route — `app/api/portal/admin/jobcards/[id]/route.ts`
Add to the UPDATE set list:
```
quote_number = ${body.quote_number ?? null},
purchase_order_number = ${body.purchase_order_number ?? null},
outsource_details_json = ${body.outsource_details_json ? JSON.stringify(body.outsource_details_json) : null},
install_tools_json = ${body.install_tools_json ? JSON.stringify(body.install_tools_json) : null},
```

## Verify
`tsc --noEmit`; `npm run build`; hit `GET /api/setup-jobcards` to add columns; open a jobcard → add 2 HP-latex products + 2 vinyl rows (costs sum into items), 3-line install with tools, header Quote/PO, outsource 2 companies → Save → reload persists.
