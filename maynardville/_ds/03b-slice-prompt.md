Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

This is a Next.js 14 App Router + TypeScript + Tailwind project for the "Maynardville Festival Ops Platform". A lib/airtable.ts already exists exporting: getRequesterByToken(token), listActivePerformances(season), listCategoriesByIds(ids), createCompRequest(input). lib/types.ts exports Category, Performance, Requester, CompRequestInput. Tailwind has colours mv.navy #060A3C, mv.blue #0F3193, mv.mint #62DAA9, mv.cream #FFFADB, mv["navy-muted"] #3D4067, font-heading/font-sans (Montserrat), rounded DEFAULT 3px. Build these files, on-brand (navy/cream hero, mint primary buttons, clean and mobile-friendly):

===FILE: app/request/[token]/page.tsx===
Server component. Reads params.token. Calls getRequesterByToken(token). If null → render a centred branded "This link is invalid or has expired" message. Else load listActivePerformances(process.env.CURRENT_SEASON ?? "2026") and listCategoriesByIds(requester.allowedCategoryIds). Render a branded header ("Complimentary Ticket Request" + greeting with requester.name) and <RequestForm requester={requester} performances={...} categories={...} />. Handle empty performances gracefully.
===END===

Also build:

app/request/[token]/RequestForm.tsx — "use client". Props: requester: Requester, performances: Performance[], categories: Category[]. A controlled form with fields: Guest Name (req), Guest Surname (req), Performance (select from performances, show label, req), Category (select from categories — ONLY the ones passed in, req), Guest Email (email, req), Total Seats Requested (number, min 1, req), House Seats (checkbox), Notes (textarea). On submit, POST JSON to /api/requests with all fields + requesterId. Show inline validation, a loading state, and a success panel ("Request submitted — status: REQUEST") on 200. Style with the brand (labels mv-navy, inputs with 3px radius and mv-navy-muted border, primary button bg mv-blue text white, hover mv-navy). Mobile-friendly single column.

app/api/requests/route.ts — POST handler (Next route handler). Parse JSON body. Validate required fields and totalSeats>=1. SECURITY: re-fetch the requester via getRequesterByToken is not available here, so instead accept requesterId + categoryId and re-validate server-side by loading the requester record by id (add a small inline fetch or assume a helper) and CONFIRM categoryId is within the requester's allowed categories; reject 403 if not. Also default Ticket Status to REQUEST inside createCompRequest. On success return { ok:true, id }. Return 400 on validation error, 403 on category violation, 500 on Airtable error. Include a clear comment that this server-side category check is the real enforcement (not the UI).

app/dashboard/page.tsx — a STATIC branded shell stub (no real auth yet — add a TODO comment that staff auth via Auth.js comes in Phase 2). Show three placeholder panels as cards: "To Approve", "To Issue", "Full Comps List", each with a muted "Connect to Airtable in Phase 2" note. Branded header bar with the platform name.

SETUP.md — concise Phase-1 setup guide: prerequisites (Node 18+); 1) cd web && npm install; 2) copy .env.example to .env.local and fill AIRTABLE_API_KEY (a Maynardville personal access token with data.records:read/write and schema.bases:write scopes), AIRTABLE_BASE_ID, CURRENT_SEASON, Quicket keys; 3) create the Airtable base structure by running `node scripts/create-airtable-base.mjs` (creates the 8 tables); 4) seed the Requesters/Categories; 5) npm run dev; visit /request/<token> using a token from the Requesters table; 6) note staff dashboard auth lands in Phase 2. Add a short "What lives where (Maynardville-owned)" note: Airtable base, Vercel project, repo, API keys.

Output each as its own ===FILE:===/===END=== block, relative paths. No commentary.
