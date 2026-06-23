/**
 * 4 premium lifestyle example posts for Everest Motoring — NO headline text on image.
 * Only a small, subtle logo top-left. Editorial golden-hour SA photography.
 *
 *   cd ember-social
 *   node scripts/preview-lifestyle-examples.mjs
 *
 * Output: public/preview/lifestyle-ex-1.jpg ... lifestyle-ex-4.jpg
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

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

const OPENAI_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1) }

const LOGO_PATH = 'public/images/logo.png'
const TAIL = 'shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, warm editorial film grade, RAW photograph, editorial commercial automotive photography, photorealistic, sharp focus, cinematic wide negative space, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, NO text, NO words, NO captions, NO logos, NO watermark, blank number plates'

// Real in-stock Everest Motoring vehicles (pulled from live inventory). Premium lifestyle, "what the car can do".
const SHOTS = [
    {
        name: 'lifestyle-ex-1',
        title: '2016 Black Land Rover Discovery 4 — Panorama Route viewpoint',
        prompt: `A photorealistic black 2016 Land Rover Discovery 4 SUV (boxy premium 7-seater SUV with stepped roofline and distinctive Land Rover front grille) parked at a Panorama Route mountain lookout in Mpumalanga, South Africa, at golden hour. Mid-winter dry-season light, low mist filling the valley far below, dramatic escarpment cliffs. The vehicle sits medium-small in the lower third of the frame, lots of sky and landscape above for a clean premium look. NO people. ${TAIL}`,
    },
    {
        name: 'lifestyle-ex-2',
        title: '2019 Silver Toyota Land Cruiser 79 — lowveld dust road',
        prompt: `A photorealistic silver 2019 Toyota Land Cruiser 79 single-cab bakkie (boxy rugged utilitarian 4x4 with round headlights and flat bonnet) driving on a dusty gravel farm road in the White River lowveld, South Africa, late golden afternoon. A soft dust trail kicks up behind, warm low winter sun, bushwillow trees and dry grass, big open sky. Wide cinematic composition, vehicle in lower 40% of frame. NO people. ${TAIL}`,
    },
    {
        name: 'lifestyle-ex-3',
        title: '2024 Silver Toyota Hilux Raider D-Cab — coffee with a view (2 people)',
        prompt: `A photorealistic silver 2024 Toyota Hilux Raider double-cab bakkie parked at a Hazyview escarpment lookout in Mpumalanga, South Africa, at golden hour. Two relaxed South African adults (authentic mix of ethnicities, no more than two people total) stand at the open tailgate holding coffee mugs, looking out over the misty valley. Warm intimate lifestyle moment, vehicle and people in lower half, expansive view above. ${TAIL}`,
    },
    {
        name: 'lifestyle-ex-4',
        title: '2021 White VW T-Roc — Panorama mountain pass',
        prompt: `A photorealistic white 2021 Volkswagen T-Roc compact crossover SUV on a winding mountain pass on the Panorama Route in Mpumalanga, South Africa, at golden hour. Lush escarpment greenery, sweeping road curve, soft winter light, aspirational premium travel feeling. Vehicle in lower 45% of the frame, scenery above. NO people. ${TAIL}`,
    },
    {
        name: 'texture-dust',
        title: 'Dust / tyre texture (no car) — for video mid-segment',
        prompt: `A photorealistic low close-up of a chunky 4x4 all-terrain tyre biting into a corrugated gravel road, a plume of warm dust kicking up behind it, golden-hour backlight catching the dust particles, dry lowveld grass blurred in the background. Cinematic shallow depth of field, motion energy. NO full vehicle visible, NO people. ${TAIL}`,
    },
]

async function genImage(prompt) {
    const body = { model: 'gpt-image-1', prompt, size: '1024x1536', quality: 'high', n: 1 }
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const raw = await r.text()
    let data
    try { data = JSON.parse(raw) } catch { throw new Error('Non-JSON response: ' + raw.slice(0, 300)) }
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(data).slice(0, 400)}`)
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) throw new Error('No image in response: ' + JSON.stringify(data).slice(0, 400))
    return Buffer.from(b64, 'base64')
}

// Subtle logo top-left at ~12% width (smaller than the sales templates — premium/restrained).
async function compositeLogoSubtle(baseBuf) {
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width
    const logoW = Math.round(W * 0.12)
    const logo = await sharp(LOGO_PATH).resize({ width: logoW, fit: 'inside' }).png().toBuffer()
    const inset = Math.round(W * 0.035)
    return sharp(baseBuf).composite([{ input: logo, top: inset, left: inset }]).jpeg({ quality: 92 }).toBuffer()
}

for (const shot of SHOTS) {
    try {
        console.log(`Generating: ${shot.title} ...`)
        const base = await genImage(shot.prompt)
        const final = await compositeLogoSubtle(base)
        const out = resolve(`public/preview/${shot.name}.jpg`)
        writeFileSync(out, final)
        const meta = await sharp(final).metadata()
        console.log(`  Saved ${out} (${meta.width}x${meta.height})`)
        await new Promise(r => setTimeout(r, 600))
    } catch (e) {
        console.error(`  FAILED ${shot.name}: ${e.message}`)
    }
}
console.log('Done.')
