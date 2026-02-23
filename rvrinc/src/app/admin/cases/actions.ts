"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCaseStatus(formData: FormData) {
    const supabase = createClient();

    const caseId = formData.get("caseId") as string;
    const newStatus = formData.get("status") as string;
    const notes = formData.get("notes") as string;
    const scheduledDate = formData.get("scheduledDate") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get current case status
    const { data: currentCase } = await supabase
        .from("cases")
        .select("status, status_phase")
        .eq("id", caseId)
        .single();

    // Determine phase from status config
    const { data: statusInfo } = await supabase
        .from("case_statuses")
        .select("phase, default_note")
        .eq("slug", newStatus)
        .single();

    const finalNotes = notes || statusInfo?.default_note || null;

    // Insert history record
    await supabase.from("case_status_history").insert({
        case_id: caseId,
        old_status: currentCase?.status || null,
        new_status: newStatus,
        notes: finalNotes,
        scheduled_date: scheduledDate || null,
        changed_by: user.id,
    });

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

    await supabase.from("cases").update(updateData).eq("id", caseId);

    revalidatePath(`/admin/cases/${caseId}`);
    revalidatePath("/admin/cases");
    revalidatePath(`/portal/cases/${caseId}`);
    revalidatePath("/portal/cases");

    return { success: true };
}
