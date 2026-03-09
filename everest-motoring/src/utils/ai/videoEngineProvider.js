/**
 * Replaces the old heygenService.js with an agnostic Image-to-Video Engine.
 * Updated to Sora 2 Image To Video Stable via Kie.ai based on recent requirements.
 */

const DEV_MOCK_MODE = true; // [DEV MODE] Set to true to mock generation and avoid consuming Kie.ai credits

export async function startCinematicClips(scriptArray, carPayload) {
    if (!DEV_MOCK_MODE && !process.env.KIE_API_KEY) {
        throw new Error("Missing KIE_API_KEY in environment variables.");
    }

    try {
        const taskPromises = [];

        // Identify the images we have for the 4 scenes
        const heroImg = carPayload.main_image_url;
        const galleryImg1 = carPayload.gallery_urls && carPayload.gallery_urls.length > 0 ? carPayload.gallery_urls[0] : heroImg;
        const galleryImg2 = carPayload.gallery_urls && carPayload.gallery_urls.length > 1 ? carPayload.gallery_urls[1] : heroImg;
        // Scene 1: Hero (metadata main), Scene 2: Gallery 1, Scene 3: Gallery 2, Scene 4: Hero (Presenter)
        const sceneImages = [heroImg, galleryImg1, galleryImg2, heroImg];

        console.log(`[Video Engine] Starting Sora 2 generation for ${scriptArray.length} scenes. Mock Mode: ${DEV_MOCK_MODE}`);

        for (let i = 0; i < scriptArray.length; i++) {
            const scene = scriptArray[i];
            const baseImageUrl = sceneImages[i] || heroImg;

            console.log(`[Video Engine] Requesting generation for Scene ${i + 1} via Sora 2... Image: ${baseImageUrl}`);

            if (DEV_MOCK_MODE) {
                // Mock task creation
                taskPromises.push(Promise.resolve({ scene: i + 1, taskId: `mock-task-${Date.now()}-scene-${i}` }));
                continue;
            }

            const requestBody = {
                model: "sora-2-image-to-video-stable",
                input: {
                    prompt: scene.visual_prompt,
                    image_urls: [baseImageUrl],
                    aspect_ratio: "portrait", // Assuming we want portrait for social dominance unless specified landscape
                    n_frames: "10",
                    upload_method: "s3"
                }
            };

            const startPromise = fetch("https://api.kie.ai/api/v1/jobs/createTask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.KIE_API_KEY}`
                },
                body: JSON.stringify(requestBody)
            }).then(async (response) => {
                const startData = await response.json();

                if (!response.ok || startData.code !== 200) {
                    throw new Error(`Video Engine returned HTTP ${response.status} / Code ${startData.code}: ${startData.msg}`);
                }

                const taskId = startData?.data?.taskId;
                if (!taskId) {
                    throw new Error(`Failed to get taskId. Response: ${JSON.stringify(startData)}`);
                }

                return { scene: i + 1, taskId };
            });

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

    const pollResponse = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.KIE_API_KEY}`
        }
    });

    if (!pollResponse.ok) {
        return { isComplete: false };
    }

    const pollData = await pollResponse.json();

    if (pollData && pollData.code === 200 && pollData.data) {
        const task = pollData.data;

        if (task.state === "success") {
            try {
                const resultObj = JSON.parse(task.resultJson);
                if (resultObj.resultUrls && resultObj.resultUrls.length > 0) {
                    return { isComplete: true, videoUrl: resultObj.resultUrls[0] };
                } else {
                    return { isComplete: false, error: "Task marked success but resultUrls unavailable." };
                }
            } catch (e) {
                return { isComplete: false, error: "Failed to parse resultJson." };
            }
        } else if (task.state === "fail") {
            return { isComplete: false, error: `Error Code: ${task.failCode} - ${task.failMsg}` };
        }
    }

    return { isComplete: false };
}
