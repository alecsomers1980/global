/**
 * Per-scene audio-mux: takes a silent video clip (from Seedance 2 Pro) and
 * an mp3 voiceover (from ElevenLabs) and returns a single muxed mp4 URL.
 *
 * Uses Fal's hosted FFmpeg `compose` endpoint so we don't need to bundle
 * an ffmpeg binary into the Next.js serverless function. The pattern
 * mirrors videoStitchingService.js which already calls fal-ai/ffmpeg-api.
 */

const FAL_COMPOSE_URL = 'https://fal.run/fal-ai/ffmpeg-api/compose';

/**
 * Mux a silent video URL with an audio URL.
 *
 * @param {Object} args
 * @param {string} args.videoUrl   Silent mp4/webm produced by Seedance.
 * @param {string} args.audioUrl   mp3 produced by ElevenLabs (in Supabase storage).
 * @param {number} [args.videoDurationMs=10000]  Total clip duration (Seedance scenes are 10s).
 * @param {number} [args.audioDurationMs]  Actual mp3 length. If omitted, falls back to
 *                                          videoDurationMs — which causes Fal to pad/loop
 *                                          the audio tail when the mp3 is shorter than the
 *                                          clip, producing a "stuck" voiceover at the end.
 *                                          Always pass the real mp3 duration when available.
 * @returns {Promise<string>} Public URL of the muxed mp4 (Fal-hosted; valid for stitching).
 */
export async function muxAudioOntoVideo({ videoUrl, audioUrl, videoDurationMs = 10000, audioDurationMs }) {
    if (!process.env.FAL_KEY) {
        throw new Error('Missing FAL_KEY env var (required for ffmpeg-api/compose).');
    }
    if (!videoUrl) throw new Error('muxAudioOntoVideo: videoUrl is required.');
    if (!audioUrl) throw new Error('muxAudioOntoVideo: audioUrl is required.');

    // Audio keyframe deliberately has NO `duration` field. Past experiments
    // showed that declaring an explicit audio duration — even when it matches
    // the mp3's actual length within ~100ms — caused Fal compose to pad or
    // hold the final sample to fill the declared window exactly, producing a
    // "voice sounds stuck at the end" artefact. Omitting the field lets the
    // audio play to its natural end; the video track's `duration` defines the
    // total clip length so the tail beyond the voiceover is natural silence.
    const requestBody = {
        tracks: [
            {
                id: '1',
                type: 'video',
                keyframes: [
                    { url: videoUrl, timestamp: 0, duration: videoDurationMs },
                ],
            },
            {
                id: '2',
                type: 'audio',
                keyframes: [
                    { url: audioUrl, timestamp: 0 },
                ],
            },
        ],
    };

    const audioMsLog = audioDurationMs && audioDurationMs > 0 ? `${audioDurationMs}ms` : 'natural';
    console.log(`[Audio Mux] Composing scene: video=${videoUrl.slice(-60)} (${videoDurationMs}ms) + audio=${audioUrl.slice(-60)} (${audioMsLog})`);

    const response = await fetch(FAL_COMPOSE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${process.env.FAL_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`Fal ffmpeg-api/compose failed: HTTP ${response.status} ${errText.slice(0, 300)}`);
    }

    const data = await response.json();

    // Fal's compose endpoint historically returns either { video_url: "..." }
    // or { video: { url: "..." } } depending on the version. Handle both.
    const muxedUrl = data?.video_url || data?.video?.url || data?.output?.video_url;
    if (!muxedUrl) {
        throw new Error(`Fal ffmpeg-api/compose returned no video URL. Payload: ${JSON.stringify(data).slice(0, 300)}`);
    }

    console.log(`[Audio Mux] Muxed clip ready: ${muxedUrl}`);
    return muxedUrl;
}
