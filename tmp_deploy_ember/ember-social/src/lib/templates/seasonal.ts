// Seasonal template — minimal brand voice, same structure as lifestyle.
// Vehicle in a seasonal SA scene, ONE headline with seasonal theme.
// Logo top-left. NO price box, NO CTA banner.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot } from './common'
import { seasonalCaption, seasonalHashtags } from './captions'

const SEASONS: Record<string, { scene: string; headlines: { lines: string[]; accent: string }[] }> = {
    festive_summer: {
        scene: 'A sunlit South African coastal town in December festive season — palm trees, blue sky, the car parked near a beach promenade with the upper sky clear for headline text.',
        headlines: [
            { lines: ['FESTIVE', 'READY.'], accent: 'READY' },
            { lines: ['SUMMER', 'STARTS NOW.'], accent: 'SUMMER' },
            { lines: ['HIT', 'THE COAST.'], accent: 'COAST' },
            { lines: ['HOLIDAY', 'BOUND.'], accent: 'HOLIDAY' },
        ],
    },
    autumn: {
        scene: 'A Mpumalanga back road in autumn — golden grass, dramatic clouds, the car cresting a low hill, upper-left sky area clear for headline.',
        headlines: [
            { lines: ['AUTUMN', 'ADVENTURES.'], accent: 'AUTUMN' },
            { lines: ['GOLDEN', 'ROADS AHEAD.'], accent: 'GOLDEN' },
            { lines: ['CRISP MORNINGS,', 'OPEN ROADS.'], accent: 'OPEN' },
            { lines: ['FALL INTO', 'ADVENTURE.'], accent: 'ADVENTURE' },
        ],
    },
    winter: {
        scene: 'A misty Drakensberg morning in winter — frost on the grass, soft golden sunrise, the car parked at a viewpoint, upper sky clear for headline.',
        headlines: [
            { lines: ['BUILT FOR', 'SA WINTERS.'], accent: 'WINTERS' },
            { lines: ['CONQUER', 'THE COLD.'], accent: 'CONQUER' },
            { lines: ['WINTER-', 'READY.'], accent: 'READY' },
            { lines: ['WARM UP', 'TO WINTER.'], accent: 'WARM' },
        ],
    },
    spring: {
        scene: 'A jacaranda-lined Pretoria street in October spring — purple blossoms, soft afternoon light, the car parked under the trees, upper-right canopy clear for headline.',
        headlines: [
            { lines: ['SPRING INTO', 'ACTION.'], accent: 'ACTION' },
            { lines: ['NEW SEASON,', 'NEW DRIVE.'], accent: 'NEW' },
            { lines: ['BLOOM WHERE', 'YOU DRIVE.'], accent: 'BLOOM' },
            { lines: ['FRESH', 'START.'], accent: 'FRESH' },
        ],
    },
}

function currentSASeason(): string {
    const m = new Date().getMonth()
    if (m >= 10 || m <= 1) return 'festive_summer'
    if (m >= 2 && m <= 4) return 'autumn'
    if (m >= 5 && m <= 7) return 'winter'
    return 'spring'
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

function buildPrompt(car: VehicleInput, season: string): string {
    const mm = modelMain(car)
    const mt = modelTrim(car)
    const { scene } = SEASONS[season] || SEASONS[currentSASeason()]

    return `Create a HYPER-REALISTIC, CINEMATIC editorial lifestyle photograph (1024x1024) of a real vehicle in a seasonal South African landscape.

PHOTOGRAPHIC STYLE:
- Shot on Sony A7R V. Golden hour or dramatic weather. Editorial commercial automotive photography. Photorealistic.
- NO illustration, NO 3D render, NO cartoon.

SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} in a seasonal South African scene.
- Vehicle dominates the lower 60% of the frame.
- NO people, NO passengers.
- IMPORTANT: the car must have NO number plate. Leave the number-plate area blank/empty or body-coloured — do NOT render any registration plate, license plate, numbers or letters where a plate would go.

SEASONAL SCENE:
- ${scene}.

LAYOUT:
- The UPPER-CENTRE area (top 25%) must be a relatively quiet, low-contrast portion of the scene — sky, distant mountains, or open road — so a white bold headline can be composited there later.
- The TOP-LEFT 200x140 corner must be empty enough to host a logo overlay.

NEGATIVE: number plates, registration plates, license plates, plate numbers, people, faces, salesperson, contact details, text inside image, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderSeasonal(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  Seasonal: ${car.year} ${car.make} ${car.model}`)
    const season = (opts?.season && SEASONS[opts.season]) ? opts.season : currentSASeason()
    const baseBuf = await generateImage(buildPrompt(car, season))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!
    const { headlines } = SEASONS[season]
    const headline = opts?.headline ?? headlines[(opts?.variantIndex ?? 0) % headlines.length]

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({ W, H, lines: headline.lines, accentWord: headline.accent, position: 'top-right' })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: seasonalCaption(opts?.headline?.caption),
        hashtags: seasonalHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('sat'),
        pillar: 'seasonal',
    }
}
