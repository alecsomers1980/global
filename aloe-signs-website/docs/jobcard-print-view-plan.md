# Jobcard Print/PDF View — Design

**Date:** 2026-08-12 (revised same day — HTML print view replaced with a real PDF)
**Status:** Approved, implemented

## Problem

The jobcard edit page (`app/portal/admin/jobcards/[id]/page.tsx`) is an interactive
form — full of input borders, dropdowns, and pricing fields. Production staff need a
clean, professional shop-floor document with just the customer/job info and the specs
for the departments actually working the job, none of the pricing, that can be
printed or shared as a file (e.g. via WhatsApp).

## Approach (revised)

First pass built an HTML print-preview page that called `window.print()`. Superseded
same day: the ask evolved to "make it a PDF that looks professional and can be
printed or sent via WhatsApp." A browser print dialog doesn't produce a shareable
file, so a real PDF is the right primitive — and it still covers printing (open the
PDF, hit Print in the viewer).

**Library:** `@react-pdf/renderer` — already used in this monorepo for
`everest-motoring`'s monthly report PDF. Pure Node, renders a React component tree
straight to a PDF buffer; no headless browser (Puppeteer/Chromium), which avoids the
binary-size/cold-start risk that comes with HTML→PDF rendering on Vercel serverless.

**Pieces:**
- `lib/jobcard-pdf.tsx` — pure `Document`/`Page`/`View`/`Text` component, data in,
  PDF tree out. No data fetching.
- `app/api/portal/admin/jobcards/[id]/pdf/route.ts` — Node runtime (`export const
  runtime = 'nodejs'`), same auth check as the existing GET route, fetches the
  jobcard row, renders via `renderToBuffer`, returns `Content-Type: application/pdf`,
  `Content-Disposition: inline` (opens in the browser's/OS's native PDF viewer rather
  than forcing a download).
- Edit page's "Print Jobcard" button → "PDF Jobcard", opens
  `/api/portal/admin/jobcards/[id]/pdf` in a new tab.
- The HTML print-preview page (`app/portal/admin/jobcards/[id]/print/`) is deleted —
  superseded, no reason to maintain two versions of the same layout.

**WhatsApp:** there is no way to make a button attach a file directly into a specific
WhatsApp chat without the paid WhatsApp Business API (out of scope, not requested).
What `inline` PDF delivery gives for free: the native PDF viewer's own Share icon
(mobile) opens the OS share sheet, which lists WhatsApp like any other file share;
desktop is download-then-drag-into-WhatsApp-Web, same as today. Confirmed acceptable
with the user before building.

## Content

**Header:** logo, Company, Contact, Tel (mobile 1 & 2), Email, Invoice, Quote No,
PO No, Address, Entry #, Date.

**Items table:** Quantity, Size, Item, Description. No Price/Total columns.

**Other Notes:** the free-text `design_notes` field.

**Department sections** — rendered only when the department's checkbox is ticked on
the jobcard, spec fields only, no charge/cost figures:

| Department | Fields printed |
|---|---|
| UV Flatbed (`prod_flatbed`) | qty, size, type (single/double), shape, mirror, selected materials |
| Screen (`prod_screen`) | qty, sides, material, specs |
| Application (`prod_applicate`) | LAM / Vehicle / On-site flags, notes |
| Engineering (`prod_engineer`) | qty, size, material, thickness, angle |
| Installation (`track_installation`) | address, vehicles, crew counts, tools required, safety file, additional equipment notes |
| Delivery (`track_deliver`) | delivery address, vehicle type flags |

## Explicitly excluded

Sub Total / VAT / Total, all "Charge: R…" lines, Artwork / HP Latex / HP Vinyl Cut /
Outsource / Civil / Collect sections, Order No / Pro Inv / Invoice footer, Deposit /
Cash checkboxes, Scanned Jobcard, Files-uploaded module, workflow status bar.

## Verification

- `tsc --noEmit` clean.
- Rendered the actual PDF (via `renderToBuffer`, outside the HTTP layer, against
  live production rows) for two real jobcards: one with every relevant department
  ticked (UV Flatbed, Screen, Application, Engineering, Installation, Delivery —
  confirms all six sections render and Delivery cleanly overflows to page 2 instead
  of splitting a card) and the RCL Ultra Pet jobcard from the original request photo
  (confirms header/items match exactly, zero pricing anywhere).
- New API route resolves under the same portal auth middleware as the rest of
  `/portal/admin/*` (confirmed via the earlier print-page check, same middleware
  config, unchanged).
