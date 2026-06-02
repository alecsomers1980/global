/**
 * Provides a public URL to a silent audio file used to pad the voiceover out
 * to the full clip length during muxing.
 *
 * Why: Fal's ffmpeg compose fills any audio-track gap (between the end of a
 * short voiceover and the end of the 8s video clip) by HOLDING the last audio
 * sample — the "stuck voice that drags into the next clip" artefact, worst on
 * the shortest scene (the closing CTA). Laying explicit silence over that gap
 * forces a clean, silent tail instead.
 *
 * The silent file is a tiny PCM WAV generated in-process and cached in Supabase
 * storage, so we create it at most once.
 */

import { createAdminClient } from '@/utils/supabase/server';

const BUCKET = 'vehicles';
const PATH = 'ai-audio/_silence-8s.wav';
const SECONDS = 8;
const SAMPLE_RATE = 44100;

let cachedUrl = null;

// Build a mono, 16-bit PCM WAV of pure silence (all-zero samples).
function buildSilentWav(seconds, sampleRate) {
    const numSamples = seconds * sampleRate;
    const dataSize = numSamples * 2; // 16-bit mono = 2 bytes/sample
    const buf = Buffer.alloc(44 + dataSize); // Buffer.alloc zero-fills = silence
    buf.write('RIFF', 0);
    buf.writeUInt32LE(36 + dataSize, 4);
    buf.write('WAVE', 8);
    buf.write('fmt ', 12);
    buf.writeUInt32LE(16, 16);          // fmt chunk size
    buf.writeUInt16LE(1, 20);           // PCM
    buf.writeUInt16LE(1, 22);           // mono
    buf.writeUInt32LE(sampleRate, 24);  // sample rate
    buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
    buf.writeUInt16LE(2, 32);           // block align
    buf.writeUInt16LE(16, 34);          // bits per sample
    buf.write('data', 36);
    buf.writeUInt32LE(dataSize, 40);
    return buf;
}

export async function ensureSilenceUrl() {
    if (cachedUrl) return cachedUrl;

    const supabase = await createAdminClient();
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(PATH);
    const url = data.publicUrl;

    // Already uploaded on a previous run? Reuse it.
    try {
        const head = await fetch(url, { method: 'HEAD' });
        if (head.ok) {
            cachedUrl = url;
            return url;
        }
    } catch { /* fall through to upload */ }

    const wav = buildSilentWav(SECONDS, SAMPLE_RATE);
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(PATH, wav, { contentType: 'audio/wav', upsert: true });
    if (error) {
        throw new Error(`Failed to upload silence track: ${error.message}`);
    }

    cachedUrl = url;
    return url;
}
