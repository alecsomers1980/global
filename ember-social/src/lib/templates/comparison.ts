// Comparison angle — rotation-seat template. Two vehicles side-by-side with a
// centre "VS" badge and one-word labels (e.g. "FAMILY" vs "FUN") under each half.
//
// Uses the REAL inventory photograph of each vehicle, exactly as the July
// comparison post did. Text-to-image cannot be trusted for this: asked for a
// "Jetour T2" it invents a generic crossover that looks nothing like the boxy
// vehicle actually standing on the floor, and a comparison post naming two
// specific in-stock cars has to show those two cars.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, escXml, LOGO_PATH, POST_W, POST_H, nextSlot } from './common'
import { comparisonCaption, comparisonHashtags } from './captions'

const W = POST_W, H = POST_H
const HALF = W / 2

function modelMain(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr.split(/\s+/)[0]
}

async function vehiclePanel(car: VehicleInput, width: number, height: number): Promise<Buffer> {
    const url = car.main_image_url
    if (!url) throw new Error(`comparison: ${car.year} ${car.make} ${car.model} has no main_image_url`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`comparison: could not fetch photo for ${car.make} ${car.model} (${res.status})`)
    return sharp(Buffer.from(await res.arrayBuffer()))
        .resize(width, height, { fit: 'cover', position: 'centre' })
        .png().toBuffer()
}

// Banded layout, matching the July comparison post: the header and the labels
// sit on their own dark bands rather than on top of the photos, which is what
// kept them readable regardless of how the two renders came out.
const GAP = 8, HEADER_H = 240, FOOT_H = 150
const PANEL_W = Math.floor((W - GAP) / 2)
const PANEL_H = H - HEADER_H - FOOT_H

function labelSvg(label: string, car: VehicleInput, xCenter: number): string {
    // modelMain() strips a make already repeated inside model ("Toyota Hilux…"),
    // which would otherwise print "Toyota Toyota".
    const name = `${car.make} ${modelMain(car)}`
    return `<text x="${xCenter}" y="${H - FOOT_H + 60}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#ffffff">${escXml(label.toUpperCase())}</text>
      <text x="${xCenter}" y="${H - FOOT_H + 100}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="26" fill="#FFE600">${escXml(name)}</text>`
}

function vsBadgeSvg(): string {
    const cy = HEADER_H + PANEL_H / 2
    return `
      <circle cx="${HALF}" cy="${cy}" r="52" fill="#FFE600" stroke="#0a0a0f" stroke-width="6" />
      <text x="${HALF}" y="${cy + 15}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#0a0a0f">VS</text>`
}

function headerSvg(): string {
    // Header sits BELOW the logo band, not beside it — a centred 64px line is
    // wide enough to run under a top-left logo otherwise. No emoji: the bundled
    // Arial has no colour-emoji glyphs and renders them as tofu boxes.
    return `<text x="${W / 2}" y="175" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="60" fill="#ffffff">WHICH ONE IS <tspan fill="#FFE600">YOU?</tspan></text>
      <text x="${W / 2}" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="28" fill="#b0b0c0">Family or fun — tell us in the comments</text>`
}

export async function renderComparison(
    carA: VehicleInput,
    carB: VehicleInput,
    labelA: string,
    labelB: string,
    opts?: RenderOpts,
): Promise<RenderResult> {
    console.log(`  Comparison: ${carA.year} ${carA.make} ${carA.model} vs ${carB.year} ${carB.make} ${carB.model}`)

    const [halfA, halfB] = await Promise.all([
        vehiclePanel(carA, PANEL_W, PANEL_H),
        vehiclePanel(carB, PANEL_W, PANEL_H),
    ])

    const canvas = await sharp({ create: { width: W, height: H, channels: 4, background: '#0c0c12' } }).png().toBuffer()
    // Deliberately smaller than compositeLogo()'s 16%-of-width: this template
    // shares the top band with the header line, so the logo has to stay compact.
    const logoSmall = await sharp(LOGO_PATH).resize({ width: 110, fit: 'inside' }).png().toBuffer()
    const overlaySvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        ${headerSvg()}
        ${vsBadgeSvg()}
        ${labelSvg(labelA, carA, PANEL_W / 2)}
        ${labelSvg(labelB, carB, PANEL_W + GAP + PANEL_W / 2)}
    </svg>`

    const finalBuf = await sharp(canvas)
        .composite([
            { input: halfA, left: 0, top: HEADER_H },
            { input: halfB, left: PANEL_W + GAP, top: HEADER_H },
            { input: Buffer.from(overlaySvg), top: 0, left: 0 },
            { input: logoSmall, top: 34, left: 40 },
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
