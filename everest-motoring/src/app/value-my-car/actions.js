"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitValueMyCar(formData) {
    try {
        const supabase = await createClient();

        const registration_number = formData.get("registration_number");
        const mileage = formData.get("mileage");
        const make_model = formData.get("make_model");
        const year = formData.get("year");
        const client_name = formData.get("client_name");
        const client_phone = formData.get("client_phone");

        if (!registration_number || !mileage || !make_model || !year || !client_name || !client_phone) {
            return { error: "Missing required fields" };
        }

        const newRequest = {
            registration_number,
            mileage: parseInt(mileage.replace(/\D/g, '')), // Strips non-numeric chars
            make_model,
            year,
            client_name,
            client_phone,
            status: "pending_valuation"
        };

        const { error } = await supabase.from("value_my_car_requests").insert([newRequest]);

        if (error) {
            console.error("Supabase Error saving valuation request:", error);
            return { error: "Database error" };
        }

        return { success: true };

    } catch (error) {
        console.error("Server Action Error:", error);
        return { error: "Server action failed" };
    }
}
