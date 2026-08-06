// Maintenance tip card — minimal brand voice.
// Yellow magnifying glass icon on textured black background, ONE headline lower-center.

import sharp from 'sharp'
import { VehicleInput, RenderResult, RenderOpts, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, nextSlot } from './common'
import { maintenanceCaption, maintenanceHashtags } from './captions'

// Each tip carries its OWN macro subject — a card about brakes shows a brake
// disc, not a generic icon. This is what made the July tip cards work; a single
// shared background made every tip card look like the same post twice.
const TIPS = [
    { lines: ['CHECK YOUR', 'SPARK PLUGS.'], accent: 'PLUGS', subhead: 'Worn plugs steal up to 30% fuel economy.', subheadAccent: '30%', subject: 'a single spark plug held in clean workshop tweezers, worn electrode catching the light' },
    { lines: ['TYRE TREAD', 'MATTERS.'], accent: 'MATTERS', subhead: 'Below 3mm is dangerous in the rain.', subheadAccent: '3mm', subject: 'an extreme close-up of a tyre tread block with a depth gauge resting in the groove, water beading on the rubber' },
    { lines: ['FULL SERVICE', 'HISTORY'], accent: 'HISTORY', subhead: "Doesn't guarantee a good car.", subheadAccent: "Doesn't", subject: 'a service-history booklet open on a workshop bench beside a set of car keys, stamps visible but text unreadable' },
    { lines: ['NEVER DRIVE', 'ON EMPTY.'], accent: 'EMPTY', subhead: 'Sediment in the tank costs more than fuel.', subheadAccent: 'more', subject: 'a macro shot of a fuel filler neck with the cap resting alongside, droplet of fuel catching the light' },
    { lines: ['LISTEN TO', 'YOUR BRAKES.'], accent: 'BRAKES', subhead: 'A squeal means pads are 90% gone.', subheadAccent: '90%', subject: 'a macro shot of a ventilated brake disc and caliper behind alloy spokes, fine metal grain visible' },
    { lines: ['WIPERS', 'SAVE LIVES.'], accent: 'SAVE', subhead: 'Replace every 6 months.', subheadAccent: '6', subject: 'a macro shot of a wiper blade lifted off a rain-covered windscreen, water droplets sharp in the foreground' },
    { lines: ['COLD MORNINGS?', 'CHECK THE BATTERY.'], accent: 'BATTERY', subhead: 'Most batteries give up after three years.', subheadAccent: 'three', subject: 'an extreme close-up of a car battery terminal with a clean clamp, faint frost on the metal' },
    { lines: ['MIND YOUR', 'COOLANT.'], accent: 'COOLANT', subhead: 'Overheating ruins engines fast.', subheadAccent: 'fast', subject: 'a macro shot of a coolant expansion tank with the level line visible, engine bay softly blurred behind' },
]

function pickTip(variantIndex = 0) {
    return TIPS[variantIndex % TIPS.length]
}

function buildPrompt(subject: string): string {
    return `Create a HYPER-REALISTIC, CINEMATIC macro photograph for a vehicle maintenance tip card.

SUBJECT:
- ${subject}.
- Shot on a 100mm macro lens, shallow depth of field, single warm key light against a deep black workshop background. Editorial, premium, calm — a craftsman's detail shot, not a stock photo.

LAYOUT:
- The subject sits in the UPPER 60% of the frame.
- The LOWER 40% of the canvas must fall away into CLEAN, NEARLY-BLACK EMPTY SPACE — headline text is composited there later, so it must stay dark and uncluttered.

CRITICAL:
- NO whole car, NO people, NO hands unless described above.
- NO text inside the image. The entire canvas must have NO words, numbers or branding.

NEGATIVE: whole cars, vehicles, people, faces, text, words, letters, logos, watermarks, illustration, cartoon, 3D render, bright backgrounds.`
}

export async function renderMaintenance(car: VehicleInput, opts?: RenderOpts): Promise<RenderResult> {
    console.log(`  Maintenance: ${car.year} ${car.make} ${car.model}`)
    const curated = pickTip(opts?.variantIndex ?? 0)
    const tip = opts?.headline ?? curated
    // An AI-written tip supplies its own macro subject so the picture still
    // matches the tip; falling back to the curated pair keeps them in sync.
    const subject = opts?.headline?.imageSubject || curated.subject
    const baseBuf = await generateImage(buildPrompt(subject))
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!

    const labelFs = Math.round(W * 0.020)
    // Sits just above the lower-centre headline, inside the dark lower band the
    // prompt reserves — at 25% it landed in the middle of the macro subject and
    // disappeared into it.
    const labelY = Math.round(H * 0.64)
    const labelSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <text x="${W / 2}" y="${labelY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${labelFs}" fill="#FFE600" letter-spacing="6">WORTH KNOWING</text>
    </svg>`

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = await buildHeadlineSvg({
        W, H, lines: tip.lines, accentWord: tip.accent, position: 'lower-center',
        subhead: tip.subhead, subheadAccent: tip.subheadAccent, baseImage: baseBuf,
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
