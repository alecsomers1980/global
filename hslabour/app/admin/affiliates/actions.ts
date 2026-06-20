"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAffiliateCode } from "@/lib/affiliate/code";

export type AdminResult = { success: boolean; error?: string; trackingCode?: string };

export async function approveAffiliate(
  affiliateId: string,
  firstName: string | null,
): Promise<AdminResult> {
  try {
    if (!affiliateId) return { success: false, error: "Missing ID" };
    const supabase = createAdminClient();
    const trackingCode = generateAffiliateCode(firstName, affiliateId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: true, affiliate_code: trackingCode })
      .eq("id", affiliateId)
      .eq("role", "affiliate");
    if (error) {
      console.error("Approve affiliate error:", error);
      return { success: false, error: error.message };
    }
    revalidatePath("/admin/affiliates");
    return { success: true, trackingCode };
  } catch (err) {
    console.error("approveAffiliate exception:", err);
    return { success: false, error: "Server Exception" };
  }
}

export async function declineAffiliate(affiliateId: string): Promise<AdminResult> {
  try {
    if (!affiliateId) return { success: false, error: "Missing ID" };
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: false, affiliate_code: null })
      .eq("id", affiliateId)
      .eq("role", "affiliate");
    if (error) {
      console.error("Decline affiliate error:", error);
      return { success: false, error: error.message };
    }
    revalidatePath("/admin/affiliates");
    return { success: true };
  } catch (err) {
    console.error("declineAffiliate exception:", err);
    return { success: false, error: "Server Exception" };
  }
}