"use client";

import { useState, useRef, useEffect } from "react";
import {
    startTestHandoverVideo,
    pollTestHandoverVideo,
    startTestCongratsCard,
} from "../inventory/handover_test_actions";

const STYLES = [
    { key: "pixel_build", label: "Pixel Build", hint: "Car assembles next to the person on the same background" },
    { key: "dream_drive", label: "Dream Drive Transition", hint: "Showroom morphs into a coastal sunset" },
    { key: "reveal", label: "Time-Lapse Reveal", hint: "Silk cover pulls away, sun sets, city lights bloom" },
    { key: "hero_orbit", label: "Stylized Hero Walkaround", hint: "3D drone orbit with cinematic grade" },
];

export default function HandoverTestPage() {
    const [mode, setMode] = useState("pixel"); // "pixel" | "card"
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState("");
    const [videoUrl, setVideoUrl] = useState(null);
    const pollRef = useRef(null);

    useEffect(() => () => clearInterval(pollRef.current), []);

    function reset() {
        clearInterval(pollRef.current);
        setVideoUrl(null);
        setStatus("");
        setBusy(false);
    }

    async function handlePixel(e) {
        e.preventDefault();
        setBusy(true);
        setVideoUrl(null);
        setStatus("Uploading photo & queuing generation…");
        try {
            const res = await startTestHandoverVideo(new FormData(e.target));
            if (!res?.success) { setStatus(""); setBusy(false); alert(res?.error || "Failed."); return; }
            setStatus("Generating… ~1–3 minutes. Polling…");
            pollRef.current = setInterval(async () => {
                const p = await pollTestHandoverVideo(res.taskId);
                if (p.status === "ready") { clearInterval(pollRef.current); setVideoUrl(p.videoUrl); setStatus("Done!"); setBusy(false); }
                else if (p.status === "failed") { clearInterval(pollRef.current); setStatus("Failed: " + (p.error || "unknown")); setBusy(false); }
            }, 8000);
        } catch (err) { setStatus(""); setBusy(false); alert(err.message); }
    }

    async function handleCard(e) {
        e.preventDefault();
        setBusy(true);
        setVideoUrl(null);
        setStatus("Building card + voiceover… ~30 seconds.");
        try {
            const res = await startTestCongratsCard(new FormData(e.target));
            if (!res?.success) { setStatus(""); setBusy(false); alert(res?.error || "Failed."); return; }
            setVideoUrl(res.videoUrl);
            setStatus("Done!");
            setBusy(false);
        } catch (err) { setStatus(""); setBusy(false); alert(err.message); }
    }

    const tabCls = (active) =>
        `px-4 py-2 rounded-lg text-sm font-bold ${active ? "bg-primary text-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`;

    return (
        <div className="flex-1 w-full px-6 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Handover Video Test</h1>
                <p className="text-slate-500 mt-1 mb-5">
                    Preview the post-sale videos on any photo — no sale record needed. Each run is a
                    real generation and costs credits.
                </p>

                <div className="flex gap-2 mb-5">
                    <button type="button" className={tabCls(mode === "pixel")} onClick={() => { setMode("pixel"); reset(); }}>
                        Pixel Build (person photo)
                    </button>
                    <button type="button" className={tabCls(mode === "card")} onClick={() => { setMode("card"); reset(); }}>
                        Congratulations Card (no photo)
                    </button>
                </div>

                {mode === "pixel" ? (
                    <form onSubmit={handlePixel} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Photo (person with/near the car)</label>
                            <input type="file" name="image" accept="image/png, image/jpeg, image/webp" required disabled={busy}
                                className="text-sm w-full file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-black hover:file:bg-primary/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Style</label>
                            <select name="style" defaultValue="pixel_build" disabled={busy} className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white">
                                {STYLES.map((s) => (<option key={s.key} value={s.key}>{s.label} — {s.hint}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Buyer first name (optional)</label>
                            <input type="text" name="buyer_name" placeholder="e.g. John" disabled={busy} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                        </div>
                        <button type="submit" disabled={busy} className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-black font-bold rounded-lg w-full">
                            {busy ? "Working…" : "Generate Test Video"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCard} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Car image (the vehicle's main photo)</label>
                            <input type="file" name="image" accept="image/png, image/jpeg, image/webp" required disabled={busy}
                                className="text-sm w-full file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-black hover:file:bg-primary/20" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Buyer full name *</label>
                            <input type="text" name="buyer_name" required placeholder="e.g. Johan van der Merwe" disabled={busy} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Vehicle (for the voiceover, optional)</label>
                            <input type="text" name="car_label" placeholder="e.g. 2022 Renault Kiger" disabled={busy} className="w-full px-4 py-3 border border-slate-300 rounded-lg" />
                        </div>
                        <button type="submit" disabled={busy} className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-black font-bold rounded-lg w-full">
                            {busy ? "Working…" : "Generate Congratulations Card"}
                        </button>
                    </form>
                )}

                {status && (
                    <div className="mt-4 text-sm font-medium text-slate-600 flex items-center gap-2">
                        {busy && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                        {status}
                    </div>
                )}

                {videoUrl && (
                    <div className="mt-6">
                        <video src={videoUrl} controls autoPlay loop className="w-full rounded-xl border border-slate-200" />
                        <a href={videoUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-dark font-bold underline mt-2 inline-block">Open / download</a>
                    </div>
                )}
            </div>
        </div>
    );
}
