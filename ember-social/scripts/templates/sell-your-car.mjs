// Sell Your Car template — minimal brand voice.
// Pure typography on textured black background, ONE headline centre, ONE yellow accent word.
// Logo top-left. NO car, NO people, NO CTA banner.
// Matches reference post #2 (EVERY CAR. CHECKED.).

import sharp from 'sharp'
import { escXml, generateImage, compositeLogo, buildHeadlineSvg, LOGO_PATH, CONTACT } from './common.mjs'
import { sellYourCarCaption, sellYourCarHashtags } from './captions.mjs'

const SELL_HEADLINES = [
    { lines: ['WE BUY', 'YOUR CAR.'], accent: 'YOUR', subhead: 'Free valuation in 60 seconds.', subheadAccent: '60' },
    { lines: ['TRADE IT IN.', 'DRIVE IT OUT.'], accent: 'TRADE', subhead: 'Upgrade today.', subheadAccent: 'today' },
    { lines: ['GET YOUR', 'OFFER.'], accent: 'OFFER', subhead: 'No obligation. No fuss.', subheadAccent: 'No' },
]

function pickSellHeadline() {
    return SELL_HEADLINES[Math.floor(Math.random() * SELL_HEADLINES.length)]
}

function buildPrompt() {
    return `Create a HYPER-REALISTIC, CINEMATIC dark textured background design (1024x1024) for a "We Buy Your Car" tip card.

STYLE:
- Pure black background with a subtle dark-grey embossed geometric texture (premium luxury car brand pattern, very subtle diagonal lines or chevrons).
- NO car, NO vehicle, NO people, NO photograph subject.
- NO text inside the image. The entire canvas should have NO words. Headline will be composited later by Sharp.
- Premium luxury feel, like a Mercedes brochure cover.

The canvas should be completely empty of subjects — just the textured black background. A logo and headline will be composited later in the upper-left and centre.

NEGATIVE: cars, vehicles, people, text, words, letters, illustrations, cartoon, 3D render, photographs.`
}

export async function renderSellYourCar(car) {
    console.log(`  SellYourCar: ${car ? `${car.year} ${car.make} ${car.model}` : 'brand-only'}`)
    const baseBuf = await generateImage(buildPrompt())
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width, H = meta.height
    const hl = pickSellHeadline()

    const logoOverlays = await compositeLogo(baseBuf, LOGO_PATH)
    const headlineSvg = buildHeadlineSvg({
        W, H, lines: hl.lines, accentWord: hl.accent, position: 'center',
        subhead: hl.subhead, subheadAccent: hl.subheadAccent,
    })

    const finalBuf = await sharp(baseBuf)
        .composite([...logoOverlays, { input: Buffer.from(headlineSvg), top: 0, left: 0 }])
        .png().toBuffer()

    return {
        image: finalBuf,
        caption: sellYourCarCaption(),
        hashtags: sellYourCarHashtags(),
    }
}
