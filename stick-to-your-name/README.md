# Stick to Your Name

Single-page ordering site for personalised vinyl name labels. A parent scans a QR code, picks a design, fills in their child's name, pays via **PayFast**, and the order lands in the admin dashboard.

Payment is required before an order is confirmed — pending orders without a successful PayFast ITN are never shown to staff.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind v3
- Vercel Postgres (Neon under the hood) — works on Vercel out of the box
- PayFast — South African card / EFT / SnapScan gateway
- Cookie-based admin session (bcrypt password + JWT cookie)

## Local development

```bash
cd stick-to-your-name
npm install
cp .env.example .env.local
# edit .env.local — see below
npm run dev
```

Open http://localhost:3000

### Environment variables

| Var | What |
|---|---|
| `PAYFAST_MERCHANT_ID` | Your PayFast merchant id (sandbox default works) |
| `PAYFAST_MERCHANT_KEY` | Your PayFast merchant key |
| `PAYFAST_PASSPHRASE` | Optional — set if you set one in PayFast settings |
| `PAYFAST_MODE` | `sandbox` or `production` |
| `NEXT_PUBLIC_SITE_URL` | Public URL (e.g. `https://sticktoyourname.vercel.app`). PayFast posts callbacks here. |
| `POSTGRES_URL` | Vercel/Neon Postgres connection string |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — generate with the script below |
| `ADMIN_SESSION_SECRET` | Long random string for signing admin session cookies |

Generate the admin password hash:

```bash
node scripts/hash-password.mjs "your-chosen-password"
```

Paste the output into `ADMIN_PASSWORD_HASH`.

### Database

The `orders` table is created automatically on the first order. No migration step needed — `ensureSchema()` runs from the order create route.

For local dev you can point `POSTGRES_URL` at a free Neon project (https://neon.tech).

## Deploy to Vercel

1. Push this folder to a Git repo.
2. Create a new Vercel project, point it at the repo.
3. Add a Vercel Postgres integration (or paste a Neon `POSTGRES_URL`).
4. Add all the env vars above in the Vercel dashboard.
5. Deploy.

Then in your PayFast dashboard, set:

- **Return URL**: `https://<your-vercel-domain>/success`
- **Cancel URL**: `https://<your-vercel-domain>/cancelled`
- **Notify URL**: `https://<your-vercel-domain>/api/payfast/notify`

(The site sets these automatically per transaction, but PayFast also has account-level defaults.)

## Admin

Visit `/admin/login`, enter the password, and you'll see all paid + pending orders. PayFast cancellations and failures are tucked under a collapsed section.

## Design thumbnails

Currently the 40 designs are rendered as coloured gradient circles with the design name. To use real images, drop PNGs into `public/designs/<id>.png` and update `src/app/page.tsx` to render `<img>` for those designs. The design ids are listed in `src/lib/designs.ts`.

## QR code

To generate a QR code that points at the site, use any QR generator (e.g. https://www.qr-code-generator.com) with your production URL. Print it on flyers / school newsletters.

---

Made for Melissa @ Aloe Signs · Randfontein · 083 417 5490
