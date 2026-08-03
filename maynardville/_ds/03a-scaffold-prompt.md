Output ONLY a series of file blocks in EXACTLY this format (no prose before/after, no markdown fences around the whole thing):

===FILE: <project-relative-path>===
<full file contents>
===END===

Generate the FOUNDATION of a Next.js 14 (App Router) + TypeScript + Tailwind app called the "Maynardville Festival Ops Platform". Keep dependencies minimal (NO Airtable SDK — use fetch; NO auth library yet). Use these EXACT brand tokens. Produce these files:

===FILE: package.json===
- name "maynardville-ops", private, scripts: dev/build/start/lint/typecheck ("tsc --noEmit").
- dependencies: next ^14.2.5, react ^18.3.1, react-dom ^18.3.1.
- devDependencies: typescript ^5.5.4, @types/node ^20, @types/react ^18, @types/react-dom ^18, tailwindcss ^3.4.7, postcss ^8.4.40, autoprefixer ^10.4.19, eslint ^8, eslint-config-next ^14.2.5.
===END===

Also produce: tsconfig.json (standard Next strict config with "@/*" path alias to "./"), next.config.mjs (minimal), postcss.config.mjs (tailwindcss + autoprefixer), .eslintrc.json (extends next/core-web-vitals), .gitignore (node_modules, .next, .env*).

tailwind.config.ts — content globs for ./app and ./components and ./lib; theme.extend.colors.mv = { navy:"#060A3C", blue:"#0F3193", mint:"#62DAA9", cream:"#FFFADB", "navy-muted":"#3D4067" }; fontFamily.heading and fontFamily.sans both = ["var(--font-montserrat)","Helvetica","Arial","sans-serif"]; borderRadius.DEFAULT "3px".

app/globals.css — @tailwind base/components/utilities; :root CSS vars for the brand colours; sensible body defaults (bg white, text mv-navy).

app/layout.tsx — import Montserrat from next/font/google with variable "--font-montserrat", subsets ["latin"]; export metadata { title: "Maynardville Festival Ops", description: "..." }; <html lang="en" className={montserrat.variable}><body className="font-sans bg-white text-mv-navy">{children}</body></html>.

app/page.tsx — a simple branded landing: a mv-navy hero band with cream text, the platform name, and a short line that this is the internal operations platform. No data calls.

lib/types.ts — TypeScript interfaces: Category {id,name}; Performance {id,label,date,time,venue,performanceType,season}; Requester {id,name,email,role,allowedCategoryIds:string[]}; CompRequestInput {guestName,guestSurname,performanceId,categoryId,guestEmail,houseSeats,notes,totalSeats,requesterId}.

lib/airtable.ts — a typed Airtable REST wrapper using fetch (no SDK). Read env: AIRTABLE_API_KEY, AIRTABLE_BASE_ID. Table names as constants (Performances, "Comp Requests", Requesters, Categories). Implement:
- async airtableFetch(tablePathAndQuery, init?) → adds Authorization: Bearer header, base URL https://api.airtable.com/v0/${BASE_ID}/...; throws on non-ok.
- getRequesterByToken(token): GET Requesters with filterByFormula AND({Magic Link Token}=token,{Active}=1); return first mapped Requester or null.
- listActivePerformances(season): GET Performances filterByFormula AND({Active}=1,{Season}=season) sorted by Date; map to Performance[].
- listCategoriesByIds(ids): GET Categories (records endpoint) and filter to ids; map to Category[] (id,name).
- createCompRequest(input: CompRequestInput): POST a record to "Comp Requests" with fields Guest Name, Guest Surname, Performance (link [performanceId]), Category (link [categoryId]), Guest Email, House Seats, Notes, "Total Seats Requested", "Ticket Status":"REQUEST", Requester (link [requesterId]); return created record id.
Add clear comments and basic error handling.

.env.example — AIRTABLE_API_KEY=, AIRTABLE_BASE_ID=, CURRENT_SEASON=2026, QUICKET_API_KEY=, QUICKET_USER_TOKEN=, APP_BASE_URL=http://localhost:3000 with a comment that all keys live in Maynardville-owned accounts.

Remember: output every file as its own ===FILE:===/===END=== block, paths relative (e.g. app/layout.tsx, lib/airtable.ts). No commentary.
