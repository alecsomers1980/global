"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
    startSeedanceClip,
    pollSeedanceClip,
    SEEDANCE_STYLE_PROMPTS,
} from "@/utils/ai/seedanceService";
import { buildSeedancePrompt } from "@/utils/ai/seedanceService";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    if (!profile || profile.role !== "admin") throw new Error("Admins only");
    return { user };
}

/**
 * Generate a handover video from an uploaded photo WITHOUT creating a sale
 * record — purely for previewing/iterating on the Seedance styles (e.g. the
 * "Pixel Build" car-assembles-next-to-the-person look). Uses the exact same
 * generation parameters as the real post-sale video. Each run costs Kie credits
 * (one 8s Seedance clip), so it's a real generation, just sale-less.
 */
export async function startTestHandoverVideo(formData) {
    await requireAdmin();
    const admin = await createAdminClient();

    const styleKey = formData.get("style");
    const buyerName = formData.get("buyer_name") || "friend";
    const file = formData.get("image");

    if (!SEEDANCE_STYLE_PROMPTS[styleKey]) return { error: "Invalid video style." };
    if (!file || typeof file !== "object" || file.size === 0) {
        return { error: "Please choose a photo to test with." };
    }

    // Upload the test image to the public delivery-photos bucket so Kie can fetch it.
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
    const fileName = `test/${Date.now()}.${ext}`;
    const { error: upErr } = await admin.storage
        .from("delivery-photos")
        .upload(fileName, file, { contentType: file.type || "image/jpeg", upsert: true });
    if (upErr) return { error: `Image upload failed: ${upErr.message}` };
    const { data: urlData } = admin.storage.from("delivery-photos").getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    try {
        const prompt = buildSeedancePrompt(styleKey, { buyerName });
        const { taskId } = await startSeedanceClip({
            imageUrl,
            prompt,
            durationSeconds: 8,
            aspectRatio: "16:9",
            resolution: "720p",
            generateAudio: true,
        });
        return { success: true, taskId, imageUrl };
    } catch (err) {
        return { error: err.message || "Failed to start generation." };
    }
}

export async function pollTestHandoverVideo(taskId) {
    await requireAdmin();
    if (!taskId) return { status: "none" };
    const result = await pollSeedanceClip(taskId);
    if (result.error) return { status: "failed", error: result.error };
    if (result.isComplete && result.videoUrl) return { status: "ready", videoUrl: result.videoUrl };
    return { status: "pending" };
}
