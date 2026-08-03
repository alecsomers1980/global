===FILE: app/request/[token]/page.tsx===
import { getRequesterByToken, listActivePerformances, listCategoriesByIds } from "@/lib/airtable";
import { Requester, Performance, Category } from "@/lib/types";
import RequestForm from "./RequestForm";

interface Params {
  token: string;
}

export default async function TokenPage({ params }: { params: Params }) {
  const { token } = params;

  // 1. Verify the requester via token
  const requester: Requester | null = await getRequesterByToken(token);

  if (!requester) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mv-cream px-4">
        <div className="rounded-[3px] border border-mv-navy-muted bg-white p-8 text-center shadow-md max-w-md">
          <h1 className="font-heading text-2xl font-bold text-mv-navy">
            This link is invalid or has expired
          </h1>
          <p className="mt-3 text-mv-navy-muted">
            Please contact the box office for a new link.
          </p>
        </div>
      </main>
    );
  }

  // 2. Load active performances for the current season
  const season = process.env.CURRENT_SEASON ?? "2026";
  let performances: Performance[] = [];
  try {
    performances = await listActivePerformances(season);
  } catch (error) {
    console.error("Failed to load performances", error);
  }

  // 3. Load the categories the requester is allowed to use
  let categories: Category[] = [];
  try {
    categories = await listCategoriesByIds(requester.allowedCategoryIds);
  } catch (error) {
    console.error("Failed to load categories", error);
  }

  const noPerformances = performances.length === 0;

  return (
    <main className="min-h-screen bg-mv-cream px-4 py-8 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Branded header */}
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-mv-navy">
            Complimentary Ticket Request
          </h1>
          <p className="mt-2 text-lg text-mv-navy-muted">
            Hello, {requester.name}!
          </p>
        </div>

        {noPerformances && (
          <div className="mb-6 rounded-[3px] border border-mv-navy-muted bg-white p-4 text-center text-mv-navy">
            There are no performances scheduled for the current season. Please check back later.
          </div>
        )}

        {!noPerformances && (
          <RequestForm
            requester={requester}
            performances={performances}
            categories={categories}
          />
        )}
      </div>
    </main>
  );
}
===END===
===FILE: app/request/[token]/RequestForm.tsx===
"use client";

import { useState, FormEvent } from "react";
import { Requester, Performance, Category } from "@/lib/types";

interface RequestFormProps {
  requester: Requester;
  performances: Performance[];
  categories: Category[];
}

interface FormData {
  guestName: string;
  guestSurname: string;
  performanceId: string;
  categoryId: string;
  guestEmail: string;
  totalSeats: number;
  houseSeats: boolean;
  notes: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function RequestForm({ requester, performances, categories }: RequestFormProps) {
  const [form, setForm] = useState<FormData>({
    guestName: "",
    guestSurname: "",
    performanceId: performances.length === 1 ? performances[0].id : "",
    categoryId: categories.length === 1 ? categories[0].id : "",
    guestEmail: requester.email ?? "",
    totalSeats: 1,
    houseSeats: false,
    notes: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for the field
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    if (!form.guestName.trim()) newErrors.guestName = "Guest name is required.";
    if (!form.guestSurname.trim()) newErrors.guestSurname = "Guest surname is required.";
    if (!form.performanceId) newErrors.performanceId = "Please select a performance.";
    if (!form.categoryId) newErrors.categoryId = "Please select a category.";
    if (!form.guestEmail.trim()) {
      newErrors.guestEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email.";
    }
    if (form.totalSeats < 1) newErrors.totalSeats = "Must request at least 1 seat.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        requesterId: requester.id,
        guestName: form.guestName.trim(),
        guestSurname: form.guestSurname.trim(),
        performanceId: form.performanceId,
        categoryId: form.categoryId,
        guestEmail: form.guestEmail.trim(),
        totalSeats: form.totalSeats,
        houseSeats: form.houseSeats,
        notes: form.notes.trim(),
      };

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[3px] border border-mv-navy-muted bg-white p-8 text-center shadow-sm">
        <div className="text-3xl text-mv-mint mb-4">✓</div>
        <h2 className="font-heading text-xl font-bold text-mv-navy">
          Request submitted — status: REQUEST
        </h2>
        <p className="mt-2 text-mv-navy-muted">
          A member of our team will review your request soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[3px] border border-mv-navy-muted bg-white p-6 shadow-sm">
      {/* Guest Name */}
      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-mv-navy">
          Guest Name *
        </label>
        <input
          type="text"
          id="guestName"
          name="guestName"
          value={form.guestName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="First name of the guest"
        />
        {errors.guestName && <p className="mt-1 text-sm text-red-600">{errors.guestName}</p>}
      </div>

      {/* Guest Surname */}
      <div>
        <label htmlFor="guestSurname" className="block text-sm font-medium text-mv-navy">
          Guest Surname *
        </label>
        <input
          type="text"
          id="guestSurname"
          name="guestSurname"
          value={form.guestSurname}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="Last name of the guest"
        />
        {errors.guestSurname && <p className="mt-1 text-sm text-red-600">{errors.guestSurname}</p>}
      </div>

      {/* Performance Select */}
      <div>
        <label htmlFor="performanceId" className="block text-sm font-medium text-mv-navy">
          Performance *
        </label>
        <select
          id="performanceId"
          name="performanceId"
          value={form.performanceId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted bg-white p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
        >
          <option value="" disabled>
            Select a performance
          </option>
          {performances.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {errors.performanceId && <p className="mt-1 text-sm text-red-600">{errors.performanceId}</p>}
      </div>

      {/* Category Select */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-mv-navy">
          Category *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted bg-white p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
        >
          <option value="" disabled>
            Select a ticket category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
      </div>

      {/* Guest Email */}
      <div>
        <label htmlFor="guestEmail" className="block text-sm font-medium text-mv-navy">
          Guest Email *
        </label>
        <input
          type="email"
          id="guestEmail"
          name="guestEmail"
          value={form.guestEmail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="guest@example.com"
        />
        {errors.guestEmail && <p className="mt-1 text-sm text-red-600">{errors.guestEmail}</p>}
      </div>

      {/* Total Seats */}
      <div>
        <label htmlFor="totalSeats" className="block text-sm font-medium text-mv-navy">
          Total Seats Requested *
        </label>
        <input
          type="number"
          id="totalSeats"
          name="totalSeats"
          min={1}
          value={form.totalSeats}
          onChange={handleChange}
          className="mt-1 block w-32 rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
        />
        {errors.totalSeats && <p className="mt-1 text-sm text-red-600">{errors.totalSeats}</p>}
      </div>

      {/* House Seats */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="houseSeats"
          name="houseSeats"
          checked={form.houseSeats}
          onChange={handleChange}
          className="h-4 w-4 rounded-[3px] border-mv-navy-muted text-mv-blue focus:ring-mv-blue"
        />
        <label htmlFor="houseSeats" className="text-sm font-medium text-mv-navy">
          House Seats
        </label>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-mv-navy">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-[3px] border border-mv-navy-muted p-2 text-mv-navy focus:border-mv-blue focus:ring-2 focus:ring-mv-blue focus:outline-none"
          placeholder="Any special requests or information..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[3px] bg-mv-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-mv-navy focus:outline-none focus:ring-2 focus:ring-mv-blue focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
===END===
===FILE: app/api/requests/route.ts===
import { NextRequest, NextResponse } from "next/server";
import { createCompRequest } from "@/lib/airtable";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Extract and validate required fields
    const {
      requesterId,
      guestName,
      guestSurname,
      performanceId,
      categoryId,
      guestEmail,
      totalSeats,
      houseSeats,
      notes,
    } = body;

    const errors: string[] = [];
    if (!requesterId) errors.push("Missing requesterId");
    if (!guestName || typeof guestName !== "string" || !guestName.trim()) errors.push("guestName is required");
    if (!guestSurname || typeof guestSurname !== "string" || !guestSurname.trim()) errors.push("guestSurname is required");
    if (!performanceId) errors.push("performanceId is required");
    if (!categoryId) errors.push("categoryId is required");
    if (!guestEmail || typeof guestEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errors.push("Valid guestEmail is required");
    if (totalSeats == null || Number(totalSeats) < 1) errors.push("totalSeats must be at least 1");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    // 2. SECURITY: re‑fetch the requester record by ID and confirm the chosen category is allowed.
    const baseUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;
    const apiKey = process.env.AIRTABLE_API_KEY;

    const requesterRes = await fetch(`${baseUrl}/Requesters/${requesterId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!requesterRes.ok) {
      console.error("Failed to fetch requester", requesterRes.status);
      return NextResponse.json({ error: "Unable to verify requester" }, { status: 500 });
    }

    const requesterRecord = await requesterRes.json();
    const requesterFields = requesterRecord.fields;
    const allowedIds: string[] = requesterFields.allowedCategoryIds ?? [];

    if (!allowedIds.includes(categoryId)) {
      // Category not allowed for this requester → 403 Forbidden
      return NextResponse.json({ error: "Category not allowed for this requester" }, { status: 403 });
    }

    // 3. Create the comp request with Ticket Status defaulted to REQUEST
    const created = await createCompRequest({
      requesterId,
      guestName: guestName.trim(),
      guestSurname: guestSurname.trim(),
      performanceId,
      categoryId,
      guestEmail: guestEmail.trim(),
      totalSeats: Number(totalSeats),
      houseSeats: Boolean(houseSeats),
      notes: notes?.trim() ?? "",
      // Ticket Status is hard‑coded to REQUEST on the server side
      ticketStatus: "REQUEST",
    });

    return NextResponse.json({ ok: true, id: created.id });

  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
===END===
===FILE: app/dashboard/page.tsx===
/**
 * Staff dashboard – static placeholder.
 * TODO: Staff authentication (Auth.js) will be added in Phase 2.
 *       The real dashboard will pull Airtable data for pending approvals,
 *       issue workflows, and the full comp list.
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-mv-cream font-sans">
      {/* Branded header bar */}
      <header className="bg-mv-navy px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-white">
            Maynardville Festival Ops Platform
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder cards */}
          <div className="rounded-[3px] border border-mv-navy-muted bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-mv-navy">
              To Approve
            </h2>
            <p className="mt-2 text-mv-navy-muted">
              Connect to Airtable in Phase 2
            </p>
          </div>
          <div className="rounded-[3px] border border-mv-navy-muted bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-mv-navy">
              To Issue
            </h2>
            <p className="mt-2 text-mv-navy-muted">
              Connect to Airtable in Phase 2
            </p>
          </div>
          <div className="rounded-[3px] border border-mv-navy-muted bg-white p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-mv-navy">
              Full Comps List
            </h2>
            <p className="mt-2 text-mv-navy-muted">
              Connect to Airtable in Phase 2
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
===END===
===FILE: SETUP.md===
# Phase 1 Setup Guide – Maynardville Festival Ops Platform

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- Airtable Personal Access Token with **data.records:read/write** and **schema.bases:write** scopes
- Airtable Base ID (create an empty base via Airtable UI, then copy its ID from the URL)

## Step-by-step

1. **Clone and install dependencies**

   ```bash
   cd web
   npm install
   ```

2. **Environment variables**  
   Copy `.env.example` to `.env.local` and fill in the values:

   ```env
   AIRTABLE_API_KEY=patYourPersonalAccessToken
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   CURRENT_SEASON=2026   # or any season string
   QUICKET_API_KEY=      # placeholder for Phase 2 (Quicket integration)
   QUICKET_EVENT_ID=     # placeholder
   ```

3. **Create Airtable base structure**  
   The script builds the 8 required tables (Requesters, Categories, Performances, CompRequests, QuicketEvents, QuicketTickets, AuditLog, Config):

   ```bash
   node scripts/create-airtable-base.mjs
   ```

4. **Seed Requesters and Categories**  
   After the tables are created, add seed data manually or via Airtable UI:

   - **Categories**: add a few records (e.g., “Press”, “VIP”, “Staff”). Note their IDs.
   - **Requesters**: add at least one record with:
     - `token`: a unique string (you’ll use it in the URL)
     - `allowedCategoryIds`: array of Category IDs (use the IDs you just created)
     - `name`, `email`, etc.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000/request/<token>` using the token from your seed Requester record.

6. **Staff dashboard**  
   Placeholder available at `/dashboard`. Real authentication (Auth.js) will be added in Phase 2.

## What lives where (Maynardville‑owned)

- **Airtable Base** – the single source of truth for all ops data.
- **Vercel Project** – hosts the Next.js web app (can be set up in Phase 1 or later).
- **Git Repository** – source code (GitHub / GitLab etc.).
- **API Keys** – Airtable PAT, Quicket keys are stored in Vercel environment variables (or `.env.local` for development).
===END===