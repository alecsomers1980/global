"use server";

// NOTE: maxDuration cannot be exported from a "use server" module (Next.js
// requires every export to be an async function). The timeout for these
// Server Actions is configured on the admin layout instead:
// src/app/admin/layout.js → export const maxDuration = 300.

import { createAdminClient } from "@/utils/supabase/server";
import { generateVehicleScript, optimizeVehicleDescription, buildFallbackDescription } from "@/utils/ai/scriptGenerator";
import * as veoEngine from "@/utils/ai/videoEngineProvider";
import * as seedanceEngine from "@/utils/ai/seedanceVideoEngine";
import { synthesizeVoiceover } from "@/utils/ai/elevenLabsService";
import { muxAudioOntoVideo } from "@/utils/ai/videoAudioMuxer";
import { stitchVideosWithFal } from "@/utils/ai/videoStitchingService";
import { createMuxAssetFromUrl } from "@/utils/ai/muxService";
import { createStreamFromUrl, enableDownloads } from "@/utils/ai/cloudflareStreamService";
import { composeSceneOneImage } from "@/utils/ai/nanoBananaService";
import { revalidatePath } from "next/cache";

// Pipeline selector. "seedance" = new Seedance 2 Pro (silent) + ElevenLabs SA
// voice + Fal mux. "veo" = legacy Veo 3.1 Fast with native audio. Default to
// seedance; set VIDEO_ENGINE=veo in env to revert to backup without a deploy.
function getEngine() {
    const choice = (process.env.VIDEO_ENGINE || 'seedance').toLowerCase();
    return choice === 'veo' ? veoEngine : seedanceEngine;
}

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

// 3a. Pre-flight image URLs and return the 4 scene images. Runs the
// HEAD/GET checks server-side so a broken image bucket never causes a
// Kie.ai charge.
export async function preflightSceneImagesAction(carPayload) {
    try {
        const engine = getEngine();
        const sceneImages = await engine.preflightAndGetSceneImages(carPayload);
        return { success: true, sceneImages };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 3b. Start ONE scene's video clip on whichever engine is active.
// Designed to be called sequentially from the client — start scene 1,
// poll till done, then start scene 2. Caps a failure cost at one scene's
// worth of spend instead of all four.
export async function startSingleClipAction(scene, baseImageUrl) {
    try {
        const engine = getEngine();
        const task = await engine.startSingleClip(scene, baseImageUrl);
        return { success: true, task };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// 4. Poll a single video task by id. Returns { isComplete, videoUrl } when
// done, { isComplete: false } while still processing, or { error } if the
// engine marked it failed.
//
// For the Seedance pipeline, once the silent clip is ready we ALSO
// generate the ElevenLabs voiceover and mux it onto the video inside this
// action — so the URL returned is already a sounded mp4 ready for
// stitching. Callers pass `voiceoverText`, `carId`, and `sceneNum` so the
// per-scene audio is generated against the right line and stored under a
// debuggable filename. These extra args are ignored by the Veo backup path.
export async function pollSingleClipAction(taskId, voiceoverText = null, carId = null, sceneNum = null) {
    try {
        const engine = getEngine();
        const result = await engine.pollCinematicTask(taskId);
        if (result.error) {
            return { success: false, error: result.error };
        }
        if (!result.isComplete || !result.videoUrl) {
            return { success: true, isComplete: false, videoUrl: null };
        }

        const usingSeedance = (process.env.VIDEO_ENGINE || 'seedance').toLowerCase() !== 'veo';

        // Veo path: native audio is baked in — return the URL as-is.
        if (!usingSeedance) {
            return { success: true, isComplete: true, videoUrl: result.videoUrl };
        }

        // Seedance path: clip is silent. Generate ElevenLabs voiceover and
        // mux it onto the video before handing the URL to the stitcher.
        // If voiceoverText is missing, skip muxing and return the silent
        // clip (Veo backup behaviour) so the pipeline still completes
        // rather than throwing — UI will show a sounded car video with
        // one silent scene if this happens, which is recoverable.
        if (!voiceoverText || !String(voiceoverText).trim()) {
            console.warn(`[poll] Scene ${sceneNum ?? '?'} completed but no voiceover_text supplied — returning silent clip.`);
            return { success: true, isComplete: true, videoUrl: result.videoUrl };
        }

        const { audioUrl, durationMs: actualAudioMs } = await synthesizeVoiceover({
            text: voiceoverText,
            carId,
            sceneNum,
        });

        // The synthesized mp3 includes ~2.5s of trailing silence (SSML break),
        // so it's reliably 6.5-7.5s long. Declaring audio.duration = clip
        // length makes Fal compose truncate the trailing silence at exactly
        // 7s rather than pad a gap with the held last voice sample.
        const VIDEO_MS = 7000;
        const muxedUrl = await muxAudioOntoVideo({
            videoUrl: result.videoUrl,
            audioUrl,
            videoDurationMs: VIDEO_MS,
            audioDurationMs: VIDEO_MS,
        });
        if (actualAudioMs && actualAudioMs < VIDEO_MS) {
            console.warn(`[poll] Scene ${sceneNum ?? '?'} mp3 was only ${actualAudioMs}ms (< ${VIDEO_MS}ms clip). SSML break may not have applied — voice may sound stuck at the end.`);
        }

        return { success: true, isComplete: true, videoUrl: muxedUrl };
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
        await enableDownloads(cfData.uid);

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
