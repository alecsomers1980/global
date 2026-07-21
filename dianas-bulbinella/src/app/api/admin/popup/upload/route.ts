import { NextResponse } from "next/server";
import { requireStaff, uploadImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await requireStaff();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const url = await uploadImage(formData.get("file"), "site-media", "popup");
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("[popup.upload]", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
