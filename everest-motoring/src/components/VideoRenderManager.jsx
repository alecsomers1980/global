"use client";

import { useEffect, useState, useRef } from 'react';
import {
    getNextPendingAiCarAction,
    generateScriptAction,
    preflightSceneImagesAction,
    startSingleClipAction,
    pollSingleClipAction,
    stitchVideoAction,
    ingestMuxAction,
    markVideoErrorAction
} from '@/app/admin/inventory/ai_actions';

export default function VideoRenderManager() {
    const [currentJob, setCurrentJob] = useState(null);
    const [statusText, setStatusText] = useState('');
    const processingRef = useRef(false);

    useEffect(() => {
        // Poll for new jobs every 15 seconds
        const pollInterval = setInterval(async () => {
            if (processingRef.current) return;

            try {
                const nextCar = await getNextPendingAiCarAction();
                if (nextCar) {
                    processCar(nextCar);
                }
            } catch (err) {
                console.error("[Queue Manager] Error checking for pending cars:", err);
            }
        }, 15000); // 15s

        // Run once immediately on mount
        if (!processingRef.current) {
            getNextPendingAiCarAction().then(car => {
                if (car) processCar(car);
            }).catch(console.error);
        }

        return () => clearInterval(pollInterval);
    }, []);

    const processCar = async (car) => {
        processingRef.current = true;
        setCurrentJob(car);
        setStatusText('Generating Storyboard...');

        try {
            // 1. Generate Script
            const scriptRes = await generateScriptAction(car.id, car);
            if (!scriptRes.success) throw new Error(scriptRes.error || "Failed to generate script");
            const scriptArray = scriptRes.scriptArray;

            // 2. Pre-flight image URLs (zero spend if any image is broken)
            setStatusText('Verifying images...');
            const preflightRes = await preflightSceneImagesAction(car);
            if (!preflightRes.success) throw new Error(preflightRes.error || "Image pre-flight failed");
            const sceneImages = preflightRes.sceneImages;

            // 3. Render scenes SEQUENTIALLY — start scene 1, poll to completion,
            //    then start scene 2, etc. Failure at any scene aborts the rest,
            //    capping the worst-case spend at ~$0.30 (one scene) instead of
            //    ~$1.20 (all four).
            const finalClipUrls = [];
            const POLL_INTERVAL_MS = 10000; // 10s between polls
            const MAX_POLLS_PER_SCENE = 30;  // 30 * 10s = 5min budget per scene

            for (let i = 0; i < scriptArray.length; i++) {
                const scene = scriptArray[i];
                const sceneNum = i + 1;
                const total = scriptArray.length;

                setStatusText(`Rendering Scene ${sceneNum}/${total} (1–2 mins)...`);

                const startRes = await startSingleClipAction(scene, sceneImages[i]);
                if (!startRes.success) {
                    throw new Error(`Scene ${sceneNum} start failed: ${startRes.error}`);
                }
                const taskId = startRes.task.taskId;

                let isComplete = false;
                let videoUrl = null;
                for (let p = 0; p < MAX_POLLS_PER_SCENE; p++) {
                    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
                    const pollRes = await pollSingleClipAction(taskId);
                    if (!pollRes.success) {
                        throw new Error(`Scene ${sceneNum} failed: ${pollRes.error}`);
                    }
                    if (pollRes.isComplete && pollRes.videoUrl) {
                        isComplete = true;
                        videoUrl = pollRes.videoUrl;
                        break;
                    }
                }

                if (!isComplete || !videoUrl) {
                    throw new Error(`Scene ${sceneNum} timed out after ${(MAX_POLLS_PER_SCENE * POLL_INTERVAL_MS) / 60000} minutes`);
                }

                finalClipUrls.push(videoUrl);
            }

            // 4. Stitch Videos
            setStatusText('Stitching Final Video...');
            const stitchRes = await stitchVideoAction(car.id, finalClipUrls);
            if (!stitchRes.success) throw new Error(stitchRes.error || "Failed to stitch final video");

            // 5. Ingest to Cloudflare Stream
            setStatusText('Optimizing & Publishing...');
            const muxRes = await ingestMuxAction(car.id, stitchRes.finalStitchedUrl);
            if (!muxRes.success) throw new Error(muxRes.error || "Failed to publish video");

            // Done!
            setCurrentJob(null);
            processingRef.current = false;

        } catch (error) {
            console.error("[Queue Manager] Job failed:", error);
            await markVideoErrorAction(car.id, error.message);
            // Wait 5 seconds to show the error before clearing
            setStatusText(`Failed: ${error.message.substring(0, 120)}${error.message.length > 120 ? '…' : ''}`);
            setTimeout(() => {
                setCurrentJob(null);
                processingRef.current = false;
            }, 12000);
        }
    };

    if (!currentJob) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-l-4 border-primary text-white p-4 rounded-lg shadow-2xl flex items-center gap-4 max-w-sm animate-fade-in-up">
            <div className="flex-shrink-0 animate-spin text-primary">
                <span className="material-symbols-outlined block">sync</span>
            </div>
            <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Automated AI Producer</p>
                <p className="text-sm font-semibold truncate leading-tight">{currentJob.make} {currentJob.model}</p>
                <p className="text-xs text-slate-300 truncate">{statusText}</p>
            </div>
        </div>
    );
}
