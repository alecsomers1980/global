"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTradeInStatus(formData) {
    try {
        const supabase = await createClient();
        const requestId = formData.get("requestId");
        const newStatus = formData.get("status");

        if (!requestId || !newStatus) return;

        const { error } = await supabase
            .from('value_my_car_requests')
            .update({ status: newStatus })
            .eq('id', requestId);

        if (error) {
            console.error("Error updating trade-in status:", error);
            return;
        }

        revalidatePath('/admin/trade-ins');
    } catch (error) {
        console.error("Server Action Exception:", error);
    }
}
