/**
 * Seedance 2 Fast (via kie.ai) image-to-video wrapper.
 * Used for post-sale handover clips: delivery photo -> 8-second cinematic video.
 */

const DEV_MOCK_MODE = false; // Set to true during local development to bypass real API calls and return mock data

const KIE_API_BASE = 'https://api.kie.ai/api/v1';
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 3000;

function getApiKey() {
    const key = process.env.KIE_API_KEY;
    if (!key && !DEV_MOCK_MODE) {
        throw new Error('KIE_API_KEY environment variable is required but not set');
    }
    return key;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startSeedanceClip({
    imageUrl,
    prompt,
    durationSeconds = 8,
    aspectRatio = '9:16',
    resolution = '720p',
    generateAudio = false
}) {
    if (DEV_MOCK_MODE) {
        console.log(`[seedanceService] DEV_MOCK_MODE active — returning mock taskId`);
        return { taskId: `mock-seedance-${Date.now()}` };
    }

    const apiKey = getApiKey();

    const requestBody = {
        model: 'bytedance/seedance-2-fast',
        input: {
            prompt,
            reference_image_urls: [imageUrl],
            duration: durationSeconds,
            aspect_ratio: aspectRatio,
            resolution,
            generate_audio: generateAudio
        }
    };

    console.log(`[seedanceService] Starting Seedance clip with prompt: "${prompt.slice(0, 80)}..."`);

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[seedanceService] Attempt ${attempt}/${MAX_RETRIES} — POST createTask`);

            const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            console.log(`[seedanceService] createTask response status=${response.status} code=${data.code} msg=${data.msg}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
            }

            if (data.code !== 200) {
                const isHeavyLoad = (data.msg || '').toLowerCase().includes('under heavy load');
                if (isHeavyLoad) {
                    throw new Error(`Kie API under heavy load: ${data.msg}`);
                }
                throw new Error(`Kie API error code=${data.code} msg=${data.msg}`);
            }

            const taskId = data.data?.taskId;
            if (!taskId) {
                throw new Error(`No taskId returned in response: ${JSON.stringify(data)}`);
            }

            console.log(`[seedanceService] Successfully created task: ${taskId}`);
            return { taskId };
        } catch (err) {
            lastError = err;
            console.warn(`[seedanceService] Attempt ${attempt} failed: ${err.message}`);

            const isRetriable =
                err.message.includes('under heavy load') ||
                err.message.startsWith('HTTP 5') ||
                err.message.includes('Kie API error code=');

            if (attempt < MAX_RETRIES && isRetriable) {
                const delay = RETRY_BACKOFF_MS * attempt;
                console.log(`[seedanceService] Retrying in ${delay}ms...`);
                await sleep(delay);
            } else if (!isRetriable) {
                console.error(`[seedanceService] Non-retriable error, giving up immediately`);
                throw lastError;
            }
        }
    }

    console.error(`[seedanceService] All ${MAX_RETRIES} attempts exhausted`);
    throw lastError;
}

export async function pollSeedanceClip(taskId) {
    if (DEV_MOCK_MODE && taskId.startsWith('mock-seedance')) {
        console.log(`[seedanceService] DEV_MOCK_MODE active — returning mock completed result for ${taskId}`);
        return {
            isComplete: true,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
        };
    }

    try {
        const apiKey = getApiKey();

        const response = await fetch(
            `${KIE_API_BASE}/jobs/recordInfo?taskId=${taskId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            }
        );

        const data = await response.json();
        console.log(`[seedanceService] recordInfo for ${taskId} — state=${data.data?.state}`);

        if (!response.ok) {
            console.warn(`[seedanceService] Non-OK response while polling ${taskId}: HTTP ${response.status}`);
            return { isComplete: false };
        }

        const taskData = data.data;
        const state = taskData?.state;

        if (state === 'success') {
            let videoUrl = null;
            try {
                const resultJson = JSON.parse(taskData.resultJson);
                videoUrl = resultJson.resultUrls?.[0] || null;
            } catch (parseErr) {
                console.warn(`[seedanceService] Failed to parse resultJson for ${taskId}: ${parseErr.message}`);
            }

            if (!videoUrl) {
                console.warn(`[seedanceService] No video URL found in result for ${taskId}`);
                return { isComplete: false };
            }

            console.log(`[seedanceService] Task ${taskId} complete — videoUrl=${videoUrl}`);
            return { isComplete: true, videoUrl };
        }

        if (state === 'fail') {
            const errorMsg = taskData.failMsg || taskData.failCode || 'Generation failed';
            console.warn(`[seedanceService] Task ${taskId} failed: ${errorMsg}`);
            return { isComplete: false, error: errorMsg };
        }

        return { isComplete: false };
    } catch (err) {
        console.warn(`[seedanceService] Network/polling error for ${taskId}: ${err.message}`);
        return { isComplete: false };
    }
}

export const SEEDANCE_STYLE_PROMPTS = {
    timelapse: `Cinematic 8-second sequence. Seconds 0-2: The camera holds steady on the subjects in daylight. Seconds 2-6: A rapid hyper-lapse effect begins; clouds race across the sky, shadows lengthen rapidly, and the sun sets in fast-forward. Seconds 6-8: The time-lapse stops smoothly at dusk, the car's headlights and taillights illuminate brightly against the dark environment. Photorealistic, 4k.`,
    showroom: `8-second cinematic lighting transformation. The environment starts as a standard bright dealership. Over the next 3 seconds, the background lights forcefully shut off row by row from back to front, plunging the background into deep, cinematic blackness. The final 3 seconds feature a slow, creeping push-in as a single, dramatic overhead softbox illuminates only the client and the car's metallic paint. 8k resolution, commercial aesthetic.`,
    orbit: `Dynamic FPV drone shot, 8 seconds total. The camera begins with a slow pan, then suddenly accelerates into a high-speed, motion-blurred 180-degree orbit around the client and the car. Halfway through, the camera speed-ramps into extreme, buttery slow-motion. The environment reflects dramatically in the car's paint during the slow-motion phase. Action camera style, wide-angle lens, hyper-realistic.`,
};

export const SEEDANCE_STYLES = [
    {
        key: 'timelapse',
        label: 'Day-to-Night Time-Lapse',
        tagline: 'Best for outside handovers',
        description: 'Clouds race, sun sets, headlights bloom. The car as an enduring monument.',
    },
    {
        key: 'showroom',
        label: 'Showroom Blackout',
        tagline: 'Best for dealership floors',
        description: 'Lights shut off row-by-row into a dramatic spotlight reveal.',
    },
    {
        key: 'orbit',
        label: 'Speed Ramp Orbit',
        tagline: 'High-energy, edgy',
        description: 'FPV drone whip-pan into buttery slow-motion around client + car.',
    },
];
