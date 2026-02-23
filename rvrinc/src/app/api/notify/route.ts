import { NextRequest, NextResponse } from "next/server";
import { sendCaseUpdateEmail, sendAdminNotification } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const notifySchema = z.object({
    type: z.enum(["case_update", "admin_alert"]),
    // For case updates
    clientEmail: z.string().email().optional(),
    clientName: z.string().optional(),
    caseNumber: z.string().optional(),
    caseTitle: z.string().optional(),
    updateMessage: z.string().optional(),
    // For admin alerts
    subject: z.string().optional(),
    message: z.string().optional(),
    recipientEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
    try {
        // Verify the user is authenticated and is admin/attorney
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["admin", "attorney", "staff"].includes(profile.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const parsed = notifySchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const data = parsed.data;
        let result;

        if (data.type === "case_update") {
            if (!data.clientEmail || !data.clientName || !data.caseNumber || !data.caseTitle || !data.updateMessage) {
                return NextResponse.json(
                    { error: "Missing required fields for case update" },
                    { status: 400 }
                );
            }
            result = await sendCaseUpdateEmail({
                clientEmail: data.clientEmail,
                clientName: data.clientName,
                caseNumber: data.caseNumber,
                caseTitle: data.caseTitle,
                updateMessage: data.updateMessage,
            });
        } else if (data.type === "admin_alert") {
            if (!data.subject || !data.message) {
                return NextResponse.json(
                    { error: "Missing required fields for admin alert" },
                    { status: 400 }
                );
            }
            result = await sendAdminNotification({
                subject: data.subject,
                message: data.message,
                recipientEmail: data.recipientEmail,
            });
        }

        if (!result?.success) {
            return NextResponse.json(
                { error: result?.error || "Failed to send notification" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Notification sent" });
    } catch (error: any) {
        console.error("Notify API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
