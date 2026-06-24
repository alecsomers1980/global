/**
 * Generate a REAL moving-car cinematic lifestyle reel with Seedance 2 Mini (kie.ai).
 * Uses our generated stills as reference frames; the model animates actual motion
 * (cars driving into the sunset, dust & gravel on dirt roads).
 *
 * Leaves the per-car walkaround pipeline untouched.
 *
 *   cd ember-social
 *   node scripts/seedance-reel.mjs
 *
 * Requires KIE_API_KEY in .env.local.
 * Output: public/preview/everest-reel-seedance.mp4
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    const text = readFileSync(resolve(file), 'utf8')
    for (const rawLine of text.split('\n')) {
        const line = rawLine.replace(/\r$/, '')
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const KIE_KEY = process.env.KIE_API_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KIE_KEY) { console.error('KIE_API_KEY missing in .env.local'); process.exit(1) }

const BUCKET = 'campaign-media'
const GENERATE_AUDIO = true   // engine/dust ambience; flip to false to add your own music in CapCut
const ASPECT = process.env.ASPECT || '16:9'   // set ASPECT=9:16 for the vertical IG/TikTok cut

// Reference stills → @Image 1..3 in the prompt (order matters).
const REFS = ['video-shot-1.jpg', 'video-shot-4.jpg', 'video-shot-3.jpg']

const PROMPT = `Cinematic automotive lifestyle film, anamorphic widescreen, real golden-hour South African lowveld, rich teal-and-orange colour grade, photorealistic, premium and aspirational, strong realistic motion, lens flares, volumetric dust. The vehicles are reference @Image 1, @Image 2 and @Image 3 — keep each vehicle's exact make, model, colour and shape.

Shot 1: The silver Toyota Land Cruiser 79 single-cab bakkie from @Image 1 accelerates away down a dusty gravel road straight into a low golden sunset, thick dust and loose gravel spraying up behind the fast-spinning wheels, camera tracking low and close behind the bakkie, heat shimmer, strong lens flare. Real driving motion.

Shot 2: The silver Toyota Hilux Raider double-cab from @Image 2 races along a bushveld dirt two-track, dynamic side tracking shot keeping pace with the moving truck, low sun strobing through acacia trees, a long trail of dust billowing behind, sense of speed and freedom.

Shot 3: The black Land Rover Discovery 4 from @Image 3 drives up and rolls to a stop on a clifftop overlooking the vast misty Blyde River Canyon at sunset, the camera glides slowly past the vehicle to reveal the enormous canyon and escarpment, settling dust catching the golden light. End on the sweeping vista.`

// Vertical cut: swap the widescreen framing language for tall 9:16 social-reel framing.
const FINAL_PROMPT = ASPECT === '9:16'
    ? PROMPT.replace('anamorphic widescreen', 'vertical 9:16 portrait framing for Instagram Reels and TikTok, tall composition, subject centred')
    : PROMPT

async function uploadStill(name) {
    const bytes = readFileSync(resolve('public/preview', name))
    const path = `seedance-refs/${Date.now()}-${name}`
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: bytes,
    })
    if (!r.ok) throw new Error(`upload ${name} failed: ${r.status} ${(await r.text()).slice(0, 200)}`)
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

async function createTask(imageUrls) {
    const body = {
        model: 'bytedance/seedance-2-mini',
        input: {
            prompt: FINAL_PROMPT,
            reference_image_urls: imageUrls,
            generate_audio: GENERATE_AUDIO,
            resolution: '720p',
            aspect_ratio: ASPECT,
            duration: 15,
            web_search: false,
            nsfw_checker: true,
        },
    }
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KIE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await r.json()
    if (data.code !== 200 || !data.data?.taskId) throw new Error(`createTask: ${JSON.stringify(data).slice(0, 300)}`)
    return data.data.taskId
}

async function poll(taskId) {
    const started = Date.now()
    while (Date.now() - started < 12 * 60 * 1000) {
        await new Promise(r => setTimeout(r, 12000))
        const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
            headers: { Authorization: `Bearer ${KIE_KEY}` },
        })
        const data = await r.json()
        const st = data.data?.state
        process.stdout.write(`  state=${st} (${Math.round((Date.now() - started) / 1000)}s)\n`)
        if (st === 'success') {
            const res = JSON.parse(data.data.resultJson || '{}')
            const url = res.resultUrls?.[0]
            if (!url) throw new Error('success but no resultUrls')
            return url
        }
        if (st === 'fail') throw new Error(`task failed: ${data.data?.failMsg || data.data?.failCode || 'unknown'}`)
    }
    throw new Error('timed out waiting for Seedance task')
}

console.log('Uploading reference stills to public bucket...')
const urls = []
for (const name of REFS) { const u = await uploadStill(name); console.log(`  ${name} -> ${u}`); urls.push(u) }

console.log('Creating Seedance 2 Mini task...')
const taskId = await createTask(urls)
console.log(`  taskId=${taskId}`)

console.log('Waiting for render (this can take a few minutes)...')
const videoUrl = await poll(taskId)
console.log(`Render done: ${videoUrl}`)

console.log('Downloading...')
const vr = await fetch(videoUrl)
const buf = Buffer.from(await vr.arrayBuffer())
const out = resolve(`public/preview/everest-reel-seedance${ASPECT === '9:16' ? '-vertical' : ''}.mp4`)
writeFileSync(out, buf)
console.log(`\nSaved ${out} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)
