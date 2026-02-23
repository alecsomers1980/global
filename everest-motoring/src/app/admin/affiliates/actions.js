"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleAffiliateApproval(formData) {
    try {
        const supabase = await createClient();
        const affiliateId = formData.get("affiliateId");
        const currentApprovalStatus = formData.get("currentStatus") === "true";

        if (!affiliateId) return { success: false, error: "Missing ID" };

        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: !currentApprovalStatus })
            .eq('id', affiliateId)
            .eq('role', 'affiliate');

        if (error) {
            console.error("Error updating affiliate approval:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/affiliates');
        return { success: true };
    } catch (error) {
        console.error("Server Action Exception:", error);
        return { success: false, error: "Server Exception" };
    }
}

export async function addAffiliateAction(formData) {
    try {
        const supabase = await createAdminClient();

        const email = formData.get("email");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const phone = formData.get("phone");

        if (!email || !firstName || !lastName || !phone) {
            return { success: false, error: "All fields are required" };
        }

        // Use the Admin API to invite the user securely
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                role: 'affiliate'
            }
        });

        if (error) {
            console.error("Error creating affiliate:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/affiliates');
        return { success: true };

    } catch (error) {
        console.error("Add Affiliate Action Exception:", error);
        return { success: false, error: "Server Exception" };
    }
}
