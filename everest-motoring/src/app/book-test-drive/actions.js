"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitContactForm(formData) {
    try {
        const supabase = await createClient();

        const data = {
            client_name: formData.get("full_name"),
            client_email: formData.get("email"),
            client_phone: formData.get("phone"),
            lead_source: "contact_page",
            status: "new",
            message: formData.get("message") || null,
        };

        const preferred_date_1 = formData.get("preferred_date_1");
        const preferred_time_1 = formData.get("preferred_time_1");
        const preferred_date_2 = formData.get("preferred_date_2");
        const preferred_time_2 = formData.get("preferred_time_2");
        const preferred_date_3 = formData.get("preferred_date_3");
        const preferred_time_3 = formData.get("preferred_time_3");

        // We can append these directly to the leads payload if the columns exist,
        // or format them into a notes/JSON field. For now, since the user requested tracking them,
        // we'll attempt to pass them cleanly. 
        if (preferred_date_1) {
            data.preferred_date_1 = preferred_date_1;
            data.preferred_time_1 = preferred_time_1;
        }
        if (preferred_date_2) {
            data.preferred_date_2 = preferred_date_2;
            data.preferred_time_2 = preferred_time_2;
        }
        if (preferred_date_3) {
            data.preferred_date_3 = preferred_date_3;
            data.preferred_time_3 = preferred_time_3;
        }

        const car_id = formData.get("car_id");
        if (car_id && car_id !== "none") {
            data.car_id = car_id;
        }

        // Insert lead 
        const { error } = await supabase.from("leads").insert([data]);

        if (error) {
            console.error("Supabase Error saving lead:", error);
            return { error: "Database error" };
        }

        // TODO: Send Email Notification to Staff here.
        // TODO: Future WhatsApp Integration - Send WhatsApp reminders to staff and client here.

        return { success: true };

    } catch (error) {
        console.error("Server Action Error:", error);
        return { error: "Server action failed" };
    }
}
