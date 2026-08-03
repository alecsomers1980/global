Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Next.js 14 App Router + TypeScript + Tailwind. Build staff magic-link sign-in wiring. AVAILABLE IMPORTS (already exist):
- from "@/lib/auth-tokens": createMagicToken(email), readMagicToken(token):{email}|null, createSessionToken(staff):string, readSessionToken(token):StaffSession|null
- from "@/lib/users": getUserByEmail(email): Promise<StaffSession|null>
- from "@/lib/email": sendMail({to,subject,html}): Promise<void>
- Type StaffSession { id, name, role } from "@/lib/types".
Env: APP_BASE_URL. Session cookie name: "mv_session" (httpOnly, path "/", sameSite "lax", secure only when NODE_ENV==="production", maxAge 60*60*12). Brand: Tailwind colours mv.navy #060A3C, mv.blue #0F3193, mv.mint #62DAA9, mv.cream #FFFADB; font-heading Montserrat; rounded 3px.

Build/replace these files:

lib/session.ts — REWRITE. Cookie "mv_session" holds a session token (use readSessionToken to verify).
- `import { cookies } from "next/headers"; import { redirect } from "next/navigation"; import { readSessionToken } from "@/lib/auth-tokens"; import type { StaffSession } from "@/lib/types";`
- `getStaffSession(): StaffSession | null` — read cookies().get("mv_session")?.value, return readSessionToken(value) or null.
- `requireStaff(allowedRoles?: string[]): StaffSession` — const s = getStaffSession(); if (!s) redirect("/staff-login"); if (allowedRoles && !allowedRoles.includes(s.role)) redirect("/dashboard"); return s.
- `getStaffFromRequest(req: Request): StaffSession | null` — parse the raw "cookie" header from req.headers.get("cookie"), find mv_session=..., decodeURIComponent its value, return readSessionToken(value) or null. (Works for any Request.)

app/api/auth/request-link/route.ts — `export async function POST(req: Request)`. Read form data (field "email"). Look up getUserByEmail(email). If found, create a magic token and sendMail to that email: subject "Your Maynardville sign-in link", html with a button/link to `${process.env.APP_BASE_URL || new URL(req.url).origin}/api/auth/callback?token=${encodeURIComponent(token)}` (note it expires in 15 minutes). ALWAYS (whether found or not — don't leak existence) return NextResponse.redirect to "/staff-login?sent=1" (303). Wrap in try/catch; on error still redirect to /staff-login?sent=1 but console.error the cause.

app/api/auth/callback/route.ts — `export async function GET(req: Request)`. Read token from the URL search params. readMagicToken(token); if null → redirect "/staff-login?error=expired". getUserByEmail(payload.email); if null → redirect "/staff-login?error=denied". Create a session token; build `const res = NextResponse.redirect(new URL("/dashboard", process.env.APP_BASE_URL || req.url));` set cookie mv_session with the session options above; return res.

app/api/auth/logout/route.ts — `export async function GET(req: Request)`. Build a redirect to "/staff-login", delete/expire the mv_session cookie (set value "" maxAge 0), return it.

app/api/auth/dev-login/route.ts — `export async function GET(req: Request)`. DEV ONLY: if (process.env.NODE_ENV === "production") return NextResponse.redirect(new URL("/staff-login", req.url)). Else read searchParams "role" and "name", build StaffSession { id: name.toLowerCase().replace(/\s+/g,"-"), name, role }, create a session token, set mv_session cookie, redirect to "/dashboard". Add a comment this is a temporary local-testing shortcut.

app/staff-login/page.tsx — REWRITE. Branded (navy hero, cream text), title "Staff Sign-in". A form POSTing (method="post") to "/api/auth/request-link" with an email input (name="email", required) and a mv-blue submit "Email me a sign-in link". Read searchParams: if ?sent → show a mint confirmation "Check your email for a sign-in link (valid 15 minutes)."; if ?error=expired → "That link has expired, please request a new one."; if ?error=denied → "That email isn’t authorised. Contact the festival office." Below a divider, render a DEV-ONLY block (only when process.env.NODE_ENV !== "production") titled "Dev quick-login" with two links: `/api/auth/dev-login?role=Admin&name=Jaco` ("Continue as Jaco — Admin") and `/api/auth/dev-login?role=Box%20Office&name=Jeff` ("Continue as Jeff — Box Office"). This is a server component; read searchParams from props.

Use `import { NextResponse } from "next/server";` in route handlers. Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
