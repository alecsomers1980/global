/**
 * Cron-driven AI walkaround pipeline state machine.
 *
 * Vercel Cron hits this every minute. Each invocation picks up the OLDEST
 * car still in an `ai_*` / `cf_ingesting` state and advances it by EXACTLY
 * ONE phase boundary, then exits. Over multiple ticks the car progresses
 * to completion without any dependency on a browser tab staying open.
 *
 * Phases (tracked by cars.video_url):
 *   ai_pending        -> generate script + preflight images
 *   ai_rendering_clips -> per-scene render / poll / TTS+mux loop
 *   ai_stitching_video -> stitch the 4 muxed clips with Fal
 *   cf_ingesting      -> Cloudflare Stream copy + enableDownloads
 *   cf:<uid>          -> terminal: done
 *   error: <msg>      -> terminal: failed
 *
 * Per-tick progress state lives in cars.ai_pipeline_state (JSONB):
 *   { script, images, scenes:[{scene,task_id?,muxed_url?}], stitched_url? }
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/server";
import { generateVehicleScript } from "@/utils/ai/scriptGenerator";
import * as veoEngine from "@/utils/ai/videoEngineProvider";
import * as seedanceEngine from "@/utils/ai/seedanceVideoEngine";
import { synthesizeVoiceover } from "@/utils/ai/elevenLabsService";
import { muxAudioOntoVideo } from "@/utils/ai/videoAudioMuxer";
import { stitchVideosWithFal } from "@/utils/ai/videoStitchingService";
import { createStreamFromUrl, enableDownloads } from "@/utils/ai/cloudflareStreamService";

export const runtime = "nodejs";
export const maxDuration = 300;

const CLIP_DURATION_MS = 8000;
const TOTAL_SCENES = 4;
const IN_PROGRESS_STATES = [
    "ai_pending",
    "ai_processing",
    "ai_rendering_clips",
    "ai_stitching_video",
    "cf_ingesting",
];

function getEngine() {
    const choice = (process.env.VIDEO_ENGINE || "seedance").toLowerCase();
    return choice === "veo" ? veoEngine : seedanceEngine;
}

function isAuthorized(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        // Allow local dev without the secret. Production requires it.
        return process.env.NODE_ENV !== "production";
    }
    const authHeader = request.headers.get("authorization") || "";
    return authHeader === `Bearer ${cronSecret}`;
}

async function pickNextCar(admin) {
    const { data, error } = await admin
        .from("cars")
        .select("*")
        .in("video_url", IN_PROGRESS_STATES)
        .order("created_at", { ascending: true })
        .limit(1);
    if (error) throw new Error(`pickNextCar: ${error.message}`);
    return data && data.length > 0 ? data[0] : null;
}

async function updateCar(admin, carId, patch) {
    const { error } = await admin.from("cars").update(patch).eq("id", carId);
    if (error) throw new Error(`updateCar: ${error.message}`);
}

export async function GET(request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let admin;
    try {
        admin = await createAdminClient();
    } catch (e) {
        return NextResponse.json({ error: `Supabase client failed: ${e.message}` }, { status: 500 });
    }

    const car = await pickNextCar(admin).catch((e) => ({ __error: e }));
    if (car && car.__error) {
        return NextResponse.json({ error: car.__error.message }, { status: 500 });
    }
    if (!car) {
        return NextResponse.json({ idle: true, advanced: null });
    }

    const carLabel = `${car.year || "?"} ${car.make || "?"} ${car.model || "?"}`.trim();
    const logPrefix = `[Cron Pipeline] ${car.id} (${carLabel}) phase=${car.video_url}:`;

    try {
        if (car.video_url === "ai_pending") {
            // Phase 1: script + preflight. Mark intermediate state first so a
            // concurrent tick can't double-enter.
            await updateCar(admin, car.id, { video_url: "ai_processing" });
            console.log(`${logPrefix} starting script + preflight`);

            const script = await generateVehicleScript(car);
            if (!Array.isArray(script) || script.length !== TOTAL_SCENES) {
                throw new Error(`generateVehicleScript returned ${Array.isArray(script) ? script.length : "non-array"} scenes; expected ${TOTAL_SCENES}.`);
            }

            const engine = getEngine();
            const images = await engine.preflightAndGetSceneImages(car);
            if (!Array.isArray(images) || images.length !== TOTAL_SCENES) {
                throw new Error(`preflightAndGetSceneImages returned ${Array.isArray(images) ? images.length : "non-array"} images; expected ${TOTAL_SCENES}.`);
            }

            const pipelineState = {
                script,
                images,
                scenes: [{ scene: 1 }],
            };
            await updateCar(admin, car.id, {
                video_url: "ai_rendering_clips",
                ai_pipeline_state: pipelineState,
            });
            console.log(`${logPrefix} -> ai_rendering_clips, scene 1 queued`);
            return NextResponse.json({
                advanced: car.id,
                phase: "ai_rendering_clips",
                started_scene: 1,
            });
        }

        if (car.video_url === "ai_processing") {
            // Brief intermediate between ai_pending and ai_rendering_clips. If a
            // tick re-enters here it means the previous tick is still running
            // phase 1 (or crashed mid-update). Skip so we don't double-process;
            // if the previous tick truly died, the next tick will see this and
            // we'll eventually transition forward when it completes — or a
            // human can reset the car via the inspect script.
            console.log(`${logPrefix} skipping in-flight intermediate`);
            return NextResponse.json({
                advanced: car.id,
                phase: "ai_processing",
                skipped: "in-flight intermediate",
            });
        }

        if (car.video_url === "ai_rendering_clips") {
            const state = car.ai_pipeline_state;
            if (!state || !Array.isArray(state.script) || !Array.isArray(state.images) || !Array.isArray(state.scenes) || state.scenes.length === 0) {
                throw new Error("Missing or malformed ai_pipeline_state on ai_rendering_clips car.");
            }

            const idx = state.scenes.length - 1;
            const current = state.scenes[idx];
            const sceneNum = current.scene;
            const scriptForScene = state.script[sceneNum - 1];
            const imageForScene = state.images[sceneNum - 1];

            if (!scriptForScene || !imageForScene) {
                throw new Error(`Pipeline state inconsistent: missing script or image for scene ${sceneNum}.`);
            }

            const engine = getEngine();

            if (!current.task_id) {
                // Sub-phase 2a: start the Seedance/Veo task.
                console.log(`${logPrefix} starting scene ${sceneNum}`);
                const { taskId } = await engine.startSingleClip(scriptForScene, imageForScene);
                current.task_id = taskId;
                await updateCar(admin, car.id, { ai_pipeline_state: state });
                console.log(`${logPrefix} scene ${sceneNum} taskId=${taskId}`);
                return NextResponse.json({
                    advanced: car.id,
                    started_scene: sceneNum,
                    task_id: taskId,
                });
            }

            if (!current.muxed_url) {
                // Sub-phase 2b: poll once. If still pending, exit and wait for
                // the next cron tick. If complete, do TTS + mux and advance.
                const poll = await engine.pollCinematicTask(current.task_id);
                if (poll && poll.error) {
                    throw new Error(`Scene ${sceneNum}: ${poll.error}`);
                }
                if (!poll || !poll.isComplete || !poll.videoUrl) {
                    console.log(`${logPrefix} polling scene ${sceneNum} (task ${current.task_id}) — still pending`);
                    return NextResponse.json({
                        advanced: car.id,
                        polling_scene: sceneNum,
                        pending: true,
                    });
                }

                console.log(`${logPrefix} scene ${sceneNum} ready, running TTS + mux`);
                const voiceoverText = scriptForScene.voiceover_text;
                const { audioUrl, durationMs: audioDurationMs } = await synthesizeVoiceover({
                    text: voiceoverText,
                    carId: car.id,
                    sceneNum,
                });
                const muxedUrl = await muxAudioOntoVideo({
                    videoUrl: poll.videoUrl,
                    audioUrl,
                    videoDurationMs: CLIP_DURATION_MS,
                    audioDurationMs,
                });
                current.muxed_url = muxedUrl;

                if (sceneNum < TOTAL_SCENES) {
                    state.scenes.push({ scene: sceneNum + 1 });
                    await updateCar(admin, car.id, { ai_pipeline_state: state });
                    console.log(`${logPrefix} scene ${sceneNum} muxed, queued scene ${sceneNum + 1}`);
                    return NextResponse.json({
                        advanced: car.id,
                        muxed_scene: sceneNum,
                        next_scene: sceneNum + 1,
                    });
                }

                // All 4 muxed — advance to stitch phase.
                await updateCar(admin, car.id, {
                    video_url: "ai_stitching_video",
                    ai_pipeline_state: state,
                });
                console.log(`${logPrefix} all scenes muxed -> ai_stitching_video`);
                return NextResponse.json({
                    advanced: car.id,
                    muxed_scene: sceneNum,
                    phase: "ai_stitching_video",
                });
            }

            // Defensive: current scene fully muxed but we never advanced. Push
            // the next scene placeholder so we don't stall here.
            if (sceneNum < TOTAL_SCENES) {
                state.scenes.push({ scene: sceneNum + 1 });
                await updateCar(admin, car.id, { ai_pipeline_state: state });
                console.log(`${logPrefix} defensive advance after stale muxed scene ${sceneNum}`);
                return NextResponse.json({
                    advanced: car.id,
                    defensive_advance_from: sceneNum,
                });
            }
            await updateCar(admin, car.id, {
                video_url: "ai_stitching_video",
                ai_pipeline_state: state,
            });
            return NextResponse.json({ advanced: car.id, phase: "ai_stitching_video" });
        }

        if (car.video_url === "ai_stitching_video") {
            const state = car.ai_pipeline_state;
            if (!state || !Array.isArray(state.scenes) || state.scenes.length !== TOTAL_SCENES) {
                throw new Error("Cannot stitch — pipeline state missing or has wrong number of scenes.");
            }
            const clipUrls = state.scenes.map((s) => s.muxed_url);
            if (clipUrls.some((u) => !u)) {
                throw new Error("Cannot stitch — at least one scene has no muxed clip URL.");
            }
            console.log(`${logPrefix} stitching ${clipUrls.length} clips`);
            const stitchedUrl = await stitchVideosWithFal(clipUrls);
            state.stitched_url = stitchedUrl;
            await updateCar(admin, car.id, {
                video_url: "cf_ingesting",
                ai_pipeline_state: state,
            });
            console.log(`${logPrefix} stitched -> cf_ingesting`);
            return NextResponse.json({
                advanced: car.id,
                stitched: true,
                phase: "cf_ingesting",
            });
        }

        if (car.video_url === "cf_ingesting") {
            const state = car.ai_pipeline_state;
            if (!state || !state.stitched_url) {
                throw new Error("Cannot ingest — pipeline state missing stitched URL.");
            }
            console.log(`${logPrefix} ingesting ${state.stitched_url} to Cloudflare Stream`);
            const cfData = await createStreamFromUrl(state.stitched_url, { car_id: car.id });
            await enableDownloads(cfData.uid);
            await updateCar(admin, car.id, {
                video_url: `cf:${cfData.uid}`,
                ai_pipeline_state: null,
            });
            revalidatePath("/admin/inventory");
            revalidatePath("/inventory");
            console.log(`${logPrefix} complete -> cf:${cfData.uid}`);
            return NextResponse.json({
                advanced: car.id,
                completed: true,
                cf_uid: cfData.uid,
            });
        }

        // Unrecognised in-progress state — shouldn't reach here given the
        // IN_PROGRESS_STATES filter, but bail safely.
        console.warn(`${logPrefix} unrecognised in-progress state`);
        return NextResponse.json({
            advanced: car.id,
            phase: car.video_url,
            skipped: "unrecognised state",
        });
    } catch (err) {
        const rawMsg = (err && err.message) || String(err);
        const errorMsg = rawMsg.length > 240 ? rawMsg.slice(0, 237) + "..." : rawMsg;
        console.error(`${logPrefix} FAILED: ${errorMsg}`);
        try {
            await updateCar(admin, car.id, {
                video_url: `error: ${errorMsg}`,
                ai_pipeline_state: null,
            });
            revalidatePath("/admin/inventory");
        } catch (writeErr) {
            console.error(`${logPrefix} could not record error to DB: ${writeErr.message}`);
        }
        return NextResponse.json({
            advanced: car.id,
            errored: true,
            error: errorMsg,
        }, { status: 200 });
    }
}
