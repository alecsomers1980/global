"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { generateVehicleScript, optimizeVehicleDescription, buildFallbackDescription } from "@/utils/ai/scriptGenerator";
import { startCinematicClips, pollCinematicTask } from "@/utils/ai/videoEngineProvider";
import { stitchVideosWithFal } from "@/utils/ai/videoStitchingService";
import { createMuxAssetFromUrl } from "@/utils/ai/muxService";
import { createStreamFromUrl, enableDownloads } from "@/utils/ai/cloudflareStreamService";
import { composeSceneOneImage } from "@/utils/ai/nanoBananaService";
import { revalidatePath } from "next/cache";

// 1. Mark as Pending (Called by VehicleForm on Submit)
export async function queueAiWalkaround(carId) {
    try {
        const supabase = await createAdminClient();
        await supabase.from('cars').update({
            video_url: 'ai_pending'
        }).eq('id', carId);
        revalidatePath("/admin/inventory");
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Fetch next pending car (for queue manager)
export async function getNextPendingAiCarAction() {
    try {
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('video_url', 'ai_pending')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (error || !data) return null;
        return data;

    } catch (e) {
        return null;
    }
}

// 2. Generate Script
export async function generateScriptAction(carId, carPayload) {
    try {
        const supabase = await createAdminClient();
        await supabase.from('cars').update({ video_url: 'ai_processing' }).eq('id', carId);

        console.log('[AI Server Action] Generating visual scene script via Gemini...');
        const scriptArray = await generateVehicleScript(carPayload);

        await supabase.from('cars').update({ video_url: 'ai_rendering_clips' }).eq('id', carId);
        return { success: true, scriptArray };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 3. Start Clips
export async function startVeoClipsAction(scriptArray, carPayload) {
    try {
        console.log('[AI Server Action] Requesting Veo 3.1 Fast clip generation from Kie...');
        const taskIds = await startCinematicClips(scriptArray, carPayload);
        return { success: true, taskIds };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 4. Poll Clips Iteration
export async function pollVeoClipsAction(taskIds) {
    try {
        let allComplete = true;
        const clipUrls = [];

        for (const task of taskIds) {
            const result = await pollCinematicTask(task.taskId);
            if (result.error) {
                return { success: false, error: result.error };
            }
            if (!result.isComplete) {
                allComplete = false;
            } else {
                clipUrls.push({ scene: task.scene, video_url: result.videoUrl });
            }
        }

        if (allComplete) {
            // Sort by scene number to preserve story order
            clipUrls.sort((a, b) => a.scene - b.scene);
            return { success: true, isComplete: true, clipUrls: clipUrls.map(c => c.video_url) };
        } else {
            return { success: true, isComplete: false };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 5. Stitch Video
export async function stitchVideoAction(carId, clipUrls) {
    try {
        const supabase = await createAdminClient();
        await supabase.from('cars').update({ video_url: 'ai_stitching_video' }).eq('id', carId);

        console.log('[AI Server Action] Sending clips to Fal.ai for stitching...');
        const finalStitchedUrl = await stitchVideosWithFal(clipUrls);

        await supabase.from('cars').update({ video_url: 'cf_ingesting' }).eq('id', carId);
        return { success: true, finalStitchedUrl };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 6. Ingest Cloudflare Stream
export async function ingestMuxAction(carId, finalStitchedUrl) {
    try {
        console.log('[AI Server Action] Ingesting final stitched video into Cloudflare Stream...');
        const cfData = await createStreamFromUrl(finalStitchedUrl, { car_id: carId });
        // Enable MP4 downloads for Facebook/Instagram publishing
        try {
            await enableDownloads(cfData.uid);
        } catch (e) {
            console.warn(`[AI Server Action] enableDownloads failed for ${cfData.uid}:`, e.message);
        }

        const supabase = await createAdminClient();
        await supabase.from('cars').update({
            video_url: `cf:${cfData.uid}`
        }).eq('id', carId);

        revalidatePath("/admin/inventory");
        revalidatePath("/inventory");
        return { success: true, cloudflareUid: cfData.uid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 7. Mark Error State (called by browser if pipeline fails)
export async function markVideoErrorAction(carId, errorMessage) {
    try {
        const supabase = await createAdminClient();
        await supabase.from('cars').update({
            video_url: 'error: ' + (errorMessage || 'Unknown processing failure')
        }).eq('id', carId);
        revalidatePath("/admin/inventory");
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

// Check status is no longer heavily needed since the pipeline is awaited entirely in the background,
// but we keep a structural mock that checks the database for UI polling.
export async function checkHeyGenVideoStatus(carId) {
    try {
        const supabase = await createAdminClient();
        const { data } = await supabase.from('cars').select('video_url').eq('id', carId).single();

        if (!data || !data.video_url) return { status: 'failed', error: 'No video requested.' };

        if (data.video_url.startsWith('error: ')) {
            return { status: 'failed', error: data.video_url.replace('error: ', '') };
        }

        if (data.video_url.startsWith('mux:') || data.video_url.startsWith('cf:')) {
            return { status: 'ready', id: data.video_url.split(':')[1] };
        }

        if (data.video_url.startsWith('ai_') || data.video_url === 'mux_ingesting' || data.video_url === 'cf_ingesting') {
            // Let the UI know what specific phase we are in
            return { status: 'processing', phase: data.video_url };
        }

        return { status: 'failed', error: 'Unknown state' };

    } catch (err) {
        return { status: 'error' };
    }
}

// Composite the uploaded scene-1 photo onto the branded background via Nano Banana,
// upload the result to Supabase storage, and return its public URL.
// On any failure, returns the original URL so the listing still ships.
export async function composeSceneOneAction(originalCarImageUrl) {
    if (!originalCarImageUrl) {
        return { success: false, error: "No source image URL provided", url: null };
    }

    try {
        console.log("[Scene 1 Compose] Starting Nano Banana composite...");
        const { base64, mimeType } = await composeSceneOneImage(originalCarImageUrl);
        const buffer = Buffer.from(base64, "base64");

        const supabase = await createAdminClient();
        const ext = (mimeType.split("/")[1] || "png").split(";")[0];
        const fileName = `vehicles/scene1-composed-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("vehicles")
            .upload(fileName, buffer, { contentType: mimeType });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("vehicles").getPublicUrl(fileName);
        console.log("[Scene 1 Compose] Composited image stored:", data.publicUrl);
        return { success: true, url: data.publicUrl };
    } catch (err) {
        console.error("[Scene 1 Compose] Failed — falling back to original image:", err.message);
        return { success: false, error: err.message, url: originalCarImageUrl };
    }
}

export async function optimizeDescriptionAction(carPayload, manualDescription) {
    console.log("=========================================");
    console.log("[SERVER ACTION HIT] optimizeDescriptionAction invoked!");
    console.log("PAYLOAD RECEIVED:", JSON.stringify(carPayload).substring(0, 150) + "...");
    console.log("=========================================");
    try {
        const result = await optimizeVehicleDescription(carPayload, manualDescription);
        console.log("[SERVER ACTION] optimizeVehicleDescription returned successfully.");
        // Defensive: if both AI providers + the fallback somehow returned empty, still
        // give the listing a non-null description so the field never saves as null.
        if (!result || !String(result).trim()) {
            return buildFallbackDescription(carPayload, manualDescription);
        }
        return result;
    } catch (e) {
        console.error("Failed to optimize description in Server Action — using template fallback:", e);
        return buildFallbackDescription(carPayload, manualDescription);
    }
}
