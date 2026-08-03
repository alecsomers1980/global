import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { z } from "zod";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const contactSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    practiceArea: z.string().min(1, "Practice area is required"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
    try {
        if (isRateLimited(`contact:${getClientIp(req)}`, 5, 60_000)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again in a minute." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const parsed = contactSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const result = await sendContactEmail(parsed.data);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to send email" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Email sent successfully" });
    } catch (error: any) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
