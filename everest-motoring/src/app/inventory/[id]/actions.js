"use server";

import { createClient } from "@/utils/supabase/server";

import { cookies } from "next/headers";

export async function submitLead(formData) {
    try {
        const supabase = await createClient();

        const car_id = formData.get("car_id");
        const client_name = formData.get("client_name");
        const client_phone = formData.get("client_phone");
        const client_email = formData.get("client_email");

        if (!car_id || !client_name || !client_phone) {
            return { error: "Missing required fields" };
        }

        // --- AFFILIATE TRACKING LOGIC ---
        let affiliate_id = null;
        let lead_source = "website_direct";

        const cookieStore = cookies();
        const refCode = cookieStore.get("everest_affiliate_id")?.value;

        if (refCode) {
            // Find the affiliate's UUID using their tracking string
            const { data: affiliateProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('affiliate_code', refCode)
                .single();

            if (affiliateProfile) {
                affiliate_id = affiliateProfile.id;
                lead_source = "affiliate_link";
            }
        }
        // --------------------------------

        const newLead = {
            car_id,
            client_name,
            client_phone,
            client_email: client_email || null,
            lead_source: lead_source,
            affiliate_id: affiliate_id,
            status: "new"
        };

        const { error } = await supabase.from("leads").insert([newLead]);

        if (error) {
            console.error("Supabase Error saving lead:", error);
            return { error: "Database error" };
        }

        return { success: true };

    } catch (error) {
        console.error("Server Action Error:", error);
        return { error: "Server action failed" };
    }
}
