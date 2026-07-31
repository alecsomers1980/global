// Finance angle — rotation-seat template. Studio hero (reuses showcase's visual
// language) with an estimated monthly-installment headline instead of a tagline.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, RHD_SPEC, nextSlot } from './common'
import { financeCaption, financeHashtags } from './captions'

// 72 months @ 12.5% p.a., no deposit, no balloon — matches the estimate formula
// already used for Everest's July finance post (scripts/revise-july-angles.mjs).
function estMonthly(price: number): number {
    const n = 72, r = 0.125 / 12
    const m = (price * r) / (1 - Math.pow(1 + r, -n))
    return Math.round(m / 100) * 100
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

    return `Create a HYPER-REALISTIC, CINEMATIC studio automotive photograph for a South African dealership.

PHOTOGRAPHIC STYLE:
- Shot on Sony A7R V. Editorial product photography. Photorealistic.
- NO illustration, NO 3D render, NO CGI, NO cartoon.

MAIN SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt} centred in the LOWER half of the canvas.
- Three-quarter front angle. Studio lighting. Polished dark floor with subtle reflection. Soft side rim-light picking out the body lines.
- The vehicle takes up about 65% of the canvas width, sitting on a black studio floor.
- ${RHD_SPEC}.
- IMPORTANT: the car must have NO number plate. Leave the number-plate area blank/empty or body-coloured — do NOT render any registration plate, license plate, numbers or letters where a plate would go.

BACKGROUND:
- PURE BLACK studio environment. Deep cinematic blacks. Subtle vignette.
- NO text. NO logos. NO graphics. The UPPER half of the canvas must be COMPLETELY EMPTY BLACK SPACE — a headline will be composited there later.

NEGATIVE: number plates, registration plates, license plates, plate numbers, people, salesperson, contact details, phone numbers, addresses, websites, text, logos, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

export async function renderFinance(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  Finance: ${car.year} ${car.make} ${car.model}`)
    const monthly = estMonthly(Number(car.price) || 0)
    const baseBuf = await generateImage(buildPrompt(car))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!

    const amountWord = `±R${monthly}`
    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = await buildHeadlineSvg({
        W, H,
        lines: [amountWord, 'PER MONTH*'],
        accentWord: amountWord,
        position: 'top-right',
        subhead: 'Est: no deposit, 72mo, 12.5% p.a.',
        subheadAccent: null,
        baseImage: baseBuf,
    })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: financeCaption(car, monthly, opts?.headline?.caption),
        hashtags: financeHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('sat'),
        pillar: 'finance',
    }
}
