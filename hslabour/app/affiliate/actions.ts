"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BankResult = { error?: string; success?: boolean };

export async function saveBankDetails(formData: FormData): Promise<BankResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const bank_name = String(formData.get("bank_name") ?? "").trim();
  const account_number = String(formData.get("account_number") ?? "").trim();
  const branch_code = String(formData.get("branch_code") ?? "").trim();
  if (!bank_name || !account_number || !branch_code) {
    return { error: "All fields are required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ bank_name, account_number, branch_code })
    .eq("id", user.id);
  if (error) {
    console.error("Failed to save bank details:", error);
    return { error: "Database error. Please try again." };
  }

  revalidatePath("/affiliate");
  return { success: true };
}