/**
 * Replaces the old heygenService.js with an agnostic Image-to-Video Engine.
 * Defaulting to Veo 3.1 Fast via Kie.ai for cost-effective ($0.30/video), high-quality testing.
 */

export async function startCinematicClips(scriptArray, carPayload) {
    if (!process.env.KIE_API_KEY) {
        throw new Error("Missing KIE_API_KEY in environment variables.");
    }

    try {
        const taskPromises = [];

        // Identify the images we have
        const heroImg = carPayload.main_image_url;
        const galleryImg1 = carPayload.gallery_urls && carPayload.gallery_urls.length > 0 ? carPayload.gallery_urls[0] : heroImg;
        const galleryImg2 = carPayload.gallery_urls && carPayload.gallery_urls.length > 1 ? carPayload.gallery_urls[1] : heroImg;
        const sceneImages = [heroImg, galleryImg1, galleryImg2];

        for (let i = 0; i < scriptArray.length; i++) {
            const scene = scriptArray[i];
            const baseImageUrl = sceneImages[i] || heroImg;

            console.log(`[Video Engine] Requesting generation for Scene ${i + 1} via Veo 3...`);

            const requestBody = {
                model: "veo3",
                prompt: scene.visual_prompt,
                imageUrls: [baseImageUrl],
                aspect_ratio: "16:9"
            };

            const startPromise = fetch("https://api.kie.ai/api/v1/veo/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.KIE_API_KEY}`
                },
                body: JSON.stringify(requestBody)
            }).then(async (response) => {
                const startData = await response.json();

                if (!response.ok) {
                    throw new Error(`Video Engine returned HTTP ${response.status}`);
                }

                let taskId = null;
                if (startData?.data?.taskId) taskId = startData.data.taskId;
                else if (startData?.data?.task_id) taskId = startData.data.task_id;
                else if (startData?.taskId) taskId = startData.taskId;
                else if (typeof startData?.data === 'string') taskId = startData.data;

                if (!taskId) {
                    throw new Error(`Failed to get taskId. Response: ${JSON.stringify(startData)}`);
                }

                return { scene: i + 1, taskId };
            });

            taskPromises.push(startPromise);
        }

        // Return all task IDs so the client can manage polling
        const tasks = await Promise.all(taskPromises);
        console.log(`[Video Engine] All 3 clips started successfully. Task IDs:`, tasks);
        return tasks;

    } catch (error) {
        console.error("Exception in startCinematicClips:", error);
        throw error;
    }
}

export async function pollCinematicTask(taskId) {
    if (!process.env.KIE_API_KEY) throw new Error("Missing KIE_API_KEY");

    const pollResponse = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${process.env.KIE_API_KEY}`
        }
    });

    if (!pollResponse.ok) {
        return { isComplete: false };
    }

    const pollData = await pollResponse.json();

    if (pollData && pollData.data) {
        const task = pollData.data;

        if (task.successFlag === 1) {
            let finalVideoUrl = null;
            if (typeof task.response === 'string' && task.response.startsWith('http')) {
                finalVideoUrl = task.response;
            } else if (typeof task.response === 'object' && task.response !== null) {
                finalVideoUrl = task.response.url || task.response.cdnUrl || task.response.video_url || task.response.videoUrl || null;
            }

            if (!finalVideoUrl && Array.isArray(task.response) && task.response.length > 0) {
                const first = task.response[0];
                finalVideoUrl = (typeof first === 'string') ? first : (first?.url || first?.cdnUrl || null);
            }

            if (!finalVideoUrl && task.response) {
                const responseStr = typeof task.response === 'string' ? task.response : JSON.stringify(task.response);
                const urlMatch = responseStr.match(/https?:\/\/[^\s"]+\.mp4[^\s"]*/);
                if (urlMatch) {
                    finalVideoUrl = urlMatch[0];
                }
            }

            if (finalVideoUrl) {
                return { isComplete: true, videoUrl: finalVideoUrl };
            } else {
                return { isComplete: false, error: "Task marked success but URL unavailable." };
            }
        } else if (task.successFlag === -1 || task.errorCode) {
            return { isComplete: false, error: `Error Code: ${task.errorCode} - ${task.errorMessage}` };
        }
    }

    return { isComplete: false };
}
