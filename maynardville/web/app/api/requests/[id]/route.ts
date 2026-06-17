import { NextResponse } from "next/server";
import { getStaffFromRequest } from "@/lib/session";
import { approveRequest, declineRequest, issueRequest } from "@/lib/comps";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const staff = getStaffFromRequest(req);
    if (!staff) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { action, reason, seatNumbers, ticketReference } = await req.json();

    if (action === "approve") {
      if (staff.role !== "Admin") {
        return NextResponse.json(
          { message: "Only Admin can approve requests" },
          { status: 403 }
        );
      }
      await approveRequest(params.id, staff.name);
      return NextResponse.json({ ok: true });
    }

    if (action === "decline") {
      if (staff.role !== "Admin") {
        return NextResponse.json(
          { message: "Only Admin can decline requests" },
          { status: 403 }
        );
      }
      if (!reason || reason.trim() === "") {
        return NextResponse.json(
          { message: "Decline reason is required" },
          { status: 400 }
        );
      }
      await declineRequest(params.id, staff.name, reason.trim());
      return NextResponse.json({ ok: true });
    }

    if (action === "issue") {
      if (staff.role !== "Box Office" && staff.role !== "Admin") {
        return NextResponse.json(
          { message: "Insufficient permissions" },
          { status: 403 }
        );
      }
      if (
        !seatNumbers ||
        !ticketReference ||
        seatNumbers.trim() === "" ||
        ticketReference.trim() === ""
      ) {
        return NextResponse.json(
          { message: "Seat numbers and ticket reference are required" },
          { status: 400 }
        );
      }
      await issueRequest(
        params.id,
        staff.name,
        seatNumbers.trim(),
        ticketReference.trim()
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { message: "Unknown action" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}