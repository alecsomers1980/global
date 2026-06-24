/**
 * Family lifestyle reel ("Saturday Belongs to Us") with Seedance 2 Mini (kie.ai).
 * Hero: maroon 2020 Hyundai Tucson (real in-stock). Single render = consistent
 * audio/music across all three shots. Scene 2 drives on the LEFT (South Africa).
 *
 *   cd ember-social
 *   node scripts/seedance-family.mjs
 *
 * Output: public/preview/everest-reel-family.mp4
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    const text = readFileSync(resolve(file), 'utf8')
    for (const raw of text.split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const KIE_KEY = process.env.KIE_API_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!KIE_KEY || !OPENAI_KEY) { console.error('KIE_API_KEY and OPENAI_API_KEY required'); process.exit(1) }

const BUCKET = 'campaign-media'
const GENERATE_AUDIO = true

// Approved reference stills (scene 2 uses the corrected LEFT-side still).
const REF_STILLS = ['family-shot-1.jpg', 'family-shot-2b.jpg', 'family-shot-3.jpg']

// Departure still — boot CLOSED, adult at the open DRIVER's door (not the boot).
const SHOT1_PROMPT = `Wide cinematic shot of a maroon 2020 Hyundai Tucson SUV parked in a leafy suburban White River driveway at soft golden morning light, the rear boot fully CLOSED, one South African adult standing beside the OPEN DRIVER'S door about to climb into the driver's seat, relaxed and unhurried, packed for a family day trip. Anamorphic widescreen, warm teal-and-orange cinematic grade, photorealistic, ultra-detailed, clean correct anatomy, NO text, NO logos, blank number plates.`

async function gen(prompt) {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1536x1024', quality: 'high', n: 1 }),
    })
    const d = await r.json(); if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 200))
    return Buffer.from(d.data[0].b64_json, 'base64')
}

const PROMPT = `Warm cinematic family lifestyle film, anamorphic widescreen, soft golden light, gentle teal-and-orange colour grade, photorealistic, premium and heartfelt, South African lowveld near White River, Mpumalanga. The family SUV is reference @Image 1, @Image 2 and @Image 3 — a maroon Hyundai Tucson; keep its exact maroon colour and shape throughout. IMPORTANT: this is South Africa — all driving is on the LEFT-hand side of the road, right-hand-drive vehicle.

Shot 1: The maroon Hyundai Tucson from @Image 1 sits in a leafy White River driveway in soft golden morning light with the boot CLOSED. An adult opens the DRIVER'S side door and climbs into the driver's seat — entering through the side door, NEVER through the boot, nobody touches the boot — then the SUV reverses gently out of the driveway and drives away. Warm, unhurried, smooth camera tracking.

Shot 2: The maroon Hyundai Tucson from @Image 2 drives along a scenic green Panorama Route mountain curve, STAYING IN THE LEFT LANE for the entire shot and NEVER changing lanes or crossing to the right side (South Africa drives on the left; the road's centre line stays on the car's right). Smooth sweeping cinematic tracking shot keeping pace, morning mist lifting off the escarpment.

Shot 3: The maroon Hyundai Tucson from @Image 3 is parked at a clifftop picnic lookout in warm afternoon light, two adults and a small child step out and walk together toward the edge to take in the vast misty valley, the camera glides slowly past the vehicle to reveal the sweeping view. Warm, joyful, end on the vista.`

async function upload(name, bytes) {
    const path = `seedance-refs/${Date.now()}-${name}`
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST',
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: bytes,
    })
    if (!r.ok) throw new Error(`upload ${name}: ${r.status}`)
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`
}

async function createTask(urls) {
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KIE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'bytedance/seedance-2-mini',
            input: { prompt: PROMPT, reference_image_urls: urls, generate_audio: GENERATE_AUDIO, resolution: '720p', aspect_ratio: '16:9', duration: 15, web_search: false, nsfw_checker: true },
        }),
    })
    const data = await r.json()
    if (data.code !== 200 || !data.data?.taskId) throw new Error(`createTask: ${JSON.stringify(data).slice(0, 300)}`)
    return data.data.taskId
}

async function poll(taskId) {
    const started = Date.now()
    while (Date.now() - started < 12 * 60 * 1000) {
        await new Promise(r => setTimeout(r, 12000))
        const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: { Authorization: `Bearer ${KIE_KEY}` } })
        const data = await r.json()
        const st = data.data?.state
        console.log(`  state=${st} (${Math.round((Date.now() - started) / 1000)}s)`)
        if (st === 'success') {
            const url = JSON.parse(data.data.resultJson || '{}').resultUrls?.[0]
            if (!url) throw new Error('success but no resultUrls')
            return url
        }
        if (st === 'fail') throw new Error(`task failed: ${data.data?.failMsg || data.data?.failCode}`)
    }
    throw new Error('timed out')
}

console.log('Regenerating departure still (boot closed, door entry)...')
try { writeFileSync(resolve('public/preview/family-shot-1.jpg'), await gen(SHOT1_PROMPT)) }
catch (e) { console.log(`  still-gen unavailable (${e.message.slice(0, 70)}) — using existing family-shot-1.jpg; door fix relies on the prompt`) }

console.log('Uploading reference stills...')
const urls = []
for (const name of REF_STILLS) {
    const bytes = readFileSync(resolve('public/preview', name))
    const u = await upload(name.replace(/\.\w+$/, ''), bytes)
    console.log(`  ${name} -> ${u}`)
    urls.push(u)
}

console.log('Creating Seedance 2 Mini task (single render, consistent audio)...')
const taskId = await createTask(urls)
console.log(`  taskId=${taskId}`)

console.log('Waiting for render...')
const videoUrl = await poll(taskId)
console.log(`Render done: ${videoUrl}`)

const buf = Buffer.from(await (await fetch(videoUrl)).arrayBuffer())
const out = resolve('public/preview/everest-reel-family.mp4')
writeFileSync(out, buf)
console.log(`\nSaved ${out} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`)
