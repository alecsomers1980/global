"use client";

import { useState, useEffect } from "react";
import { checkHeyGenVideoStatus, queueAiWalkaround, requestSceneRegenerationAction, requestAudioRedoAction } from "./ai_actions";

export default function AiVideoStatus({ carId, videoUrl }) {
    const [isChecking, setIsChecking] = useState(false);
    const [statusText, setStatusText] = useState("Checking...");
    const [isActive, setIsActive] = useState(false);
    const [isError, setIsError] = useState(false);
    const [selectedScenes, setSelectedScenes] = useState([]);

    // Initial load logic to determine what phase we are in
    useEffect(() => {
        if (!videoUrl) {
            setIsActive(false);
            setIsError(false);
            return;
        }

        if (videoUrl.startsWith('mux:') || videoUrl.startsWith('cf:')) {
            setIsActive(false);
            setIsError(false);
            return;
        }

        if (videoUrl.startsWith('error:')) {
            setIsActive(false);
            setIsError(true);
            return;
        }

        if (videoUrl.startsWith('ai_') || videoUrl === 'mux_ingesting' || videoUrl === 'cf_ingesting') {
            setIsActive(true);
            setIsError(false);
            setStatusText('Rendering...');
        }
    }, [videoUrl]);

    const handleRetry = async () => {
        setIsChecking(true);
        setStatusText("Retrying...");
        try {
            await queueAiWalkaround(carId);
            window.location.reload();
        } catch (error) {
            alert("Failed to retry: " + error.message);
            setIsChecking(false);
        }
    };

    const handleGenerate = async () => {
        if (!window.confirm("Generate the AI walkaround video for this vehicle?\n\nThe render runs in the background — you can close this tab and come back later. A Vercel cron job advances the pipeline one step per minute (4 × 8-second clips, then stitch + Cloudflare ingest); full successful renders take ~10–15 minutes and cost roughly $5.60 (Seedance 2 + ElevenLabs voiceover). If a step fails the pipeline aborts immediately, capping the cost at the per-scene spend.")) return;
        setIsChecking(true);
        try {
            await queueAiWalkaround(carId);
            window.location.reload();
        } catch (error) {
            alert("Failed to queue generation: " + error.message);
            setIsChecking(false);
        }
    };

    const handleRegenerate = async () => {
        if (!window.confirm("Regenerate the AI walkaround video for this vehicle?\n\nThe render runs in the background — you can close this tab and come back later. A Vercel cron job advances the pipeline one step per minute (4 × 8-second clips, then stitch + Cloudflare ingest); full successful renders take ~10–15 minutes and cost roughly $5.60 (Seedance 2 Fast 720p + ElevenLabs voiceover). If a step fails the pipeline aborts immediately, capping the cost at the per-scene spend.\n\nThe current video will be replaced once the new one finishes.")) return;
        setIsChecking(true);
        try {
            await queueAiWalkaround(carId);
            window.location.reload();
        } catch (error) {
            alert("Failed to queue regeneration: " + error.message);
            setIsChecking(false);
        }
    };

    const toggleScene = (n) => {
        setSelectedScenes((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b));
    };

    const handleRedoSelectedScenes = async () => {
        if (selectedScenes.length === 0) return;
        const list = selectedScenes.join(", ");
        const approxCost = (selectedScenes.length * 1.55).toFixed(2);
        if (!window.confirm(`Regenerate scenes ${list}?\n\nApprox cost: $${approxCost} ( ~$1.55 per scene — Seedance 8s + ElevenLabs + mux, plus one re-stitch and re-ingest ). The current video stays live until the redo finishes, then is replaced automatically.\n\nProceed?`)) return;
        setIsChecking(true);
        try {
            const res = await requestSceneRegenerationAction(carId, selectedScenes);
            if (!res || !res.success) {
                alert("Failed to queue scene redo: " + ((res && res.error) || "Unknown error"));
                setIsChecking(false);
                return;
            }
            window.location.reload();
        } catch (error) {
            alert("Failed to queue scene redo: " + error.message);
            setIsChecking(false);
        }
    };

    const handleRedoAudioScenes = async () => {
        if (selectedScenes.length === 0) return;
        const list = selectedScenes.join(", ");
        if (!window.confirm(`Redo ONLY the voiceover for scenes ${list}?\n\nThis re-voices the existing video clips — NO video re-render, so it costs no video credits (just the voiceover + a re-stitch). Use this for audio glitches like babble or a clipped word.\n\nThe current video stays live until the redo finishes, then is replaced automatically.\n\nProceed?`)) return;
        setIsChecking(true);
        try {
            const res = await requestAudioRedoAction(carId, selectedScenes);
            if (!res || !res.success) {
                alert("Failed to queue audio redo: " + ((res && res.error) || "Unknown error"));
                setIsChecking(false);
                return;
            }
            window.location.reload();
        } catch (error) {
            alert("Failed to queue audio redo: " + error.message);
            setIsChecking(false);
        }
    };

    // If it's already safely hosted (Mux or Cloudflare):
    if (videoUrl && (videoUrl.startsWith('mux:') || videoUrl.startsWith('cf:'))) {
        return (
            <div className="mt-2 flex flex-col gap-1.5 w-max">
                <div className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">play_circle</span>
                    AI Video Live
                </div>
                <button
                    onClick={handleRegenerate}
                    disabled={isChecking}
                    className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center justify-center gap-1 border border-slate-200 transition-colors disabled:opacity-70"
                    title="Regenerate the walkaround video using the latest prompts"
                >
                    <span className="material-symbols-outlined text-[12px]">refresh</span>
                    {isChecking ? "Queuing..." : "Regenerate all"}
                </button>
                <div className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">Or redo specific scenes:</div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4].map((n) => {
                        const on = selectedScenes.includes(n);
                        return (
                            <button
                                key={n}
                                type="button"
                                onClick={() => toggleScene(n)}
                                disabled={isChecking}
                                className={`text-[11px] font-bold w-6 h-6 rounded-md border transition-colors disabled:opacity-70 ${on ? "bg-primary text-black border-primary" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`}
                                title={`Toggle scene ${n}`}
                            >
                                {n}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={handleRedoSelectedScenes}
                    disabled={isChecking || selectedScenes.length === 0}
                    className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center justify-center gap-1 border border-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={selectedScenes.length === 0 ? "Select one or more scenes first" : `Regenerate scenes ${selectedScenes.join(", ")} (video + audio)`}
                >
                    <span className="material-symbols-outlined text-[12px]">refresh</span>
                    {isChecking ? "Queuing..." : "Regenerate selected (video)"}
                </button>
                <button
                    onClick={handleRedoAudioScenes}
                    disabled={isChecking || selectedScenes.length === 0}
                    className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md flex items-center justify-center gap-1 border border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={selectedScenes.length === 0 ? "Select one or more scenes first" : `Redo voiceover only for scenes ${selectedScenes.join(", ")} — no video credits`}
                >
                    <span className="material-symbols-outlined text-[12px]">volume_up</span>
                    {isChecking ? "Queuing..." : "Redo audio only (free)"}
                </button>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mt-3 flex flex-col gap-1.5">
                <div className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200 w-full mb-1">
                    Failed: {videoUrl.replace('error: ', '')}
                </div>
                <button
                    onClick={handleRetry}
                    disabled={isChecking}
                    className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1.5 rounded-md flex items-center justify-center gap-1.5 border border-amber-200 transition-colors shadow-sm w-full disabled:opacity-70"
                >
                    <span className="material-symbols-outlined text-[14px]">{isChecking ? 'sync' : 'refresh'}</span>
                    {isChecking ? "Queuing..." : "Retry Genesis"}
                </button>
            </div>
        );
    }

    // No video yet (never generated) — offer to kick off the AI walkaround.
    if (!videoUrl) {
        return (
            <div className="mt-2">
                <button
                    onClick={handleGenerate}
                    disabled={isChecking}
                    className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1.5 rounded-md flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors shadow-sm w-full disabled:opacity-70"
                    title="Generate the AI walkaround video for this vehicle"
                >
                    <span className="material-symbols-outlined text-[14px]">smart_display</span>
                    {isChecking ? "Queuing..." : "Generate AI Video"}
                </button>
            </div>
        );
    }

    if (!isActive) return null;

    const handleCheckStatus = async () => {
        setIsChecking(true);
        setStatusText("Polling Server...");
        try {
            const result = await checkHeyGenVideoStatus(carId);

            if (result.status === 'ready') {
                setStatusText("Complete! Refreshing...");
                setTimeout(() => window.location.reload(), 1500);
            } else if (result.status === 'processing') {
                // Refresh page to get latest DB string state
                window.location.reload();
            } else {
                setStatusText("Generation failed: " + (result.error || "Unknown Error"));
            }
        } catch (error) {
            setStatusText("Error checking status: " + error.message);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="mt-3 flex flex-col gap-1.5">
            <button
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1.5 rounded-md flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors shadow-sm w-full disabled:opacity-70 animate-pulse"
            >
                <span className={`material-symbols-outlined text-[14px] animate-spin`}>
                    progress_activity
                </span>
                {statusText}
            </button>
            <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">
                This takes ~3 minutes.<br />Click to refresh status.
            </span>
        </div>
    );
}
