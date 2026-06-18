import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStatusLabel, getStatusColor, getPhaseProgress, getClientMessage, PHASE_CONFIG, type StatusPhase } from "@/lib/statusConfig";
import { getCaseStatuses } from "@/lib/statuses";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const caseStatusSchema = z.object({
    idNumber: z.string().trim().min(2, "Please enter a valid ID number, passport number, or file reference (e.g. KC001, KCS250)."),
});

export async function POST(req: NextRequest) {
    try {
        if (isRateLimited(`case-status:${getClientIp(req)}`, 10, 60_000)) {
            return NextResponse.json(
                { error: "Too many requests. Please try again in a minute." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const parsed = caseStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        // Use service_role client to bypass RLS — this is a public endpoint
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const cleanId = parsed.data.idNumber.toUpperCase();
        const isFileRef = /^(KC|KCS|KCR|KCM|KCK|KCL|L-|BL-)/i.test(cleanId);

        let caseData: any = null;
        let error: any = null;

        if (isFileRef) {
            // File reference — search case_number first
            let result = await supabase
                .from("cases")
                .select("*")
                .eq("case_number", cleanId)
                .order("updated_at", { ascending: false })
                .limit(1)
                .single();

            if (result.data) {
                caseData = result.data;
            } else {
                // Fallback: ilike search on case_number
                const { data: fallback } = await supabase
                    .from("cases")
                    .select("*")
                    .ilike("case_number", `%${cleanId}%`)
                    .order("updated_at", { ascending: false })
                    .limit(1);

                if (fallback && fallback.length > 0) {
                    caseData = fallback[0];
                } else {
                    error = result.error;
                }
            }
        } else {
            // ID/Passport — search id_number first
            let result = await supabase
                .from("cases")
                .select("*")
                .eq("id_number", cleanId)
                .order("updated_at", { ascending: false })
                .limit(1)
                .single();

            if (result.data) {
                caseData = result.data;
            } else {
                // Fallback: also try original casing for passport numbers
                const { data: exactMatch } = await supabase
                    .from("cases")
                    .select("*")
                    .eq("id_number", parsed.data.idNumber)
                    .order("updated_at", { ascending: false })
                    .limit(1);

                if (exactMatch && exactMatch.length > 0) {
                    caseData = exactMatch[0];
                } else {
                    // Final fallback: ilike on case_number, then title — two parameterized
                    // calls instead of a single raw .or() filter string to avoid letting
                    // user input (which could contain "," or other PostgREST filter syntax) alter the query.
                    const { data: byCaseNumber } = await supabase
                        .from("cases")
                        .select("*")
                        .ilike("case_number", `%${cleanId}%`)
                        .order("updated_at", { ascending: false })
                        .limit(1);

                    const { data: byTitle } = !byCaseNumber?.length
                        ? await supabase
                            .from("cases")
                            .select("*")
                            .ilike("title", `%${cleanId}%`)
                            .order("updated_at", { ascending: false })
                            .limit(1)
                        : { data: null };

                    const byRef = byCaseNumber?.length ? byCaseNumber : byTitle;

                    if (byRef && byRef.length > 0) {
                        caseData = byRef[0];
                    } else {
                        error = result.error;
                    }
                }
            }
        }

        if (error || !caseData) {
            return NextResponse.json(
                { error: "No case found with that ID or Passport number. Please check the number and try again, or contact our office for assistance." },
                { status: 404 }
            );
        }

        const statuses = await getCaseStatuses();
        const statusLabel = getStatusLabel(caseData.status, statuses);
        const { bgColor, textColor } = getStatusColor(caseData.status, statuses);
        const progress = getPhaseProgress(caseData.status, statuses);
        const clientMessage = getClientMessage(caseData.status, statuses);
        const phases = Object.entries(PHASE_CONFIG) as [StatusPhase, typeof PHASE_CONFIG[StatusPhase]][];

        return NextResponse.json({
            found: true,
            case: {
                caseNumber: caseData.case_number,
                title: caseData.title,
                clientName: caseData.client?.full_name || "Client",
                status: caseData.status,
                statusLabel,
                statusColor: { bgColor, textColor },
                progress,
                clientMessage,
                phases: phases.map(([phase, config]) => ({
                    key: phase,
                    label: config.label,
                    color: config.color,
                    completed: phases.findIndex(([p]) => p === phase) < progress.current,
                })),
                lastUpdated: caseData.updated_at,
                accidentDate: caseData.accident_date,
                scheduledDate: caseData.scheduled_date,
            },
        });
    } catch (error: any) {
        console.error("Case status lookup error:", error);
        return NextResponse.json(
            { error: "An error occurred while looking up your case. Please try again or contact our office." },
            { status: 500 }
        );
    }
}
