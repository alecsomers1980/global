/**
 * ElevenLabs TTS wrapper for the Seedance walkaround voiceover.
 *
 * Generates a single voiceover line per scene using a fixed voice_id
 * (the same one for every scene of every car), guaranteeing deterministic
 * voice consistency across all 4 clips — the core reason we decoupled
 * voice from the video model.
 *
 * The resulting mp3 is uploaded to Supabase storage so it can be fetched
 * by the Fal FFmpeg compose endpoint during the audio-mux step.
 */

import { createAdminClient } from '@/utils/supabase/server';

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

// `eleven_multilingual_v2` is the safest choice for South African English
// — it preserves the trained accent of the locked voice (whether you use a
// stock SA voice or a Professional Voice Clone) and is supported on every
// paid tier including Starter.
const DEFAULT_MODEL = 'eleven_multilingual_v2';

// Voice tuning. Higher stability keeps the accent and cadence locked across
// scenes (important — we don't want a more "expressive" read in scene 2 to
// drift the timbre). Lower style values keep the read calm and neutral,
// matching the "calm and unhurried" brief baked into the script prompt.
const DEFAULT_VOICE_SETTINGS = {
    stability: 0.6,
    similarity_boost: 0.75,
    style: 0.15,
    use_speaker_boost: true,
};

const STORAGE_BUCKET = 'vehicles';

function requireEnv() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY env var.');
    if (!voiceId) throw new Error('Missing ELEVENLABS_VOICE_ID env var.');
    return { apiKey, voiceId };
}

/**
 * Synthesize a voiceover line and return a publicly fetchable mp3 URL.
 *
 * `carId` and `sceneNum` are used only for the storage filename — they
 * make it possible to inspect/debug per-car audio in the Supabase UI.
 */
export async function synthesizeVoiceover({ text, carId, sceneNum }) {
    if (!text || !String(text).trim()) {
        throw new Error('synthesizeVoiceover requires a non-empty text line.');
    }

    const { apiKey, voiceId } = requireEnv();

    // Trailing silence strategy: an ellipsis followed by a 3-second SSML break.
    // The ellipsis gives the FINAL WORD a natural falling decay so the model
    // doesn't clip its last phoneme — a hard <break> placed directly after the
    // last word truncates it (the "half word cut off at the end" artefact).
    // The break then supplies the bulk silence. The mp3 must be at least as
    // long as the muxed clip — otherwise Fal compose fills the gap by HOLDING
    // the last sample (the older "stuck voice" artefact). Voice (~4-5s) +
    // ellipsis (~0.7s) + 3s break comfortably covers the 8s clip; the mux
    // truncates any excess trailing silence at clip length.
    const paddedText = `${text} ... <break time="3.0s"/>`;

    console.log(`[ElevenLabs] Synthesizing scene ${sceneNum} voiceover (${text.length} chars, ellipsis +3s trailing silence): "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`);

    const ttsRes = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
            text: paddedText,
            model_id: process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL,
            voice_settings: DEFAULT_VOICE_SETTINGS,
        }),
    });

    if (!ttsRes.ok) {
        const errText = await ttsRes.text().catch(() => '');
        throw new Error(`ElevenLabs TTS failed: HTTP ${ttsRes.status} ${errText.slice(0, 300)}`);
    }

    const arrayBuf = await ttsRes.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuf);

    if (audioBuffer.length < 1000) {
        throw new Error(`ElevenLabs returned a suspiciously small mp3 (${audioBuffer.length} bytes) — likely an API error masquerading as audio.`);
    }

    // Upload to Supabase storage and return its public URL so Fal's
    // FFmpeg compose endpoint can fetch it during the mux step.
    const supabase = await createAdminClient();
    const safeCarId = String(carId || 'unknown').replace(/[^a-z0-9-]/gi, '_').slice(0, 40);
    const fileName = `ai-audio/${safeCarId}/scene-${sceneNum}-${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, audioBuffer, {
            contentType: 'audio/mpeg',
            upsert: true,
        });

    if (uploadError) {
        throw new Error(`Supabase audio upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    const audioUrl = data.publicUrl;

    // Estimate mp3 duration from byte length. ElevenLabs returns CBR 128kbps
    // mp3 when we request `mp3_44100_128`, so bytes / 16000 ≈ seconds. This
    // is precise enough for muxing (the Fal compose keyframe `duration`
    // controls how long the audio track plays before silence — if we pass
    // the clip duration instead, Fal pads/loops the audio tail, which is
    // what causes the "voice sounds stuck at the end" glitch).
    const durationMs = Math.round((audioBuffer.length / 16000) * 1000);

    console.log(`[ElevenLabs] Scene ${sceneNum} audio stored: ${audioUrl} (${audioBuffer.length} bytes, ~${durationMs}ms)`);
    return { audioUrl, bytes: audioBuffer.length, durationMs };
}
