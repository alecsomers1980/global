// Maintenance tip card — minimal brand voice.
// Yellow magnifying glass icon on textured black background, ONE headline lower-center.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot } from './common'
import { maintenanceCaption, maintenanceHashtags } from './captions'

const TIPS = [
    { lines: ['CHECK YOUR', 'SPARK PLUGS.'], accent: 'PLUGS', subhead: 'Worn plugs steal up to 30% fuel economy.', subheadAccent: '30%' },
    { lines: ['TYRE TREAD', 'MATTERS.'], accent: 'MATTERS', subhead: 'Below 3mm is dangerous in SA winter rain.', subheadAccent: '3mm' },
    { lines: ['FULL SERVICE', 'HISTORY'], accent: 'HISTORY', subhead: "Doesn't guarantee a good car.", subheadAccent: "Doesn't" },
    { lines: ['NEVER DRIVE', 'ON EMPTY.'], accent: 'EMPTY', subhead: 'Sediment in the tank costs more than fuel.', subheadAccent: 'more' },
    { lines: ['LISTEN TO', 'YOUR BRAKES.'], accent: 'BRAKES', subhead: 'A squeal means pads are 90% gone.', subheadAccent: '90%' },
    { lines: ['WIPERS', 'SAVE LIVES.'], accent: 'SAVE', subhead: 'Replace every 6 months.', subheadAccent: '6' },
]

function pickTip(variantIndex = 0) {
    return TIPS[variantIndex % TIPS.length]
}

function buildPrompt(): string {
    return `Create a HYPER-REALISTIC, CINEMATIC design background (1024x1024) for a vehicle maintenance tip card.

STYLE:
- Pure black background with a subtle dark-grey embossed geometric texture (think premium German car brochure texture, very subtle).
- A SINGLE large yellow #FFE600 magnifying-glass outline icon, centred in the upper half of the canvas. The magnifier circle should be about 35% of canvas width, drawn as a thick yellow outline only (no fill), with a yellow handle extending diagonally to the lower-right.
- Behind the magnifier circle, the lens area shows a darker recess as if it's truly magnifying part of the background.
- Cinematic, premium, editorial design feel.

CRITICAL:
- NO car, NO vehicle, NO people, NO photograph subject.
- NO text inside the image. The entire canvas should have NO words. Headlines will be composited later by Sharp.
- The LOWER 35% of the canvas must be CLEAN EMPTY DARK SPACE (just the background texture) ready for headline text to be composited.

NEGATIVE: cars, vehicles, people, text, words, letters, illustrations, cartoon, 3D render.`
}

export async function renderMaintenance(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  Maintenance: ${car.year} ${car.make} ${car.model}`)
    const baseBuf = await generateImage(buildPrompt())
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!
    const tip = opts?.headline ?? pickTip(opts?.variantIndex ?? 0)

    const labelFs = Math.round(W * 0.020)
    const labelY = Math.round(H * 0.25)
    const labelSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <text x="${W / 2}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${labelFs}" fill="#FFE600" letter-spacing="6">WORTH KNOWING</text>
    </svg>`

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({
        W, H, lines: tip.lines, accentWord: tip.accent, position: 'lower-center',
        subhead: tip.subhead, subheadAccent: tip.subheadAccent,
    })

    const finalBuf = await sharp(baseBuf)
        .composite([
            ...logoOverlays,
            { input: Buffer.from(labelSvg), top: 0, left: 0 },
            { input: Buffer.from(headlineSvg), top: 0, left: 0 },
        ])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: maintenanceCaption(car, opts?.headline?.caption),
        hashtags: maintenanceHashtags(),
        scheduledAt: opts?.targetDate || nextSlot('fri'),
        pillar: 'maintenance',
    }
}
