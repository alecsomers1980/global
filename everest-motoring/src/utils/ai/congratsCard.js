/**
 * Fallback "congratulations" handover video for when a sale has no delivery
 * photo. Renders the car's main image with a crisp "Congratulations on your new
 * vehicle, <Full Name>" caption (via next/og, so the text is pixel-perfect — no
 * AI distortion), then turns that flat card into an 8s video with a celebratory
 * voiceover. Reuses the existing TTS + Fal mux pipeline.
 */

import * as React from "react";
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/utils/supabase/server";
import { synthesizeVoiceover } from "./elevenLabsService";
import { muxAudioOntoVideo } from "./videoAudioMuxer";

const BUCKET = "vehicles";
const CARD_W = 1280;
const CARD_H = 720;
const CLIP_MS = 8000;
const FAL_COMPOSE_URL = "https://fal.run/fal-ai/ffmpeg-api/compose";

export async function renderCongratsCardPng({ carImageUrl, fullName }) {
    const name = (fullName || "").trim() || "Valued Customer";
    const el = React.createElement(
        "div",
        { style: { width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: "#000000" } },
        carImageUrl
            ? React.createElement("img", {
                  src: carImageUrl,
                  width: CARD_W,
                  height: CARD_H,
                  style: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
              })
            : null,
        React.createElement(
            "div",
            {
                style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    paddingBottom: 64,
                    background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 72%)",
                },
            },
            React.createElement(
                "div",
                { style: { fontSize: 28, fontWeight: 800, letterSpacing: 8, color: "#ffff01", textTransform: "uppercase", marginBottom: 16, display: "flex" } },
                "Everest Motoring"
            ),
            React.createElement(
                "div",
                { style: { fontSize: 44, fontWeight: 700, color: "#ffffff", display: "flex" } },
                "Congratulations on your new vehicle"
            ),
            React.createElement(
                "div",
                { style: { fontSize: 68, fontWeight: 900, color: "#ffff01", marginTop: 8, display: "flex" } },
                name
            )
        )
    );

    const res = new ImageResponse(el, { width: CARD_W, height: CARD_H });
    return Buffer.from(await res.arrayBuffer());
}

async function uploadCardPng(buf) {
    const supabase = await createAdminClient();
    const path = `sale-cards/${Date.now()}.png`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`Card upload failed: ${error.message}`);
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Compose a still image into an 8s (silent) video — used as the fallback if the
// voiceover/mux step is unavailable.
async function imageToSilentVideo(imageUrl) {
    if (!process.env.FAL_KEY) throw new Error("Missing FAL_KEY env var.");
    const res = await fetch(FAL_COMPOSE_URL, {
        method: "POST",
        headers: { Authorization: `Key ${process.env.FAL_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tracks: [{ id: "1", type: "video", keyframes: [{ url: imageUrl, timestamp: 0, duration: CLIP_MS }] }] }),
    });
    if (!res.ok) throw new Error(`Fal compose failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    const d = await res.json();
    const url = d?.video_url || d?.video?.url || d?.output?.video_url;
    if (!url) throw new Error("Fal compose returned no video URL.");
    return url;
}

/**
 * Build the full congratulations-card handover video and return its URL.
 */
export async function generateCongratsCardVideo({ carImageUrl, fullName, carLabel, carId }) {
    const png = await renderCongratsCardPng({ carImageUrl, fullName });
    const cardUrl = await uploadCardPng(png);

    try {
        const firstName = (fullName || "").trim().split(/\s+/)[0] || "friend";
        const line = `Congratulations ${firstName}, on your new ${carLabel || "vehicle"}. From all of us at Everest Motoring.`;
        const { audioUrl, durationMs } = await synthesizeVoiceover({
            text: line,
            carId: carId || "congrats",
            sceneNum: "congrats",
        });
        return await muxAudioOntoVideo({
            videoUrl: cardUrl,
            audioUrl,
            videoDurationMs: CLIP_MS,
            audioDurationMs: durationMs,
        });
    } catch (err) {
        console.warn(`[congratsCard] voiceover/mux failed, using silent card: ${err.message}`);
        return await imageToSilentVideo(cardUrl);
    }
}
