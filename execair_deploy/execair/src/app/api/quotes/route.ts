import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendQuoteNotification } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["customer_name", "email", "phone", "product_name"];
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    const enquiryDetails = [
      `Product: ${body.product_name}`,
      `BTU/Capacity: ${body.product_btu || "N/A"}`,
      body.message ? `Message: ${body.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // Insert into Supabase
    const { error: dbError } = await supabase.from("enquiries").insert({
      customer_name: body.customer_name.trim(),
      company: body.company?.trim() || null,
      phone: body.phone.trim(),
      email: body.email.trim(),
      enquiry_details: enquiryDetails,
      status: "new",
      priority: "standard",
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Quote DB error:", dbError);
      return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
    }

    // Send email notification (fire-and-forget)
    sendQuoteNotification({
      customer_name: body.customer_name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      company: body.company?.trim() || null,
      product_name: body.product_name,
      product_btu: body.product_btu || "",
      message: body.message || "",
    }).catch((err) => console.error("Quote email failed:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Quote API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
