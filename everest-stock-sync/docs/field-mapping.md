# cars.co.za "Add Vehicle" — field mapping vs Everest data

Source: live map of `https://www.cars.co.za/dap/stock/add/` (read-only, never
submitted) on 2026-06-29, vs the Everest `cars` table + `VehicleForm.jsx`.

Form sections: Vehicle License Disc · Vehicle Photos · Vehicle Details · Value ·
Appearance · Miscellaneous · Files · Status.

## Required fields on cars.co.za

| cars.co.za field | Type | Everest source | Status |
|---|---|---|---|
| **Year** | select (1998–2026) | `cars.year` / `registration_year` | ✅ have |
| **MM Code** | autocomplete (needs Year first) | — | ❌ **GAP** (see below) |
| **Make** | select (fills from MM Code) | `cars.make` | ✅ have (drives MM lookup) |
| **Model** | select (fills from MM Code) | `cars.model` | ✅ have |
| **Mileage** | text | `cars.mileage` | ✅ have |
| **Price** | text | `cars.price` | ✅ have |
| **Used / New** | select (Used/New) | `cars.condition` ('new'/'used') | ✅ have |
| **Condition** | select (New/Excellent/Good/Average/Poor/Non-runner) | `cars.condition_rating` | ✅ have — **identical value set** |
| **Colour** | text | `cars.colour` | ✅ have |
| **Sold in roadworthy condition** | Yes/No | `cars.sold_roadworthy` | ✅ have (purpose-built) |
| **Eligible for finance** | Yes/No | `cars.eligible_for_finance` | ✅ have (purpose-built) |

## Optional fields we can populate

| cars.co.za field | Everest source | Notes |
|---|---|---|
| Variant | `cars.variant` | Auto-fills from MM Code; else use Custom Variant |
| Custom Variant | `cars.variant` | Free-text fallback |
| VIN | `cars.vin` | ✅ |
| Description | `cars.description` | ✅ |
| Reference | `cars.stock_number` | ✅ use as our reference |
| Appearance (features: ABS, Aircon, Sunroof, Leather, etc. — ~25 checkboxes) | `cars.features` (array) | ✅ have — needs a **label-mapping dictionary** (our strings → their checkbox labels) |
| Vehicle Photos | `cars.gallery_images` / `gallery_meta` | ✅ have URLs — download then upload (uploader mechanism is custom, TBD at build) |
| Vehicle License Disc | (have `registration_number`, `vin`) | Optional scan-to-autofill; can skip |
| Status | force **Inactive** | Per instruction — never auto-activate |
| Dealer email | static (dealer constant) | Not per-vehicle |

## What we still require (the gaps)

1. **MM Code — the only hard blocker.** cars.co.za requires the Mead & McGrouther
   code; Everest does not store it. Two ways forward:
   - **Resolve it live (fits attended mode):** after selecting Year, type
     make/model/variant into the MM Code autocomplete, then have the **human pick
     the exact variant** from the suggestions (or auto-pick best match and flag
     low-confidence ones). No schema change; human confirms accuracy.
   - **Store it:** add `mm_code` to the `cars` table and back-fill per vehicle.
     Most reliable for full automation, but needs data entry once per car.

2. **Features label dictionary** — map Everest `features` strings to cars.co.za's
   fixed checkbox labels (ABS, Aircon, Alarm, Radio, Sunroof, Towbar, Leather
   seats, Apple CarPlay & Android Auto, etc.). One-time mapping table.

3. **Photo upload handling** — the Photos/License-Disc sections use a custom
   uploader (no standard `<input type=file>` on load). Need to wire downloading
   Everest gallery images and feeding them to the uploader.

4. **Minor value maps** — `condition` → Used/New (trivial); `service_history`,
   `previous_owners`, warranty fields → their optional equivalents if desired.

## Bottom line

Everest already stores ~95% of what cars.co.za needs (the schema was clearly
built with this export in mind — `sold_roadworthy` / `eligible_for_finance`
match exactly). The **only genuine missing datum is the MM Code**, which can
either be resolved interactively in attended mode or stored once per vehicle.

---

# AutoTrader Connect (connect.autotrader.co.za) — mapping

Mapped read-only on 2026-06-29 (never saved/published). Add flow is **2 steps**.

## Step 1 — Find Verified Vehicle Specification
A typeahead lookup (no stored code needed):

| Input | Everest source |
|---|---|
| Make / model / variant (typeahead → `VehicleSpecificationId`) | `make` + `model` + `variant` |
| Registration year | `year` / `registration_year` |
| Mileage | `mileage` |

The typeahead can return multiple matches (e.g. "1.5 GLX" vs "1.5 GLX Auto").
Everest's `transmission` usually disambiguates; human confirms in attended mode.

## Step 2 — Listing detail (field names match Everest columns almost 1:1)

| AutoTrader field | Req? | Everest source |
|---|---|---|
| Registration Year | ✅ | `registration_year` |
| Mileage | ✅ | `mileage` |
| Colour (select, 21 opts) | ✅ | `colour` (map to their list) |
| Has Warranty | ✅ | `has_warranty` |
| transmissionType | – | `transmission` |
| fuelType (12 opts) | – | `fuel_type` |
| newOrUsed | – | `condition` |
| stockRefNo | – | `stock_number` |
| vin | – | `vin` |
| registrationNumber | – | `registration_number` |
| manufacturerColour | – | `manufacturer_colour` |
| Previous Owners | – | `previous_owners` |
| Accident involved | – | `accident_involved` |
| Service History (7 opts) | – | `service_history` (same 7 values) |
| Warranty End Date / Mileage | – | `warranty_end_date` / `warranty_mileage` |
| Retail Price | – | `price` |
| tradeInPrice | – | `trade_in_price` |
| reconditioningCosts | – | `reconditioning_cost` |
| description | – | `description` |
| Photos (standard `<input type=file>`, ×2) | – | `gallery_images` |
| status (force draft/inactive) | – | — |

AutoTrader uses **standard file inputs** for photos — easier than cars.co.za's
custom uploader.

---

# Combined conclusion (both portals)

**No schema change is required.** Everest already holds 100% of the data both
portals need. Vehicle identification on BOTH is a **typeahead spec search** keyed
on make/model/variant (+ year/mileage) — so the earlier "MM Code gap" dissolves:
we resolve the spec live and let the human (or a transmission/variant match)
confirm. Storing codes would be worse (two different codes, one per portal).

Remaining work is build-time mapping, not data:
- map `colour` → each portal's colour dropdown,
- map `features` → each portal's checkbox labels,
- map value-lists (service_history, condition) — mostly already aligned,
- handle photo upload (AutoTrader = plain file input; cars.co.za = custom).
