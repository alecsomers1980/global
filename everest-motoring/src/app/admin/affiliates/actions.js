"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Helper: generate a deterministic affiliate tracking code ───────────────
// Format: FIRSTNAME + last 4 chars of their UUID (uppercase, no dashes)
function generateAffiliateCode(firstName, userId) {
    const namePart = (firstName || "AFF").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5);
    const idPart = userId.replace(/-/g, "").slice(-4).toUpperCase();
    return `${namePart}${idPart}`;
}

// ─── Approve affiliate + auto-assign tracking code ───────────────────────────
export async function approveAffiliateAction(affiliateId, firstName) {
    try {
        const supabase = await createAdminClient();
        if (!affiliateId) return { success: false, error: "Missing ID" };

        const trackingCode = generateAffiliateCode(firstName, affiliateId);

        const { error } = await supabase
            .from('profiles')
            .update({
                is_approved: true,
                affiliate_code: trackingCode,
            })
            .eq('id', affiliateId)
            .eq('role', 'affiliate');

        if (error) {
            console.error("Approve affiliate error:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/affiliates');
        return { success: true, trackingCode };
    } catch (err) {
        console.error("approveAffiliateAction exception:", err);
        return { success: false, error: "Server Exception" };
    }
}

// ─── Decline affiliate (sets is_approved = false, clears code) ───────────────
export async function declineAffiliateAction(affiliateId) {
    try {
        const supabase = await createAdminClient();
        if (!affiliateId) return { success: false, error: "Missing ID" };

        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: false, affiliate_code: null })
            .eq('id', affiliateId)
            .eq('role', 'affiliate');

        if (error) {
            console.error("Decline affiliate error:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/affiliates');
        return { success: true };
    } catch (err) {
        console.error("declineAffiliateAction exception:", err);
        return { success: false, error: "Server Exception" };
    }
}

// ─── Delete affiliate entirely (removes from Auth + cascades to profiles) ─────
export async function deleteAffiliateAction(affiliateId) {
    try {
        const supabase = await createAdminClient();
        if (!affiliateId) return { success: false, error: "Missing ID" };

        const { error } = await supabase.auth.admin.deleteUser(affiliateId);

        if (error) {
            console.error("Delete affiliate error:", error);
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/affiliates');
        return { success: true };
    } catch (err) {
        console.error("deleteAffiliateAction exception:", err);
        return { success: false, error: "Server Exception" };
    }
}

// ─── Legacy toggle (kept for backward compatibility) ─────────────────────────
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

        if (error) return { success: false, error: error.message };

        revalidatePath('/admin/affiliates');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Server Exception" };
    }
}

// ─── Add / invite a new affiliate ────────────────────────────────────────────
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

        const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { first_name: firstName, last_name: lastName, phone, role: 'affiliate' }
        });

        if (error) return { success: false, error: error.message };

        revalidatePath('/admin/affiliates');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Server Exception" };
    }
}

