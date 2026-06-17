import { NextRequest, NextResponse } from "next/server";
import { createCompRequest, getRequesterById } from "@/lib/airtable";

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

    // 2. SECURITY: re-fetch the requester by ID and confirm the chosen category is allowed.
    // This server-side check (NOT the UI) is the real enforcement of per-requester categories.
    const requester = await getRequesterById(requesterId);
    if (!requester) {
      return NextResponse.json({ error: "Unable to verify requester" }, { status: 403 });
    }
    if (!requester.allowedCategoryIds.includes(categoryId)) {
      return NextResponse.json({ error: "Category not allowed for this requester" }, { status: 403 });
    }

    // 3. Create the comp request with Ticket Status defaulted to REQUEST
    const id = await createCompRequest({
      requesterId,
      guestName: guestName.trim(),
      guestSurname: guestSurname.trim(),
      performanceId,
      categoryId,
      guestEmail: guestEmail.trim(),
      totalSeats: Number(totalSeats),
      houseSeats: Boolean(houseSeats),
      notes: notes?.trim() ?? "",
    });

    return NextResponse.json({ ok: true, id });

  } catch (error) {
    console.error("POST /api/requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}