export async function stitchVideosWithFal(videoUrls) {
    if (!process.env.FAL_KEY) {
        throw new Error("Missing FAL_KEY in environment variables.");
    }

    if (!videoUrls || videoUrls.length === 0) {
        throw new Error("No video URLs provided to stitcher.");
    }

    try {
        console.log(`[Stitching Service] Sending ${videoUrls.length} clips to Fal.ai FFMPEG for concatenation...`);

        // We use the Fal.ai FFMPEG Merge Videos model
        // Documentation: fal.ai/models/fal-ai/ffmpeg-api/merge-videos
        const response = await fetch("https://fal.run/fal-ai/ffmpeg-api/merge-videos", {
            method: "POST",
            headers: {
                "Authorization": `Key ${process.env.FAL_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                video_urls: videoUrls
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Stitching Service] API Error:`, errText);
            throw new Error(`Fal.ai returned status ${response.status}`);
        }

        const data = await response.json();

        if (data && data.video && data.video.url) {
            console.log(`[Stitching Service] Videos stitched successfully: ${data.video.url}`);
            return data.video.url;
        } else {
            console.error(`[Stitching Service] Unexpected response format:`, data);
            throw new Error("Invalid stitching response payload.");
        }

    } catch (error) {
        console.error("Exception in stitchVideosWithFal:", error);
        throw error;
    }
}
