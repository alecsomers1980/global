/**
 * Replace ONLY scene 2 of the family reel with a corrected clip where the Tucson
 * drives on the LEFT (South African traffic). Splices between the untouched
 * scenes 1 and 3.  Run with --still-only first to verify the reference still.
 *
 *   cd ember-social
 *   node scripts/fix-family-scene2.mjs --still-only   # generate + view the still
 *   node scripts/fix-family-scene2.mjs                # full: seedance + splice
 *
 * Output: public/preview/everest-reel-family-fixed.mp4
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import ffmpegPath from 'ffmpeg-static'

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
const OPENAI_KEY = process.env.OPENAI_API_KEY, KIE_KEY = process.env.KIE_API_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL, SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STILL_ONLY = process.argv.includes('--still-only')

const FAMILY = resolve('public/preview/everest-reel-family.mp4')
const OUT = resolve('public/preview/everest-reel-family-fixed.mp4')
const TMP = join(process.env.TEMP || '/tmp', 'everest-fix2')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })
const ff = (a) => execFileSync(ffmpegPath, ['-y', ...a], { stdio: 'inherit' })

const T1 = 5.38, T2 = 9.71, SEG2 = +(T2 - T1).toFixed(2)  // scene-2 window

const TAIL = 'cinematic anamorphic widescreen film still, shot on ARRI Alexa, 40mm anamorphic lens, shallow depth of field, warm golden-hour light, gentle haze, soft lens flare, teal-and-orange grade, photorealistic, NO text, NO logos, blank number plates'

const STILL_PROMPT = `Wide cinematic three-quarter rear shot of a maroon 2020 Hyundai Tucson SUV driving along a scenic green Panorama Route mountain pass in Mpumalanga, South Africa. IMPORTANT: South African road — the car drives on the LEFT-hand side of the road and hugs the LEFT lane, the broken white centre line is to the RIGHT of the car, the empty oncoming lane is on the right, a safety barrier and grassy verge on the left. Morning mist lifting off the lush escarpment, the road curving into misty blue mountains ahead, golden light, sense of journey. NO people outside the car. ${TAIL}`

const VIDEO_PROMPT = `The maroon Hyundai Tucson from @Image 1 drives along a scenic green Panorama Route mountain pass in South Africa. The car keeps to the LEFT-hand side of the road (South Africa drives on the LEFT), staying in the left lane with the road's centre line on its right side. Smooth cinematic tracking shot following from behind, morning mist lifting off the escarpment, golden light, real forward driving motion.`

async function genStill() {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-image-1', prompt: STILL_PROMPT, size: '1536x1024', quality: 'high', n: 1 }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(`image: ${JSON.stringify(d).slice(0, 300)}`)
    return Buffer.from(d.data[0].b64_json, 'base64')
}
async function upload(bytes) {
    const path = `seedance-refs/${Date.now()}-family-shot-2b.jpg`
    const r = await fetch(`${SB_URL}/storage/v1/object/campaign-media/${path}`, {
        method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
        body: bytes,
    })
    if (!r.ok) throw new Error(`upload: ${r.status}`)
    return `${SB_URL}/storage/v1/object/public/campaign-media/${path}`
}
async function seedance(url) {
    const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST', headers: { Authorization: `Bearer ${KIE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'bytedance/seedance-2-mini', input: { prompt: VIDEO_PROMPT, reference_image_urls: [url], generate_audio: true, resolution: '720p', aspect_ratio: '16:9', duration: 6, web_search: false, nsfw_checker: true } }),
    })
    const d = await r.json()
    if (d.code !== 200 || !d.data?.taskId) throw new Error(`createTask: ${JSON.stringify(d).slice(0, 300)}`)
    const id = d.data.taskId, started = Date.now()
    while (Date.now() - started < 12 * 60 * 1000) {
        await new Promise(x => setTimeout(x, 12000))
        const rr = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${id}`, { headers: { Authorization: `Bearer ${KIE_KEY}` } })
        const dd = await rr.json(); const st = dd.data?.state
        console.log(`  state=${st} (${Math.round((Date.now() - started) / 1000)}s)`)
        if (st === 'success') return JSON.parse(dd.data.resultJson || '{}').resultUrls?.[0]
        if (st === 'fail') throw new Error(`fail: ${dd.data?.failMsg || dd.data?.failCode}`)
    }
    throw new Error('timeout')
}

const NORM = 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:black,setsar=1,fps=24,format=yuv420p'

console.log('Generating corrected scene-2 still (car on the LEFT)...')
const stillBytes = await genStill()
writeFileSync(resolve('public/preview/family-shot-2b.jpg'), stillBytes)
console.log('  saved public/preview/family-shot-2b.jpg')
if (STILL_ONLY) { console.log('STILL_ONLY — stopping so you can verify the still.'); process.exit(0) }

const refUrl = await upload(stillBytes)
console.log(`  uploaded -> ${refUrl}`)
console.log('Rendering corrected scene 2 with Seedance...')
const vurl = await seedance(refUrl)
const scene2 = join(TMP, 'scene2.mp4')
writeFileSync(scene2, Buffer.from(await (await fetch(vurl)).arrayBuffer()))
console.log('  scene2 downloaded')

// Build 3 normalised segments and concat.
const segA = join(TMP, 'segA.mp4'), segB = join(TMP, 'segB.mp4'), segC = join(TMP, 'segC.mp4')
console.log('Cutting scene 1 (keep), new scene 2, scene 3 (keep)...')
ff(['-i', FAMILY, '-t', String(T1), '-vf', NORM, '-af', 'aresample=32000', '-ac', '2', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-ar', '32000', segA])
ff(['-i', scene2, '-t', String(SEG2), '-vf', NORM, '-af', 'aresample=32000', '-ac', '2', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-ar', '32000', segB])
ff(['-ss', String(T2), '-i', FAMILY, '-vf', NORM, '-af', 'aresample=32000', '-ac', '2', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-ar', '32000', segC])

console.log('Splicing...')
ff(['-i', segA, '-i', segB, '-i', segC, '-filter_complex',
    '[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]',
    '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-c:a', 'aac', '-pix_fmt', 'yuv420p', OUT])
console.log(`\nDone → ${OUT}`)
