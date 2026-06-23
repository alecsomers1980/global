/**
 * Landscape (16:9-friendly) cinematic stills of REAL in-stock Everest vehicles,
 * for the lifestyle brand reel. No logo overlay — branding lives on the end-card.
 *
 *   cd ember-social
 *   node scripts/gen-video-stills.mjs
 *
 * Output: public/preview/video-shot-1.jpg ... video-shot-6.jpg  (1536x1024)
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
const OPENAI_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1) }

const TAIL = 'cinematic anamorphic widescreen film still, shot on ARRI Alexa with a 40mm anamorphic lens, shallow depth of field, dramatic low golden-hour sun, volumetric haze and dust in the air, gentle lens flare, rich cinematic teal-and-orange colour grade, photorealistic, ultra-detailed, strong sense of motion, NO text, NO words, NO logos, NO watermark, blank number plates'

const SHOTS = [
    {
        name: 'video-shot-1',
        title: 'Land Cruiser 79 — dust approach',
        prompt: `Low wide hero angle of a silver 2019 Toyota Land Cruiser 79 single-cab bakkie (boxy rugged 4x4, round headlights) driving fast straight toward camera on a dusty lowveld gravel road in Mpumalanga, South Africa, a huge billowing dust cloud trailing behind it, late golden sun flaring behind, motion blur on the spinning wheels, dry bushveld and acacia trees blurred either side. ${TAIL}`,
    },
    {
        name: 'video-shot-2',
        title: 'Tyre detail — gravel spray',
        prompt: `Extreme low close-up of a chunky all-terrain 4x4 tyre tearing through loose gravel, an explosive spray of dust and small stones backlit by a low golden sun, intense motion energy, shallow focus, dry lowveld road. NO full vehicle visible, NO people. ${TAIL}`,
    },
    {
        name: 'video-shot-3',
        title: 'Discovery 4 — clifftop reveal',
        prompt: `Wide establishing shot of a black 2016 Land Rover Discovery 4 SUV (boxy premium 7-seater, stepped roofline) parked on a Panorama Route clifftop edge at golden hour, the vast Blyde River Canyon and misty escarpment cliffs sweeping away behind it in Mpumalanga, South Africa, dramatic depth, low warm sun, the vehicle small in the lower third. NO people. ${TAIL}`,
    },
    {
        name: 'video-shot-4',
        title: 'Hilux Raider — tree-line tracking',
        prompt: `Dynamic side-profile tracking shot of a silver 2024 Toyota Hilux Raider double-cab bakkie driving along a bushveld two-track trail in the South African lowveld, low golden sun strobing through a line of acacia trees casting long shadows across the vehicle, light dust kicking up, sense of speed. NO people. ${TAIL}`,
    },
    {
        name: 'video-shot-5',
        title: 'T-Roc — mountain pass sweep',
        prompt: `High three-quarter rear shot of a white 2021 Volkswagen T-Roc compact crossover SUV sweeping around a tight curve on a winding Panorama Route mountain pass in Mpumalanga, South Africa, lush green escarpment dropping away, the road snaking into misty blue mountains ahead, golden-hour light. NO people. ${TAIL}`,
    },
    {
        name: 'video-shot-6',
        title: 'Discovery 4 — hero flare detail',
        prompt: `Dramatic low front-three-quarter hero detail of a black 2016 Land Rover Discovery 4 SUV parked on a lowveld ridge at golden hour, a brilliant sun-star flare bursting over the bonnet and grille, rim light tracing the body lines, dust motes in the warm air, deep shadows. NO people. ${TAIL}`,
    },
]

async function genImage(prompt) {
    const body = { model: 'gpt-image-1', prompt, size: '1536x1024', quality: 'high', n: 1 }
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const raw = await r.text()
    let data
    try { data = JSON.parse(raw) } catch { throw new Error('Non-JSON: ' + raw.slice(0, 300)) }
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(data).slice(0, 400)}`)
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) throw new Error('No image: ' + JSON.stringify(data).slice(0, 400))
    return Buffer.from(b64, 'base64')
}

for (const s of SHOTS) {
    try {
        console.log(`Generating: ${s.title} ...`)
        const buf = await genImage(s.prompt)
        const out = resolve(`public/preview/${s.name}.jpg`)
        writeFileSync(out, buf)
        console.log(`  Saved ${out}`)
        await new Promise(r => setTimeout(r, 600))
    } catch (e) {
        console.error(`  FAILED ${s.name}: ${e.message}`)
    }
}
console.log('Done.')
