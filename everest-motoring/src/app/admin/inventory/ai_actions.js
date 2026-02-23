"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { generateVehicleScript, optimizeVehicleDescription } from "@/utils/ai/scriptGenerator";
import { generateCinematicClips } from "@/utils/ai/videoEngineProvider";
import { stitchVideosWithFal } from "@/utils/ai/videoStitchingService";
import { createMuxAssetFromUrl } from "@/utils/ai/muxService";
import { revalidatePath } from "next/cache";

export async function triggerAiWalkaround(carId, carPayload) {
    console.log(`[AI Cinematic Pipeline] Starting background job for Car ID: ${carId}`);

    try {
        const supabase = await createAdminClient();

        // 1. Mark as processing in DB immediately
        await supabase.from('cars').update({
            video_url: 'ai_processing'
        }).eq('id', carId);

        // 2. Fire the background pipeline WITHOUT awaiting it
        // This prevents the Next.js Server Action from blocking the UI for 3 minutes
        processCinematicPipeline(carId, carPayload).catch(console.error);

        revalidatePath("/admin/inventory");
        return { success: true };

    } catch (error) {
        console.error("[AI Cinematic Pipeline] Trigger Error:", error);
        return { success: false, error: error.message };
    }
}

// Background Task: Runs independently
async function processCinematicPipeline(carId, carPayload) {
    try {
        const supabase = await createAdminClient();

        // 2. The Creative Director (Gemini) writes the visual prompts
        console.log('[AI Cinematic Pipeline] Generating visual scene script via Gemini...');
        const scriptArray = await generateVehicleScript(carPayload);
        console.log(`[AI Cinematic Pipeline] Scene Planner Complete. ${scriptArray.length} scenes generated.`);

        // 3. The Video Engine (Kie.ai -> Veo 3.1) generates 3 parallel clips
        console.log('[AI Cinematic Pipeline] Requesting Veo 3.1 Fast clip generation from Kie...');
        await supabase.from('cars').update({ video_url: 'ai_rendering_clips' }).eq('id', carId);

        // This will take approx 1-3 minutes for all 3 clips to generate
        const clipResults = await generateCinematicClips(scriptArray, carPayload);
        const clipUrls = clipResults.map(clip => clip.video_url);
        console.log(`[AI Cinematic Pipeline] Clip Generation Complete:`, clipUrls);

        // 4. The Stitcher (Fal.ai) concatenates the 3 videos into 1 seamless video
        console.log('[AI Cinematic Pipeline] Sending clips to Fal.ai for stitching...');
        await supabase.from('cars').update({ video_url: 'ai_stitching_video' }).eq('id', carId);

        const finalStitchedUrl = await stitchVideosWithFal(clipUrls);
        console.log(`[AI Cinematic Pipeline] Stitching Complete: ${finalStitchedUrl}`);

        // 5. Mux Ingestion (Store locally for fast streaming)
        console.log('[AI Cinematic Pipeline] Ingesting final stitched video into Mux...');
        await supabase.from('cars').update({ video_url: 'mux_ingesting' }).eq('id', carId);

        const muxData = await createMuxAssetFromUrl(finalStitchedUrl, carId);
        console.log(`[AI Cinematic Pipeline] Mux Asset Created. Playback ID: ${muxData.playbackId}`);

        // 6. Update Database with final playback link
        await supabase.from('cars').update({
            video_url: `mux:${muxData.playbackId}`
        }).eq('id', carId);

        console.log(`[AI Cinematic Pipeline] Pipeline 100% Complete!`);
    } catch (error) {
        console.error("[AI Cinematic Pipeline] Background Fatal Error:", error);

        // Revert status on failure so it doesn't get stuck
        const supabase = await createAdminClient();
        await supabase.from('cars').update({
            video_url: null
        }).eq('id', carId);
    }
}

// Check status is no longer heavily needed since the pipeline is awaited entirely in the background,
// but we keep a structural mock that checks the database for UI polling.
export async function checkHeyGenVideoStatus(carId) {
    try {
        const supabase = await createAdminClient();
        const { data } = await supabase.from('cars').select('video_url').eq('id', carId).single();

        if (!data || !data.video_url) return { status: 'failed' };

        if (data.video_url.startsWith('mux:')) {
            return { status: 'ready', playbackId: data.video_url.split(':')[1] };
        }

        if (data.video_url.startsWith('ai_') || data.video_url === 'mux_ingesting') {
            // Let the UI know what specific phase we are in
            return { status: 'processing', phase: data.video_url };
        }

        return { status: 'failed' };

    } catch (err) {
        return { status: 'error' };
    }
}

export async function optimizeDescriptionAction(carPayload, manualDescription) {
    try {
        return await optimizeVehicleDescription(carPayload, manualDescription);
    } catch (e) {
        console.error("Failed to optimize description:", e);
        return manualDescription;
    }
}
