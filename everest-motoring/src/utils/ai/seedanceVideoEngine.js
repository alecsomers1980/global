/**
 * Seedance 2 Fast image-to-video wrapper for the 4-scene car walkaround.
 * Generates SILENT 720p 16:9 clips — audio is added downstream via
 * ElevenLabs TTS + Fal FFmpeg mux. 7s clips chosen for cost/pacing
 * balance: ~$4.94/car total, with ~1.5–2s of natural trailing silence per
 * scene (after the ~4–5s voiceover). Seedance bills the full clip
 * duration whether it contains voice or silence, so trimming the silent
 * tail is the highest-leverage cost knob.
 *
 * The older Veo-based engine in videoEngineProvider.js is kept as a backup
 * (toggle via VIDEO_ENGINE env var in ai_actions.js).
 */

import { startSeedanceClip, pollSeedanceClip } from './seedanceService';
import { preflightAndGetSceneImages as preflightVeo } from './videoEngineProvider';

const SEEDANCE_MODEL = 'bytedance/seedance-2-fast';
const SEEDANCE_RESOLUTION = '720p';
const SEEDANCE_DURATION_SECONDS = 7;

// Reuse the Veo engine's preflight — the image-URL validation logic is
// identical regardless of which video engine consumes them.
export const preflightAndGetSceneImages = preflightVeo;

// Strip the "AUDIO: ..." section from a Veo-style visual_prompt so we
// don't waste Seedance prompt budget on instructions that don't apply
// to a silent clip. The voiceover is generated separately via ElevenLabs.
function stripAudioBlock(visualPrompt) {
    if (!visualPrompt || typeof visualPrompt !== 'string') return visualPrompt;
    const audioIdx = visualPrompt.indexOf('AUDIO:');
    if (audioIdx === -1) return visualPrompt.trim();
    return visualPrompt.slice(0, audioIdx).trim();
}

/**
 * Submit one scene to Seedance and return its taskId.
 *
 * Mirrors the shape of videoEngineProvider.startSingleClip so the queue
 * manager (VideoRenderManager.jsx) can be agnostic about which engine
 * is in use.
 */
export async function startSingleClip(scene, baseImageUrl) {
    const sceneNum = scene.scene;
    const silentPrompt = stripAudioBlock(scene.visual_prompt);

    console.log(`[Seedance Engine] Submitting Scene ${sceneNum} (silent, ${SEEDANCE_MODEL}). Image: ${baseImageUrl}`);

    const { taskId } = await startSeedanceClip({
        imageUrl: baseImageUrl,
        prompt: silentPrompt,
        durationSeconds: SEEDANCE_DURATION_SECONDS,
        aspectRatio: '16:9',
        resolution: SEEDANCE_RESOLUTION,
        generateAudio: false,
        model: SEEDANCE_MODEL,
    });

    return { scene: sceneNum, taskId };
}

/**
 * Poll a Seedance task by id. Returns the same shape as the Veo poll
 * so callers don't need to branch: { isComplete, videoUrl } on success,
 * { isComplete: false } while pending, { isComplete: false, error } on
 * terminal failure.
 */
export async function pollCinematicTask(taskId) {
    return pollSeedanceClip(taskId);
}
