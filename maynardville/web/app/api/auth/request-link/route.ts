import { NextResponse } from "next/server";
import { createMagicToken } from "@/lib/auth-tokens";
import { getUserByEmail } from "@/lib/users";
import { sendMail } from "@/lib/email";
import type { StaffSession } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email")?.toString();
    if (email) {
      const user = await getUserByEmail(email);
      if (user) {
        const token = createMagicToken(email);
        const baseUrl = process.env.APP_BASE_URL || new URL(req.url).origin;
        const link = `${baseUrl}/api/auth/callback?token=${encodeURIComponent(token)}`;
        await sendMail({
          to: email,
          subject: "Your Maynardville sign-in link",
          html: `<p>Click <a href="${link}">here</a> to sign in. This link expires in 15 minutes.</p>`,
        });
      }
    }
  } catch (error) {
    console.error("Error processing magic link request:", error);
  }

  const redirectUrl = new URL("/staff-login?sent=1", process.env.APP_BASE_URL || new URL(req.url).origin);
  return NextResponse.redirect(redirectUrl, 303);
}