import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadEmail } from "@/lib/email";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const leadSchema = z.object({
  name: z
    .string({ error: "Please give us your name." })
    .trim()
    .min(2, "Please give us your name."),
  phone: z
    .string({ error: "Please give us a contact number." })
    .trim()
    .min(8, "Please give us a contact number."),
  email: z
    .union([z.string().trim().email("That email doesn't look right."), z.literal("")])
    .optional(),
  town: z.string().trim().max(80).optional(),
  message: z.string().trim().max(2000).optional(),
  quoteSummary: z.string().trim().max(4000).optional(),
  /** Honeypot — real users never fill this; bots do. Accepted by the schema so
      the handler can silently drop it rather than telling the bot it was caught. */
  company: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(`lead:${getClientIp(req)}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 },
      );
    }

    const parsed = leadSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check your details." },
        { status: 400 },
      );
    }

    const { company, ...lead } = parsed.data;

    // Silently accept honeypot hits so bots don't learn they were caught.
    if (company) return NextResponse.json({ ok: true });

    const result = await sendLeadEmail({
      ...lead,
      email: lead.email || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Could not send your enquiry." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please WhatsApp or call us instead." },
      { status: 500 },
    );
  }
}
