/**
 * Replaces the old heygenService.js with an agnostic Image-to-Video Engine.
 * Updated to Sora 2 Image To Video Stable via Kie.ai based on recent requirements.
 */

const DEV_MOCK_MODE = false; // [DEV MODE] Set to true to mock generation and avoid consuming Kie.ai credits

export async function startCinematicClips(scriptArray, carPayload) {
    if (!DEV_MOCK_MODE && !process.env.KIE_API_KEY) {
        throw new Error("Missing KIE_API_KEY in environment variables.");
    }

    const MAX_RETRIES = 3;

    try {
        const taskPromises = [];

        // Identify the images we have for the 4 scenes
        const heroImg = carPayload.main_image_url;
        const galleryImg1 = carPayload.gallery_urls && carPayload.gallery_urls.length > 0 ? carPayload.gallery_urls[0] : heroImg;
        const galleryImg2 = carPayload.gallery_urls && carPayload.gallery_urls.length > 1 ? carPayload.gallery_urls[1] : heroImg;
        // Scene 1: Hero (metadata main), Scene 2: Gallery 1, Scene 3: Gallery 2, Scene 4: Hero (Presenter)
        const sceneImages = [heroImg, galleryImg1, galleryImg2, heroImg];

        // Pre-flight: verify every unique image URL is publicly fetchable BEFORE
        // submitting any tasks to Kie.ai. If any URL is broken, all 4 Veo clips
        // would still be billed (~$1.20) but never produce usable output. Bail
        // early with $0 spent and a clear error.
        if (!DEV_MOCK_MODE) {
            const uniqueUrls = [...new Set(sceneImages.filter(Boolean))];
            console.log(`[Video Engine] Pre-flight: checking ${uniqueUrls.length} image URL(s) are publicly accessible...`);
            for (const url of uniqueUrls) {
                let ok = false;
                let status = 0;
                try {
                    const headRes = await fetch(url, { method: 'HEAD' });
                    ok = headRes.ok;
                    status = headRes.status;
                    // Some CDNs reject HEAD — retry with a tiny ranged GET
                    if (!ok && (status === 405 || status === 403)) {
                        const getRes = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
                        ok = getRes.ok || getRes.status === 206;
                        status = getRes.status;
                    }
                } catch (err) {
                    throw new Error(`Pre-flight image check failed for ${url} — network error: ${err.message}. Aborting before Kie.ai charges. Verify the Supabase storage bucket is public.`);
                }
                if (!ok) {
                    throw new Error(`Pre-flight image check failed for ${url} — HTTP ${status}. Aborting before Kie.ai charges. Make sure the image is uploaded and the bucket is public.`);
                }
            }
            console.log(`[Video Engine] Pre-flight passed. All image URLs reachable.`);
        }

        console.log(`[Video Engine] Starting Veo 3.1 Fast generation for ${scriptArray.length} scenes. Mock Mode: ${DEV_MOCK_MODE}`);

        for (let i = 0; i < scriptArray.length; i++) {
            const scene = scriptArray[i];
            const baseImageUrl = sceneImages[i] || heroImg;

            console.log(`[Video Engine] Requesting generation for Scene ${i + 1} via Veo 3.1 Fast... Image: ${baseImageUrl}`);

            if (DEV_MOCK_MODE) {
                // Mock task creation
                taskPromises.push(Promise.resolve({ scene: i + 1, taskId: `mock-task-${Date.now()}-scene-${i}` }));
                continue;
            }

            const requestBody = {
                model: "veo3_fast",
                prompt: scene.visual_prompt,
                imageUrls: [baseImageUrl],
                generationType: "REFERENCE_2_VIDEO",
                aspect_ratio: "16:9",
                enableTranslation: true
            };

            const startPromise = (async () => {
                for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                    try {
                        const response = await fetch("https://api.kie.ai/api/v1/veo/generate", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${process.env.KIE_API_KEY}`
                            },
                            body: JSON.stringify(requestBody)
                        });

                        const startData = await response.json();

                        // If Kie.ai says the service is under load (like 500 errors), throw to trigger a retry
                        if (!response.ok || startData.code !== 200 || startData.msg?.includes("under heavy load") || startData.code === 500) {
                            throw new Error(`Code ${startData.code || response.status}: ${startData.msg || 'Veo service error'}`);
                        }

                        const taskId = startData?.data?.taskId;
                        if (!taskId) {
                            throw new Error(`Failed to get taskId. Response: ${JSON.stringify(startData)}`);
                        }

                        return { scene: i + 1, taskId };
                    } catch (err) {
                        console.warn(`[Video Engine] Scene ${i + 1} attempt ${attempt} failed: ${err.message}`);
                        if (attempt === MAX_RETRIES) {
                            // On the last attempt, throw the error back to the client instead of falling back
                            throw new Error(`Failed to generate video for Scene ${i + 1} after 3 attempts. Veo engine unavailable.`);
                        }
                        // Wait 3 seconds before retrying
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
            })();

            taskPromises.push(startPromise);
        }

        const tasks = await Promise.all(taskPromises);
        console.log(`[Video Engine] All ${scriptArray.length} clips started successfully. Task IDs:`, tasks);
        return tasks;

    } catch (error) {
        console.error("Exception in startCinematicClips:", error);
        throw error;
    }
}

export async function pollCinematicTask(taskId) {
    if (DEV_MOCK_MODE) {
        // Mock polling - succeed immediately
        console.log(`[Video Engine] Mock polling success for task ${taskId}`);
        return { isComplete: true, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" };
    }

    if (!process.env.KIE_API_KEY) throw new Error("Missing KIE_API_KEY");

    let pollResponse;
    try {
        pollResponse = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.KIE_API_KEY}`
            }
        });
    } catch (err) {
        console.warn(`[Video Engine] Polling network error for task ${taskId}: ${err.message}`);
        return { isComplete: false };
    }

    if (!pollResponse.ok) {
        return { isComplete: false };
    }

    const pollData = await pollResponse.json();

    if (pollData && pollData.code === 200 && pollData.data) {
        const task = pollData.data;

        // ADDED DIAGNOSTIC LOGGING
        console.log(`[Video Engine] Task ${taskId} successFlag: ${task.successFlag}, state: ${task.state}`);

        if (task.successFlag === 1 || task.state === "success") {
            try {
                let resultObj = task;
                if (task.resultJson) {
                    try { resultObj = JSON.parse(task.resultJson); } catch (e) { }
                }

                // Veo 3.1 sometimes returns resultUrls as a stringified array or inside an info object or response object
                let urls = resultObj.resultUrls;
                if (!urls && resultObj.info) {
                    urls = resultObj.info.resultUrls;
                }
                if (!urls && resultObj.response) {
                    urls = resultObj.response.resultUrls;
                }

                if (typeof urls === 'string') {
                    try { urls = JSON.parse(urls); } catch (e) { urls = [urls]; }
                }

                if (urls && urls.length > 0) {
                    return { isComplete: true, videoUrl: urls[0] };
                } else {
                    console.error(`[Video Engine] Task ${taskId} success but no URLs:`, resultObj);
                    return { isComplete: false, error: "Task marked success but resultUrls unavailable." };
                }
            } catch (e) {
                console.error(`[Video Engine] Task ${taskId} parse error:`, e, task);
                return { isComplete: false, error: "Failed to parse result." };
            }
        } else if (task.successFlag === 2 || task.successFlag === 3 || task.state === "fail") {
            console.error(`[Video Engine] Task ${taskId} failed. Full task payload:`, JSON.stringify(task));

            // Search every plausible field — Kie.ai is inconsistent about where
            // it puts the failure reason (sometimes top-level, sometimes nested
            // in resultJson / info / response, sometimes under different names).
            let failureReason = task.failMsg || task.failReason || task.errorMessage || task.errorMsg || task.error || task.msg;
            let failureCode = task.failCode || task.errorCode || task.code;

            if (!failureReason && task.resultJson) {
                try {
                    const parsed = typeof task.resultJson === 'string' ? JSON.parse(task.resultJson) : task.resultJson;
                    failureReason = parsed.error || parsed.errorMessage || parsed.failMsg || parsed.failReason || parsed.msg;
                    failureCode = failureCode || parsed.errorCode || parsed.failCode;
                } catch (e) { /* ignore parse errors */ }
            }

            for (const nestKey of ['info', 'response', 'data']) {
                if (!failureReason && task[nestKey] && typeof task[nestKey] === 'object') {
                    const nested = task[nestKey];
                    failureReason = nested.error || nested.errorMessage || nested.failMsg || nested.failReason || nested.msg;
                    failureCode = failureCode || nested.errorCode || nested.failCode;
                }
            }

            // Last resort: surface enough of the raw payload to diagnose without Vercel logs.
            if (!failureReason) {
                const populatedFields = Object.entries(task)
                    .filter(([, v]) => v !== null && v !== '' && v !== undefined && typeof v !== 'object')
                    .map(([k, v]) => `${k}=${String(v).substring(0, 80)}`)
                    .join(', ');
                failureReason = `Kie.ai returned no failure reason. successFlag=${task.successFlag}, state=${task.state || 'n/a'}. Payload fields: ${populatedFields || '(none)'}`;
            }

            return { isComplete: false, error: `Veo failure [${failureCode || 'unknown'}]: ${failureReason}` };
        }
    } else {
        console.warn(`[Video Engine] Task ${taskId} unexpected poll response:`, pollData);
    }

    return { isComplete: false };
}
