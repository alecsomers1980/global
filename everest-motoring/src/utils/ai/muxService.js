import Mux from "@mux/mux-node";

// Initialize Mux with the API keys from our environment
const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET
});

/**
 * Takes a raw public .mp4 URL (like the one returned by HeyGen) 
 * and ingests it into Mux for HLS streaming.
 */
export async function createMuxAssetFromUrl(videoUrl, carId) {
    if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
        throw new Error("Missing Mux environment variables.");
    }

    try {
        const asset = await mux.video.assets.create({
            input: videoUrl,
            playback_policy: ["public"],
            // Passthrough allows us to identify what this asset is for in the Mux Dashboard
            passthrough: `car_id_${carId}`
        });

        // The asset immediately generates a playback ID even while it is "preparing"
        // This is the string we will save to our Supabase database.
        const playbackId = asset.playback_ids && asset.playback_ids.length > 0
            ? asset.playback_ids[0].id
            : null;

        return {
            assetId: asset.id,
            playbackId: playbackId,
            status: asset.status
        };
    } catch (error) {
        console.error("Error creating Mux Asset:", error);
        throw error;
    }
}
