"use client";

import { useState, useEffect } from "react";
import { checkHeyGenVideoStatus } from "./ai_actions";

export default function AiVideoStatus({ carId, videoUrl }) {
    const [isChecking, setIsChecking] = useState(false);
    const [statusText, setStatusText] = useState("Checking...");
    const [isActive, setIsActive] = useState(false);

    // Initial load logic to determine what phase we are in
    useEffect(() => {
        if (!videoUrl) {
            setIsActive(false);
            return;
        }

        if (videoUrl.startsWith('mux:')) {
            setIsActive(false);
            return;
        }

        if (videoUrl.startsWith('ai_') || videoUrl === 'mux_ingesting') {
            setIsActive(true);
            switch (videoUrl) {
                case 'ai_processing': setStatusText('Planning Scenes...'); break;
                case 'ai_rendering_clips': setStatusText('Generating Veo B-Roll...'); break;
                case 'ai_stitching_video': setStatusText('Stitching Video...'); break;
                case 'mux_ingesting': setStatusText('Optimizing for Web...'); break;
                default: setStatusText('Processing AI Video...');
            }
        }
    }, [videoUrl]);

    // If it's already safely sitting in Mux:
    if (videoUrl && videoUrl.startsWith('mux:')) {
        return (
            <div className="mt-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-bold flex items-center gap-1.5 w-max">
                <span className="material-symbols-outlined text-[14px]">play_circle</span>
                AI Video Live
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
                setStatusText("Generation failed.");
            }
        } catch (error) {
            setStatusText("Error checking status.");
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
