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
            return { isComplete: false, error: `Error Code: ${task.failCode || 'Failed'} - ${task.failMsg || task.failReason || 'Generation Error'}` };
        }
    } else {
        console.warn(`[Video Engine] Task ${taskId} unexpected poll response:`, pollData);
    }

    return { isComplete: false };
}
