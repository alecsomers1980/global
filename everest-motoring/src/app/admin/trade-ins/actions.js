"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTradeInStatus(formData) {
    try {
        const supabase = await createClient();
        const requestId = formData.get("requestId");
        const newStatus = formData.get("status");
        const offerValue = formData.get("offerValue");

        if (!requestId || !newStatus) return;

        const updatePayload = { status: newStatus };
        if (offerValue && offerValue.trim() !== '') {
            updatePayload.offer_value = parseFloat(offerValue);
        }

        const { error } = await supabase
            .from('value_my_car_requests')
            .update(updatePayload)
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
