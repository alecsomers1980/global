"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitValueMyCar(formData) {
    try {
        const supabase = await createClient();

        // 1. Vehicle Details
        const category = formData.get("category");
        const make = formData.get("make");
        const model = formData.get("model");
        const year = formData.get("year");
        const fuel_type = formData.get("fuel_type");
        const transmission = formData.get("transmission");
        const condition = formData.get("condition");
        const additional_notes = formData.get("additional_notes");

        // 2. Client Details
        const client_name = formData.get("client_name");
        const client_email = formData.get("client_email");
        const client_phone = formData.get("client_phone");
        const client_province = formData.get("client_province");
        const client_suburb = formData.get("client_suburb");

        if (!make || !model || !year || !fuel_type || !transmission || !condition || !client_name || !client_email || !client_phone) {
            return { error: "Missing required fields" };
        }

        // 3. Handle File Uploads
        const fileKeys = ["image_front", "image_left", "image_right", "image_back", "image_roof"];
        const imageUrls = {
            image_front: null,
            image_left: null,
            image_right: null,
            image_back: null,
            image_roof: null
        };

        for (const key of fileKeys) {
            const file = formData.get(key);
            if (file && file.size > 0) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `requests/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('valuations')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Storage upload error for", key, uploadError);
                    return { error: `Failed to upload ${key}` };
                }

                const { data: publicUrlData } = supabase.storage
                    .from('valuations')
                    .getPublicUrl(filePath);

                imageUrls[key] = publicUrlData.publicUrl;
            }
        }

        const newRequest = {
            category,
            make,
            model,
            year,
            fuel_type,
            transmission,
            condition,
            additional_notes,
            client_name,
            client_email,
            client_phone,
            client_province,
            client_suburb,
            image_front: imageUrls.image_front,
            image_left: imageUrls.image_left,
            image_right: imageUrls.image_right,
            image_back: imageUrls.image_back,
            image_roof: imageUrls.image_roof,
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
