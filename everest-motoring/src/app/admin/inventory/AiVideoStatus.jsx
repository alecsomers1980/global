"use client";

import { useState, useEffect } from "react";
import { checkHeyGenVideoStatus, queueAiWalkaround } from "./ai_actions";

export default function AiVideoStatus({ carId, videoUrl }) {
    const [isChecking, setIsChecking] = useState(false);
    const [statusText, setStatusText] = useState("Checking...");
    const [isActive, setIsActive] = useState(false);
    const [isError, setIsError] = useState(false);

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

    // If it's already safely hosted (Mux or Cloudflare):
    if (videoUrl && (videoUrl.startsWith('mux:') || videoUrl.startsWith('cf:'))) {
        return (
            <div className="mt-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-bold flex items-center gap-1.5 w-max">
                <span className="material-symbols-outlined text-[14px]">play_circle</span>
                AI Video Live
            </div>
        );
    }

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
