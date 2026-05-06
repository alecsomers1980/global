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
            downloadable: true,
        }),
    });
    const data = await res.json();
    if (!data.success) {
        const msg = data.errors?.[0]?.message || "Cloudflare Stream copy failed";
        throw new Error(msg);
    }

    // Enable MP4 downloads (required for Facebook/Instagram publishing)
    const uid = data.result.uid;
    try {
        await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}/downloads`, {
            method: "POST",
            headers: authHeaders(apiToken),
        });
    } catch (err) {
        console.warn(`[CF Stream] Failed to enable downloads for ${uid}:`, err.message);
    }

    return { uid, status: data.result.status?.state };
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

/**
 * Deletes a Cloudflare Stream entry. Returns true if removed (or already gone),
 * false on transient failure. Never throws — callers should treat CF cleanup as
 * best-effort: a failure here must not block deleting the parent car record.
 */
export async function deleteStream(uid) {
    if (!uid) return true;
    try {
        const { accountId, apiToken } = requireEnv();
        const res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${apiToken}` },
        });
        // 200/204 = deleted, 404 = already gone; both are success
        if (res.status === 200 || res.status === 204 || res.status === 404) return true;
        const text = await res.text().catch(() => "");
        console.warn(`[CF Stream] delete ${uid} returned ${res.status}: ${text.slice(0, 200)}`);
        return false;
    } catch (err) {
        console.warn(`[CF Stream] delete ${uid} threw: ${err.message}`);
        return false;
    }
}

/**
 * Helper: if `videoUrl` is in `cf:<uid>` form, delete that CF Stream entry.
 * Anything else (null, error states, mux:, etc.) is a no-op.
 */
export async function deleteStreamFromVideoUrl(videoUrl) {
    if (typeof videoUrl !== "string" || !videoUrl.startsWith("cf:")) return true;
    const uid = videoUrl.split(":")[1];
    return deleteStream(uid);
}
