"use client";

import { useEffect, useState, useRef } from 'react';
import {
    getNextPendingAiCarAction,
    generateScriptAction,
    startVeoClipsAction,
    pollVeoClipsAction,
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

            // 2. Start Veo Clips
            setStatusText('Rendering Videos (takes 1-2 mins)...');
            const startRes = await startVeoClipsAction(scriptRes.scriptArray, car);
            if (!startRes.success) throw new Error(startRes.error || "Failed to start rendering clips");

            // 3. Poll for Clips Completion
            let clipsComplete = false;
            let finalClipUrls = [];
            let attempts = 0;

            while (!clipsComplete && attempts < 40) {
                // Wait 10s between checks to avoid spamming the backend
                await new Promise(r => setTimeout(r, 10000));
                attempts++;

                const pollRes = await pollVeoClipsAction(startRes.taskIds);

                if (!pollRes.success) {
                    throw new Error(pollRes.error || "Error during clip generation");
                }

                if (pollRes.isComplete) {
                    clipsComplete = true;
                    finalClipUrls = pollRes.clipUrls;
                }
            }

            if (!clipsComplete || finalClipUrls.length === 0) {
                throw new Error("Timed out waiting for Veo 3.1 completion after 6 minutes.");
            }

            // 4. Stitch Videos
            setStatusText('Stitching Final Video...');
            const stitchRes = await stitchVideoAction(car.id, finalClipUrls);
            if (!stitchRes.success) throw new Error(stitchRes.error || "Failed to stitch final video");

            // 5. Ingest to Mux
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
            setStatusText(`Failed: ${error.message.substring(0, 40)}...`);
            setTimeout(() => {
                setCurrentJob(null);
                processingRef.current = false;
            }, 5000);
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
