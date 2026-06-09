/**
 * Vehicle Showcase preview — hybrid pipeline:
 *   1. gpt-image-1 generates a hyper-realistic cinematic premium dealership
 *      advert, leaving designated regions empty for overlays.
 *   2. Sharp post-pass composites the EXACT logo, price box and CTA banner
 *      so those three regions are pixel-accurate every time.
 *
 *   cd ember-social
 *   node scripts/preview-openai-showcase.mjs
 *
 * Output: public/preview/vehicle-showcase-openai.png  (1024x1024)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

function loadEnv(file) {
    const text = readFileSync(resolve(file), 'utf8')
    for (const rawLine of text.split('\n')) {
        const line = rawLine.replace(/\r$/, '')
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const OPENAI_KEY = process.env.OPENAI_API_KEY
const ES_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ES_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'
const LOGO_PATH = 'public/images/logo.png'

if (!OPENAI_KEY) { console.error('OPENAI_API_KEY missing'); process.exit(1) }

async function jget(url, key) {
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    return r.json()
}

const fmtPrice = p => {
    const n = Number(p)
    return Number.isFinite(n) && n > 0
        ? 'R ' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')
        : ''
}
const fmtMileage = m => {
    const n = Number(m)
    return Number.isFinite(n) && n > 0
        ? n.toLocaleString('en-ZA').replace(/,/g, ' ') + ' KM'
        : ''
}
const escXml = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

function buildPrompt(car) {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    const modelMain = modelStr.split(/\s+/)[0]
    const modelTrim = modelStr.replace(modelMain, '').trim()
    const features = [
        `${car.fuel_type || 'Petrol'}`,
        `${car.transmission || 'Manual'}`,
        `${fmtMileage(car.mileage)}`,
        `${car.colour}`,
        `${car.year} Model`,
    ]

    return `Create a HYPER-REALISTIC, CINEMATIC premium automotive dealership advertisement (1024x1024 square) for "Everest Motoring", a South African used-car dealership. Treat this like a BMW/Mercedes magazine spread — broadcast production value, not a stock template.

PHOTOGRAPHIC STYLE — non-negotiable:
- Photorealistic. Editorial commercial automotive photography.
- Shot on a Sony A7R V, 50mm f/1.8, RAW. Cinematic lighting. Soft golden rim-light on the bodywork, deep cinematic shadows, polished floor reflection.
- NO illustration. NO 3D render. NO CGI. NO cartoon. NO painterly look.
- Premium, corporate, high-end car marketing aesthetic.

MAIN SUBJECT:
- A photorealistic ${String(car.colour).toLowerCase()} ${car.year} ${car.make} ${modelMain} ${modelTrim}.
- Vehicle is LARGE, SHARP, dominates the right half of the frame.
- Three-quarter front angle. Glossy studio reflections on the bodywork. Soft drop shadow grounding it.
- NO people, NO salesperson, NO passengers visible.

BACKGROUND:
- Deep black to dark-grey gradient with subtle metallic texture. Cinematic vignette.
- Yellow accent #FFE600 used sparingly — only for the headline accent word, the spec icon rings, and the underline.

LAYOUT:

TOP-LEFT — leave an empty flat dark-rectangular zone roughly 240px wide × 180px tall starting at the top-left corner. NO logo, NO text, NO graphic elements in this zone. It must be a flat very-dark background. A logo will be composited onto this empty zone by post-processing.

LEFT COLUMN (mid-canvas) — Five-row feature list. Compact and refined — text should be SMALL (about 18-20px font, not bold-heavy headlines). Each row: a small open-circle yellow icon (engine, gearbox, road, paint chip, calendar) on the left, then medium-weight uppercase white text in a small refined size, then a thin yellow underline beneath the row. Keep the rows tight vertically. The 5 rows MUST read EXACTLY:
1. ${features[0].toUpperCase()}
2. ${features[1].toUpperCase()}
3. ${features[2]}
4. ${features[3].toUpperCase()}
5. ${features[4]}

BOTTOM-LEFT — leave an empty flat dark-rectangular zone roughly 290px wide × 180px tall (bottom-left corner). NO text, NO border, NO graphic in this zone. A price box will be composited here by post-processing.

TOP-RIGHT — Headline, right-aligned, bold italic modern sans-serif (Eurostile / Gotham / Montserrat style):
- "${car.year} ${car.make.toUpperCase()}"  (year white, make yellow)
- "${modelMain.toUpperCase()}"  (very large, white)
- "${modelTrim.toUpperCase()}"  (bold yellow accent, smaller)
- Thin yellow underline below.

Below the headline (right-aligned, spaced caps, white with yellow bullet dots):
"POWER  •  RELIABILITY  •  VALUE"

BOTTOM EDGE — leave an empty flat dark-strip about 100px tall across the full bottom of the canvas. NO text, NO banner colour, NO graphic. A CTA banner will be composited here by post-processing.

TYPOGRAPHY:
- Bold modern sans-serif.
- White primary text. Yellow #FFE600 accent ONLY on the make word, the model trim, the underlines, and the spec icon rings.
- High letter-spacing, clean alignment.

CRITICAL:
- The three reserved zones (top-left logo, bottom-left price box, bottom-edge banner) MUST be EMPTY DARK BACKGROUND. Do not draw a logo, price text, banner, phone number, address, website, or any text in those zones.
- Do NOT include phone numbers, email, websites, addresses, or contact details anywhere in the image.
- Spell every other word exactly as written above.

NEGATIVE PROMPT — strictly avoid:
- Cartoon style, low resolution, blurry text, distorted car proportions, messy layout, more than three brand colours, overexposed lighting, watermark artifacts, misspellings, 3D-render look, CGI look, painterly artefacts, contact details, phone numbers, addresses, websites, salesperson photos, people.`
}

async function generateBase(car) {
    const body = {
        model: 'gpt-image-1',
        prompt: buildPrompt(car),
        size: '1024x1024',
        quality: 'high',
        n: 1,
    }
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) { console.error(`HTTP ${r.status}:`, JSON.stringify(data).slice(0, 1000)); throw new Error('OpenAI request failed') }
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) throw new Error('No b64_json in response')
    return Buffer.from(b64, 'base64')
}

async function compositeOverlays(baseBuf, car) {
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width, H = meta.height
    const overlays = []

    // === Logo overlay (top-left) ===
    const logoTargetW = Math.round(W * 0.22)
    const logoSized = await sharp(LOGO_PATH).resize({ width: logoTargetW, fit: 'inside' }).png().toBuffer()
    const inset = Math.round(W * 0.035)
    overlays.push({ input: logoSized, top: inset, left: inset })

    // === Price box overlay (bottom-left, yellow border, exact price) ===
    // Smaller, more refined sizing per user request.
    const priceW = Math.round(W * 0.24)
    const priceH = Math.round(H * 0.13)
    const priceX = Math.round(W * 0.035)
    const priceY = H - priceH - Math.round(H * 0.12)
    const priceLabelFs = Math.round(W * 0.016)
    const priceFs = Math.round(W * 0.040)
    const priceSubFs = Math.round(W * 0.014)
    const priceSvg = `<svg width="${priceW}" height="${priceH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${priceW}" height="${priceH}" fill="#000"/>
        <rect x="3" y="3" width="${priceW - 6}" height="${priceH - 6}" rx="2" fill="none" stroke="#FFE600" stroke-width="3"/>
        <text x="${priceW / 2}" y="${priceLabelFs + 14}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${priceLabelFs}" fill="#ffffff" letter-spacing="3">PRICE</text>
        <text x="${priceW / 2}" y="${priceLabelFs + 14 + priceFs + 6}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${priceFs}" fill="#FFE600">${escXml(fmtPrice(car.price))}</text>
        <text x="${priceW / 2}" y="${priceLabelFs + 14 + priceFs + 6 + priceSubFs + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${priceSubFs}" fill="#ffffff" letter-spacing="2">incl. VAT</text>
    </svg>`
    overlays.push({ input: Buffer.from(priceSvg), top: priceY, left: priceX })

    // === CTA banner overlay (bottom strip) ===
    const ctaH = Math.round(H * 0.08)
    const ctaY = H - ctaH
    const ctaFs = Math.round(ctaH * 0.36)
    const ctaSvg = `<svg width="${W}" height="${ctaH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${W}" height="${ctaH}" fill="#FFE600"/>
        <text x="${W / 2}" y="${ctaH / 2 + ctaFs * 0.36}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${ctaFs}" fill="#000000" letter-spacing="4">CONTACT EVEREST MOTORING TODAY</text>
    </svg>`
    overlays.push({ input: Buffer.from(ctaSvg), top: ctaY, left: 0 })

    return await sharp(baseBuf).composite(overlays).png().toBuffer()
}

// === Main ===
const ws = (await jget(
    `${ES_URL}/rest/v1/workspaces?select=client_supabase_url,client_supabase_service_key&id=eq.${WORKSPACE_ID}`,
    ES_KEY
))[0]
const car = (await jget(
    `${ws.client_supabase_url}/rest/v1/cars?select=id,make,model,year,colour,price,mileage,transmission,fuel_type,features,main_image_url&limit=1&order=year.desc`,
    ws.client_supabase_service_key
))[0]
console.log(`Vehicle: ${car.year} ${car.make} ${car.model}  ${fmtPrice(car.price)}`)

console.log('Calling gpt-image-1 (hyper-realistic cinematic premium)…')
const baseBuf = await generateBase(car)
console.log('Compositing logo + price box + CTA banner via Sharp…')
const finalBuf = await compositeOverlays(baseBuf, car)

const out = resolve('public/preview/vehicle-showcase-openai.png')
writeFileSync(out, finalBuf)
console.log(`Saved ${out}`)
console.log('Open: http://localhost:3000/preview/vehicle-showcase-openai.png')
