/**
 * Replaces the old heygenService.js with an agnostic Image-to-Video Engine.
 * Defaulting to Veo 3.1 Fast via Kie.ai for cost-effective ($0.30/video), high-quality testing.
 */

export async function generateCinematicClips(scriptArray, carPayload) {
    if (!process.env.KIE_API_KEY) {
        throw new Error("Missing KIE_API_KEY in environment variables.");
    }

    try {
        const generatedClipUrls = [];

        // Identify the images we have
        const heroImg = carPayload.main_image_url;
        const galleryImg1 = carPayload.gallery_urls && carPayload.gallery_urls.length > 0 ? carPayload.gallery_urls[0] : heroImg;
        const galleryImg2 = carPayload.gallery_urls && carPayload.gallery_urls.length > 1 ? carPayload.gallery_urls[1] : heroImg;
        const sceneImages = [heroImg, galleryImg1, galleryImg2];

        // Process sequentially to be gentle on ratelimits, though Promise.all is possible
        for (let i = 0; i < scriptArray.length; i++) {
            const scene = scriptArray[i];
            const baseImageUrl = sceneImages[i] || heroImg;

            console.log(`[Video Engine] Requesting generation for Scene ${i + 1} via Veo 3...`);
            console.log(`[Video Engine] Scene ${i + 1} Image URL: ${baseImageUrl}`);
            console.log(`[Video Engine] Scene ${i + 1} Prompt: ${scene.visual_prompt?.substring(0, 80)}...`);

            const requestBody = {
                model: "veo3",
                prompt: scene.visual_prompt,
                imageUrls: [baseImageUrl],
                aspect_ratio: "16:9"
            };

            const startResponse = await fetch("https://api.kie.ai/api/v1/veo/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.KIE_API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            const startData = await startResponse.json();
            console.log(`[Video Engine] Scene ${i + 1} Full API Response:`, JSON.stringify(startData));

            if (!startResponse.ok) {
                console.error(`[Video Engine] API Error on Scene ${i + 1}: HTTP ${startResponse.status}`);
                throw new Error(`Video Engine returned status ${startResponse.status}: ${startData?.msg || 'Unknown error'}`);
            }

            // Handle different response structures from Kie.ai
            let taskId = null;
            if (startData?.data?.taskId) {
                taskId = startData.data.taskId;
            } else if (startData?.data?.task_id) {
                taskId = startData.data.task_id;
            } else if (startData?.taskId) {
                taskId = startData.taskId;
            } else if (typeof startData?.data === 'string') {
                taskId = startData.data;
            }

            if (!taskId) {
                console.error(`[Video Engine] Could not extract taskId. Full response:`, JSON.stringify(startData, null, 2));
                throw new Error(`Failed to get taskId from Kie.ai. Response: ${JSON.stringify(startData)}`);
            }

            console.log(`[Video Engine] Scene ${i + 1} Task ID: ${taskId}. Polling for completion...`);

            let isComplete = false;
            let finalVideoUrl = null;
            let attempts = 0;

            // Poll every 10 seconds for up to 5 minutes (30 attempts)
            while (!isComplete && attempts < 30) {
                await new Promise(r => setTimeout(r, 10000));
                attempts++;

                console.log(`[Video Engine] Scene ${i + 1} Poll attempt ${attempts}/30...`);

                const pollResponse = await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${taskId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${process.env.KIE_API_KEY}`
                    }
                });

                if (!pollResponse.ok) {
                    console.log(`[Video Engine] Poll returned HTTP ${pollResponse.status}, retrying...`);
                    continue;
                }

                const pollData = await pollResponse.json();
                console.log(`[Video Engine] Scene ${i + 1} Poll response:`, JSON.stringify(pollData));

                if (pollData && pollData.data) {
                    const task = pollData.data;

                    if (task.successFlag === 1) {
                        // Generation complete! 
                        console.log(`[Video Engine] Scene ${i + 1} COMPLETED! Extracting URL from response...`);
                        console.log(`[Video Engine] Response type: ${typeof task.response}, value:`, task.response);

                        // Extract the video URL - handle all possible Kie.ai response formats
                        if (typeof task.response === 'string' && task.response.startsWith('http')) {
                            finalVideoUrl = task.response;
                        } else if (typeof task.response === 'object' && task.response !== null) {
                            finalVideoUrl = task.response.url || task.response.cdnUrl || task.response.video_url || task.response.videoUrl || null;
                        }

                        // If response is an array, try the first element
                        if (!finalVideoUrl && Array.isArray(task.response) && task.response.length > 0) {
                            const first = task.response[0];
                            finalVideoUrl = (typeof first === 'string') ? first : (first?.url || first?.cdnUrl || null);
                        }

                        // Last resort: look for URL anywhere in the response
                        if (!finalVideoUrl && task.response) {
                            const responseStr = typeof task.response === 'string' ? task.response : JSON.stringify(task.response);
                            const urlMatch = responseStr.match(/https?:\/\/[^\s"]+\.mp4[^\s"]*/);
                            if (urlMatch) {
                                finalVideoUrl = urlMatch[0];
                            }
                        }

                        isComplete = true;
                    } else if (task.successFlag === -1 || task.errorCode) {
                        throw new Error(`Video generation failed. Error Code: ${task.errorCode} - ${task.errorMessage}`);
                    } else {
                        console.log(`[Video Engine] Scene ${i + 1} still processing (flag: ${task.successFlag})...`);
                    }
                }
            }

            if (!finalVideoUrl) {
                throw new Error(`Scene ${i + 1} timed out or failed to return a valid URL after ${attempts} poll attempts.`);
            }

            console.log(`[Video Engine] Scene ${i + 1} generated successfully: ${finalVideoUrl}`);
            generatedClipUrls.push({
                scene: i + 1,
                video_url: finalVideoUrl
            });
        }

        return generatedClipUrls; // Array of 3 mp4 URLs

    } catch (error) {
        console.error("Exception in generateCinematicClips:", error);
        throw error;
    }
}
