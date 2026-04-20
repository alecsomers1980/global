const CF_API = "https://api.cloudflare.com/client/v4";

function requireEnv() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    if (!accountId || !apiToken) {
        throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_STREAM_API_TOKEN env vars.");
    }
    return { accountId, apiToken };
}

function authHeaders(apiToken) {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
    };
}

/**
 * Pulls a video from a public URL into Cloudflare Stream.
 * Returns { uid, status } — video is async-processed; poll `getStreamStatus(uid)` for readiness.
 */
export async function createStreamFromUrl(videoUrl, metadata = {}) {
    const { accountId, apiToken } = requireEnv();
    const res = await fetch(`${CF_API}/accounts/${accountId}/stream/copy`, {
        method: "POST",
        headers: authHeaders(apiToken),
        body: JSON.stringify({
            url: videoUrl,
            meta: metadata,
        }),
    });
    const data = await res.json();
    if (!data.success) {
        const msg = data.errors?.[0]?.message || "Cloudflare Stream copy failed";
        throw new Error(msg);
    }
    return { uid: data.result.uid, status: data.result.status?.state };
}

export async function getStreamStatus(uid) {
    const { accountId, apiToken } = requireEnv();
    const res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}`, {
        headers: authHeaders(apiToken),
    });
    const data = await res.json();
    if (!data.success) {
        throw new Error(data.errors?.[0]?.message || "Failed to fetch Cloudflare stream status");
    }
    return {
        uid: data.result.uid,
        state: data.result.status?.state,
        readyToStream: data.result.readyToStream,
        duration: data.result.duration,
    };
}

/**
 * Enable MP4 download for a stream (required for Facebook/Instagram publishing).
 */
export async function enableDownloads(uid) {
    const { accountId, apiToken } = requireEnv();
    const res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}/downloads`, {
        method: "POST",
        headers: authHeaders(apiToken),
    });
    const data = await res.json();
    if (!data.success) {
        throw new Error(data.errors?.[0]?.message || "Failed to enable Cloudflare downloads");
    }
    return data.result;
}

export function getHlsUrl(uid) {
    const subdomain = process.env.CLOUDFLARE_STREAM_SUBDOMAIN;
    if (!subdomain) throw new Error("Missing CLOUDFLARE_STREAM_SUBDOMAIN env var");
    return `https://${subdomain}/${uid}/manifest/video.m3u8`;
}

export function getMp4Url(uid) {
    const subdomain = process.env.CLOUDFLARE_STREAM_SUBDOMAIN;
    if (!subdomain) throw new Error("Missing CLOUDFLARE_STREAM_SUBDOMAIN env var");
    return `https://${subdomain}/${uid}/downloads/default.mp4`;
}

export function getIframeUrl(uid) {
    const subdomain = process.env.CLOUDFLARE_STREAM_SUBDOMAIN;
    if (!subdomain) throw new Error("Missing CLOUDFLARE_STREAM_SUBDOMAIN env var");
    return `https://${subdomain}/${uid}/iframe`;
}
