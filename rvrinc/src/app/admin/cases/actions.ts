"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCaseStatus(formData: FormData) {
    const supabase = createClient();

    try {
        const caseId = formData.get("caseId") as string;
        const newStatus = formData.get("status") as string;
        const notes = formData.get("notes") as string;
        const scheduledDate = formData.get("scheduledDate") as string;

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) return { error: `Auth error: ${authError.message}` };
        if (!user) return { error: "Not authenticated — please log in again." };

        // Get current case status
        const { data: currentCase, error: caseError } = await supabase
            .from("cases")
            .select("status, status_phase")
            .eq("id", caseId)
            .single();
        if (caseError) return { error: `Case lookup failed: ${caseError.message}` };

        // Determine phase from status config
        const { data: statusInfo, error: statusErr } = await supabase
            .from("case_statuses")
            .select("phase, default_note")
            .eq("slug", newStatus)
            .single();
        if (statusErr) return { error: `Status lookup failed: ${statusErr.message}` };

        const finalNotes = notes || statusInfo?.default_note || null;

        // Insert history record
        const { error: historyErr } = await supabase.from("case_status_history").insert({
            case_id: caseId,
            old_status: currentCase?.status || null,
            new_status: newStatus,
            notes: finalNotes,
            scheduled_date: scheduledDate || null,
            changed_by: user.id,
        });
        if (historyErr) return { error: `History insert failed: ${historyErr.message}` };

        // Update the case
        const updateData: Record<string, any> = {
            status: newStatus,
            status_notes: finalNotes,
            status_phase: statusInfo?.phase || null,
            updated_at: new Date().toISOString(),
        };

        if (scheduledDate) {
            updateData.scheduled_date = scheduledDate;
        }

        // Auto-set diary date for "claim_lodged" (120 days)
        if (newStatus === "claim_lodged") {
            const diaryDate = new Date();
            diaryDate.setDate(diaryDate.getDate() + 120);
            updateData.diary_date = diaryDate.toISOString();
        }

        const { error: updateErr } = await supabase.from("cases").update(updateData).eq("id", caseId);
        if (updateErr) return { error: `Case update failed: ${updateErr.message}` };

        revalidatePath(`/admin/cases/${caseId}`);
        revalidatePath("/admin/cases");

        return { success: true };
    } catch (err: any) {
        return { error: `Unexpected error: ${err?.message || String(err)}` };
    }
}

export async function assignAttorney(caseId: string, attorneyId: string) {
    const supabase = createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) return { error: `Auth error: ${authError.message}` };
        if (!user) return { error: "Not authenticated — please log in again." };

        const { error } = await supabase
            .from("cases")
            .update({ attorney_id: attorneyId || null, updated_at: new Date().toISOString() })
            .eq("id", caseId);

        if (error) return { error: `Failed to assign attorney: ${error.message}` };

        revalidatePath(`/admin/cases/${caseId}`);
        revalidatePath("/admin/cases");

        return { success: true };
    } catch (err: any) {
        return { error: `Unexpected error: ${err?.message || String(err)}` };
    }
}
