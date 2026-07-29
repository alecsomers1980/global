// Wraps kie.ai's Seedance 2 Mini API (same endpoints scripts/seedance-family.mjs
// uses). Unlike that script's poll() — which blocks in a loop for up to 12
// minutes — pollSeedanceTask() checks ONCE and returns immediately, so the
// cron can call it once per tick and let state persist in posts.video_task_id
// across ticks instead of blocking a single request.

const KIE_KEY = process.env.KIE_API_KEY

export async function submitSeedanceTask(prompt: string, referenceImageUrls: string[], aspect: '16:9' | '9:16'): Promise<string> {
    if (!KIE_KEY) throw new Error('KIE_API_KEY not set')
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KIE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'bytedance/seedance-2-mini',
            input: {
                prompt,
                reference_image_urls: referenceImageUrls,
                generate_audio: true,
                resolution: '720p',
                aspect_ratio: aspect,
                duration: 15,
                web_search: false,
                nsfw_checker: true,
            },
        }),
    })
    const data = await r.json()
    if (data.code !== 200 || !data.data?.taskId) throw new Error(`createTask failed: ${JSON.stringify(data).slice(0, 300)}`)
    return data.data.taskId
}

export async function pollSeedanceTask(taskId: string): Promise<{ state: 'processing' | 'success' | 'fail'; videoUrl?: string; failMsg?: string }> {
    if (!KIE_KEY) throw new Error('KIE_API_KEY not set')
    const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${KIE_KEY}` },
    })
    const data = await r.json()
    const st = data.data?.state
    if (st === 'success') {
        const url = JSON.parse(data.data.resultJson || '{}').resultUrls?.[0]
        if (!url) return { state: 'fail', failMsg: 'success but no resultUrls' }
        return { state: 'success', videoUrl: url }
    }
    if (st === 'fail') return { state: 'fail', failMsg: data.data?.failMsg || data.data?.failCode || 'unknown failure' }
    return { state: 'processing' }
}
