import { clearSessionCookie } from "@/lib/admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function handle() {
  await clearSessionCookie();
  return NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );
}

export const GET = handle;
export const POST = handle;
