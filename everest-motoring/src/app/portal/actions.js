"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadClientDocument(formData) {
    const file = formData.get("file");
    const documentType = formData.get("documentType");
    const leadId = formData.get("leadId");

    if (!file || file.size === 0) {
        return { error: "No file was provided." };
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Unauthorized" };

        // Ensure we strictly enforce the RLS policy: The file MUST go into a folder named after the user.id
        const fileExt = file.name.split('.').pop();
        const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${user.id}/${safeFileName}`;

        // 1. Upload to Supabase Storage Bucket 'finance_documents'
        const { error: uploadError } = await supabase.storage
            .from('finance_documents')
            .upload(storagePath, file);

        if (uploadError) {
            console.error("Storage upload failed:", uploadError);
            return { error: "Failed to securely save the file to the vault." };
        }

        // 2. Insert record into lead_documents to track status
        const { error: dbError } = await supabase
            .from('lead_documents')
            .insert({
                lead_id: leadId,
                client_id: user.id,
                document_type: documentType,
                file_path: storagePath,
                status: 'uploaded'
            });

        if (dbError) {
            console.error("Database tracking failed:", dbError);
            return { error: "File uploaded, but failed to log status." };
        }

        revalidatePath("/portal");
        return { success: true };

    } catch (e) {
        console.error("Server Action Exception:", e);
        return { error: "An unexpected error occurred during upload." };
    }
}
