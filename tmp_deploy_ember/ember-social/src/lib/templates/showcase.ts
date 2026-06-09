// Showcase template — minimal brand voice.
// Pure black studio, car in lower half, ONE headline top-right with ONE yellow accent word.
// Logo top-left. NO price box, NO spec list, NO CTA banner.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, fmtPrice, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot, vehicleUrl } from './common'
import { showcaseCaption, showcaseHashtags } from './captions'

const SHOWCASE_HEADLINES = [
    { lines: ['NEW KEYS,', "WHO'S THIS?"], accent: 'KEYS' },
    { lines: ['LESS TALK.', 'MORE TORQUE.'], accent: 'MORE' },
    { lines: ['DRIVE THE', 'DIFFERENCE.'], accent: 'DIFFERENCE' },
    { lines: ['QUALITY', 'YOU CAN TRUST.'], accent: 'QUALITY' },
    { lines: ['BUILT FOR', 'THE LONG ROAD.'], accent: 'LONG' },
    { lines: ['YOUR NEXT', 'CHAPTER.'], accent: 'CHAPTER' },
    { lines: ['TURN', 'HEADS.'], accent: 'HEADS' },
    { lines: ['THE ONE', "YOU'VE WANTED."], accent: 'WANTED' },
    { lines: ['READY WHEN', 'YOU ARE.'], accent: 'READY' },
    { lines: ['LOVE AT', 'FIRST DRIVE.'], accent: 'FIRST' },
]

function pickHeadline(variantIndex = 0) {
    return SHOWCASE_HEADLINES[variantIndex % SHOWCASE_HEADLINES.length]
}

function modelMain(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr.split(/\s+/)[0]
}

function modelTrim(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    const main = modelStr.split(/\s+/)[0]
    return modelStr.replace(main, '').trim()
}

function buildPrompt(car: VehicleInput): string {
    const mm = modelMain(car)
    const mt = modelTrim(car)

    return `Create a HYPER-REALISTIC, CINEMATIC studio automotive photograph (1024x1024) for a South African dealership.

PHOTOGRAPHIC STYLE:
- Shot on Sony A7R V. Editorial product photography. Photorealistic.
- NO illustration, NO 3D render, NO CGI, NO cartoon.

MAIN SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} centred in the LOWER half of the canvas.
- Three-quarter front angle. Studio lighting. Polished dark floor with subtle reflection. Soft side rim-light picking out the body lines.
- The vehicle takes up about 65% of the canvas width, sitting on a black studio floor.
- IMPORTANT: the car must have NO number plate. Leave the number-plate area blank/empty or body-coloured — do NOT render any registration plate, license plate, numbers or letters where a plate would go.

BACKGROUND:
- PURE BLACK studio environment. Deep cinematic blacks. Subtle vignette.
- NO text. NO logos. NO graphics. NO additional design elements. The UPPER half of the canvas must be COMPLETELY EMPTY BLACK SPACE — a headline will be composited there later.

NEGATIVE: number plates, registration plates, license plates, plate numbers, people, salesperson, contact details, phone numbers, addresses, websites, text, logos, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderShowcase(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  Showcase: ${car.year} ${car.make} ${car.model}  ${fmtPrice(car.price)}`)
    const baseBuf = await generateImage(buildPrompt(car))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!
    const hl = opts?.headline ?? pickHeadline(opts?.variantIndex ?? 0)

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({ W, H, lines: hl.lines, accentWord: hl.accent, position: 'top-right' })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: showcaseCaption(car, opts?.headline?.caption),
        hashtags: showcaseHashtags(car),
        scheduledAt: opts?.targetDate || nextSlot('mon'),
        ctaUrl: vehicleUrl(car),
        pillar: 'showcase',
    }
}
