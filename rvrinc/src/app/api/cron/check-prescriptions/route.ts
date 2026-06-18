import { createClient } from "@supabase/supabase-js";
import { getPrescriptionInfo } from "@/lib/prescription";
import { sendPrescriptionAlertEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

// Runs daily via Vercel cron. Uses service_role key to bypass RLS
// since there is no user session in a cron context.
// Alerts fire at 90, 60, 30, and 0 days before prescription expiry.

const ALERT_WINDOWS = [90, 60, 30, 0];

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY not set — prescription cron cannot run");
        return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: cases, error } = await supabase
            .from("cases")
            .select("*, client:profiles!client_id(full_name, email), attorney:profiles!attorney_id(full_name, email)")
            .not("accident_date", "is", null)
            .neq("status", "closed");

        if (error) throw error;
        if (!cases) return NextResponse.json({ checked: 0, alerts: 0 });

        let alertsSent = 0;

        for (const c of cases) {
            const info = getPrescriptionInfo(c.accident_date, c.status);
            if (!info) continue;

            const daysAbs = Math.abs(info.daysRemaining);
            const isAlertDay = ALERT_WINDOWS.includes(daysAbs);
            const isFirstExpiredDay = info.risk === "expired" && daysAbs <= 3;

            if (!isAlertDay && !isFirstExpiredDay) continue;

            const result = await sendPrescriptionAlertEmail({
                attorneyEmail: c.attorney?.email || null,
                attorneyName: c.attorney?.full_name || null,
                caseNumber: c.case_number,
                caseTitle: c.title,
                daysRemaining: info.daysRemaining,
                deadlineDate: info.deadlineDate,
                risk: info.risk,
            });

            if (result.success) alertsSent++;
        }

        return NextResponse.json({ checked: cases.length, alerts: alertsSent });
    } catch (error: any) {
        console.error("Prescription check cron error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
