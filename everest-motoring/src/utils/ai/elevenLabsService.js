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

    console.log(`[ElevenLabs] Synthesizing scene ${sceneNum} voiceover (${text.length} chars): "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`);

    const ttsRes = await fetch(`${ELEVENLABS_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
            text,
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

    console.log(`[ElevenLabs] Scene ${sceneNum} audio stored: ${audioUrl}`);
    return { audioUrl, bytes: audioBuffer.length };
}
