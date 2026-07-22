import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
  }

  const { data } = admin.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
