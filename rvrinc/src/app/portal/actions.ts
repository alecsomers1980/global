"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSignedUrl(filePath: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .storage
        .from("case-documents")
        .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

    if (error) {
        console.error("Error creating signed URL:", error);
        return { error: error.message };
    }

    return { signedUrl: data.signedUrl };
}
