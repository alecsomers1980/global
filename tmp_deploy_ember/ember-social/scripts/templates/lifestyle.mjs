// Lifestyle template — minimal brand voice.
// Real vehicle in a stunning SA landscape, ONE headline top-right with ONE yellow accent word.
// Logo top-left. NO price box, NO CTA banner.
// Matches reference posts #3 (BUILT FOR THE WEEKENDS) and #6 (Discovery splashing).

import sharp from 'sharp'
import { generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot, vehicleUrl } from './common.mjs'
import { lifestyleCaption, lifestyleHashtags } from './captions.mjs'

const LIFESTYLE_HEADLINES = [
    { lines: ['BUILT FOR', 'THE WEEKENDS.'], accent: 'WEEKENDS', subhead: 'that turn into something more', subheadAccent: 'more' },
    { lines: ['MILES TO', 'EXPLORE.'], accent: 'MILES', subhead: 'your road. your rules.', subheadAccent: 'your' },
    { lines: ['ADVENTURE', 'AWAITS.'], accent: 'ADVENTURE', subhead: null, subheadAccent: null },
    { lines: ['OWN THE', 'OPEN ROAD.'], accent: 'OWN', subhead: null, subheadAccent: null },
    { lines: ['DRIVE BOLD.'], accent: 'BOLD', subhead: 'wherever it takes you.', subheadAccent: 'wherever' },
]

function pickHeadline(car) {
    const hash = String(car.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return LIFESTYLE_HEADLINES[hash % LIFESTYLE_HEADLINES.length]
}

function modelMain(car) {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr.split(/\s+/)[0]
}

function modelTrim(car) {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    const main = modelStr.split(/\s+/)[0]
    return modelStr.replace(main, '').trim()
}

function randomLocation(opts) {
    return opts[Math.floor(Math.random() * opts.length)]
}

function isSUV(car) {
    const suvKeywords = ['suv', '4x4', 'discovery', 'hilux', 'fortuner', 'prado', 'land cruiser', 'ranger', 'everest', 'x5', 'x3', 'tiguan', 'touareg', 'q5', 'q7', 'glc', 'gle', 'x-trail', 'patrol', 'pajero', 'trailblazer', 'trail boss', 'frontier']
    const str = `${car.make} ${car.model}`.toLowerCase()
    return suvKeywords.some(k => str.includes(k))
}

function buildPrompt(car) {
    const mm = modelMain(car)
    const mt = modelTrim(car)
    const suv = isSUV(car)

    let location
    if (suv) {
        location = randomLocation([
            'the Drakensberg foothills with dramatic mountains',
            'a Mpumalanga mountain pass at golden hour',
            'a dirt road crossing a shallow stream in the Lowveld',
            'a forested back road in the Magaliesburg',
        ])
    } else {
        location = randomLocation([
            'a Cape Town coastal road overlooking the ocean',
            'a jacaranda-lined Pretoria street in spring',
            'an open Karoo road at sunrise',
            'the Garden Route forest highway',
        ])
    }

    return `Create a HYPER-REALISTIC, CINEMATIC editorial lifestyle photograph (1024x1024) of a real vehicle in a stunning South African landscape.

PHOTOGRAPHIC STYLE:
- Shot on Sony A7R V. Golden hour or dramatic weather. Editorial commercial automotive photography. Photorealistic.
- NO illustration, NO 3D render, NO cartoon.

SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} in a real South African outdoor scene.
- Vehicle dominates the lower 60% of the frame.
- NO people, NO passengers.
- IMPORTANT: the car must have NO number plate. Leave the number-plate area blank/empty or body-coloured — do NOT render any registration plate, license plate, numbers or letters where a plate would go.

LOCATION:
- ${location}.

LAYOUT:
- The UPPER-CENTRE area (top 25%) must be a relatively quiet, low-contrast portion of the scene — sky, distant mountains, or open road — so a white bold headline can be composited there later.
- The TOP-LEFT 200x140 corner must be empty enough to host a logo overlay.

NEGATIVE: number plates, registration plates, license plates, plate numbers, people, faces, salesperson, contact details, text inside image, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderLifestyle(car) {
    console.log(`  Lifestyle: ${car.year} ${car.make} ${car.model}`)
    const baseBuf = await generateImage(buildPrompt(car))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width, H = meta.height
    const hl = pickHeadline(car)

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({
        W, H, lines: hl.lines, accentWord: hl.accent, position: 'top-right',
        subhead: hl.subhead, subheadAccent: hl.subheadAccent,
    })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: lifestyleCaption(car),
        hashtags: lifestyleHashtags(car),
        scheduledAt: nextSlot('wed'),
        ctaUrl: vehicleUrl(car),
    }
}
