// Comparison angle — rotation-seat template. Two vehicles side-by-side on a
// shared studio background with a centre "VS" badge and one-word labels
// (e.g. "FAMILY" vs "FUN") under each half.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, escXml, LOGO_PATH, nextSlot } from './common'
import { comparisonCaption, comparisonHashtags } from './captions'

const W = 1024, H = 1024
const HALF = W / 2

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

MAIN SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${mm} ${mt}, three-quarter front angle, centred in frame, taking up about 70% of canvas width.
- Studio lighting, dark grey-to-black gradient background, polished floor reflection.
- IMPORTANT: NO number plate — leave the plate area blank or body-coloured.

NEGATIVE: number plates, people, text, logos, taglines, watermarks, illustration, cartoon, 3D render, multiple cars, dealership signage.`
}

function labelSvg(label: string, xCenter: number): string {
    return `<text x="${xCenter}" y="${H - 60}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#FFE600" letter-spacing="2">${escXml(label.toUpperCase())}</text>`
}

function vsBadgeSvg(): string {
    const r = 56
    return `
      <circle cx="${HALF}" cy="${H / 2}" r="${r}" fill="#0a0a0a" stroke="#FFE600" stroke-width="4" />
      <text x="${HALF}" y="${H / 2 + 16}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="44" fill="#ffffff">VS</text>`
}

function headerSvg(): string {
    return `<text x="${W / 2}" y="90" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="52" fill="#ffffff">WHICH ONE IS <tspan fill="#FFE600">YOU?</tspan></text>`
}

export async function renderComparison(
    carA: VehicleInput,
    carB: VehicleInput,
    labelA: string,
    labelB: string,
    opts?: RenderOpts,
): Promise<RenderResult> {
    console.log(`  Comparison: ${carA.year} ${carA.make} ${carA.model} vs ${carB.year} ${carB.make} ${carB.model}`)

    const [bufA, bufB] = await Promise.all([generateImage(buildPrompt(carA)), generateImage(buildPrompt(carB))])
    const [halfA, halfB] = await Promise.all([
        sharp(bufA).resize(HALF, H, { fit: 'cover', position: 'centre' }).toBuffer(),
        sharp(bufB).resize(HALF, H, { fit: 'cover', position: 'centre' }).toBuffer(),
    ])

    const canvas = await sharp({ create: { width: W, height: H, channels: 4, background: '#0a0a0a' } }).png().toBuffer()
    const logoOverlays = await compositeLogo(canvas, LOGO_PATH)
    const overlaySvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        ${headerSvg()}
        ${vsBadgeSvg()}
        ${labelSvg(labelA, HALF / 2)}
        ${labelSvg(labelB, HALF + HALF / 2)}
    </svg>`

    const finalBuf = await sharp(canvas)
        .composite([
            { input: halfA, left: 0, top: 0 },
            { input: halfB, left: HALF, top: 0 },
            { input: Buffer.from(overlaySvg), top: 0, left: 0 },
            ...logoOverlays,
        ])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: comparisonCaption(carA, carB, labelA, labelB, opts?.headline?.caption),
        hashtags: comparisonHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('sat'),
        pillar: 'comparison',
    }
}
