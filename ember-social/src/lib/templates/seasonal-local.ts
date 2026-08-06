// Seasonal/local angle — rotation-seat template. Same structure as seasonal.ts
// (vehicle in an SA landscape, top-right headline) but the headline pool ties
// to the CALENDAR (long weekends, school holidays) rather than the season.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, RHD_SPEC, nextSlot } from './common'
import { seasonalLocalCaption, seasonalLocalHashtags } from './captions'

const LOCAL_HEADLINES = [
    { lines: ['LONG WEEKEND', 'AHEAD.'], accent: 'WEEKEND' },
    { lines: ['WHERE ARE', 'YOU HEADED?'], accent: 'HEADED' },
    { lines: ['SCHOOL HOLIDAYS,', 'SORTED.'], accent: 'SORTED' },
    { lines: ['THE PANORAMA', 'ROUTE AWAITS.'], accent: 'AWAITS' },
]

function pickHeadline(variantIndex = 0) {
    return LOCAL_HEADLINES[variantIndex % LOCAL_HEADLINES.length]
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
    return `Create a HYPER-REALISTIC, CINEMATIC editorial lifestyle photograph of a real vehicle on South Africa's Panorama Route (Mpumalanga), golden hour.

SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} at a mountain-pass viewpoint, wide horizon, dominating the lower 60% of the frame.
- ${RHD_SPEC}. If the vehicle is moving or on a road, it drives on the LEFT-hand side of the road (South Africa).
- NO people, NO passengers.
- IMPORTANT: the car must have NO number plate.

LAYOUT:
- The UPPER-CENTRE area (top 25%) must be quiet, low-contrast sky or distant mountains so a white bold headline can be composited there later.
- The TOP-LEFT 200x140 corner must be empty enough to host a logo overlay.

NEGATIVE: number plates, people, faces, text inside image, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderSeasonalLocal(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  SeasonalLocal: ${car.year} ${car.make} ${car.model}`)
    const baseBuf = await generateImage(buildPrompt(car))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!
    const headline = opts?.headline ?? pickHeadline(opts?.variantIndex ?? 0)

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = await buildHeadlineSvg({ W, H, lines: headline.lines, accentWord: headline.accent, position: 'top-right', baseImage: baseBuf })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: seasonalLocalCaption(opts?.headline?.caption),
        hashtags: seasonalLocalHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('wed'),
        pillar: 'seasonalLocal',
    }
}
