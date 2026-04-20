"use client";

import { useEffect, useRef, useState } from "react";
import { startSaleVideo, pollSaleVideo } from "./sale_actions";
import { SEEDANCE_STYLES } from "@/utils/ai/seedanceService";

const POLL_INTERVAL_MS = 8000;

export default function SaleVideoPicker({ sale, onUpdated }) {
    const [status, setStatus] = useState(sale?.sale_video_status || "none");
    const [videoUrl, setVideoUrl] = useState(sale?.sale_video_url || null);
    const [selectedStyle, setSelectedStyle] = useState(sale?.sale_video_style || null);
    const [error, setError] = useState(null);
    const [starting, setStarting] = useState(false);
    const pollRef = useRef(null);

    useEffect(() => {
        if (status !== "generating" || !sale?.id) return;

        const tick = async () => {
            try {
                const res = await pollSaleVideo(sale.id);
                if (res.status === "ready") {
                    setStatus("ready");
                    setVideoUrl(res.videoUrl);
                    if (onUpdated) onUpdated({ sale_video_status: "ready", sale_video_url: res.videoUrl });
                } else if (res.status === "failed") {
                    setStatus("failed");
                    setError(res.error || "Generation failed");
                }
            } catch (err) {
                console.warn("pollSaleVideo failed:", err);
            }
        };

        tick();
        pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
        return () => clearInterval(pollRef.current);
    }, [status, sale?.id, onUpdated]);

    async function handleStart(styleKey) {
        setError(null);
        setStarting(true);
        setSelectedStyle(styleKey);
        try {
            const res = await startSaleVideo(sale.id, styleKey);
            if (res.error) {
                setError(res.error);
                setStatus("failed");
            } else {
                setStatus("generating");
            }
        } catch (err) {
            setError(err.message || "Failed to start generation.");
            setStatus("failed");
        } finally {
            setStarting(false);
        }
    }

    if (!sale?.delivery_photo_url) {
        return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Upload a delivery photo above, save the sale, then return here to generate a handover video.
            </div>
        );
    }

    if (status === "ready" && videoUrl) {
        return (
            <div className="space-y-3">
                <video src={videoUrl} controls className="w-full max-h-96 rounded-xl border border-slate-200" />
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        Download
                    </a>
                    <button
                        type="button"
                        onClick={() => {
                            setStatus("none");
                            setVideoUrl(null);
                            setSelectedStyle(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined text-base">refresh</span>
                        Regenerate
                    </button>
                    <span className="text-xs text-slate-500">
                        Video will be embedded in the scheduled review email automatically.
                    </span>
                </div>
            </div>
        );
    }

    if (status === "generating") {
        const styleLabel = SEEDANCE_STYLES.find((s) => s.key === selectedStyle)?.label || "Video";
        return (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <div className="text-sm">
                    <div className="font-bold text-slate-800">Generating {styleLabel}…</div>
                    <div className="text-slate-600">Seedance 2 typically takes 1–3 minutes. You can close this dialog — we'll keep generating in the background.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SEEDANCE_STYLES.map((style) => (
                    <button
                        key={style.key}
                        type="button"
                        disabled={starting}
                        onClick={() => handleStart(style.key)}
                        className="text-left rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 p-4 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        <div className="font-bold text-slate-900 mb-1">{style.label}</div>
                        <div className="text-xs uppercase tracking-wide text-primary mb-2">{style.tagline}</div>
                        <div className="text-sm text-slate-600">{style.description}</div>
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500">
                Pick one style. Generates an 8-second 9:16 clip from the delivery photo using Seedance 2 Fast.
            </p>
        </div>
    );
}
