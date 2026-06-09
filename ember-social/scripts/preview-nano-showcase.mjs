/**
 * Vehicle/Product showcase via Gemini 2.5 Flash Image (Nano Banana).
 * Passes the real Everest inventory photo as a reference and asks Gemini
 * to compose a Facebook-style sales card around it.
 *
 *   cd ember-social
 *   node scripts/preview-nano-showcase.mjs
 *
 * Output: public/preview/vehicle-showcase-nano.jpg
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

const GEMINI_KEY = process.env.GEMINI_API_KEY
const ES_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ES_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'

if (!GEMINI_KEY) { console.error('GEMINI_API_KEY missing'); process.exit(1) }

async function fetchBuf(url) {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`fetch ${url} -> ${r.status}`)
    return Buffer.from(await r.arrayBuffer())
}
async function jget(url, key) {
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    return r.json()
}

const ws = (await jget(
    `${ES_URL}/rest/v1/workspaces?select=client_supabase_url,client_supabase_service_key&id=eq.${WORKSPACE_ID}`,
    ES_KEY
))[0]
const car = (await jget(
    `${ws.client_supabase_url}/rest/v1/cars?select=id,make,model,year,colour,price,mileage,transmission,fuel_type,features,main_image_url&limit=1&order=year.desc`,
    ws.client_supabase_service_key
))[0]
console.log(`Vehicle: ${car.year} ${car.make} ${car.model}  R${car.price}`)

const heroBuf = await fetchBuf(car.main_image_url)
const heroB64 = heroBuf.toString('base64')

// Real contact (scraped from everestmotoring.co.za)
const CONTACT = {
    phone: '013 854 0600',
    email: 'info@everestmotoring.co.za',
    address: 'White River, Mpumalanga',
    website: 'www.everestmotoring.co.za',
}

// Strip the duplicated brand word from the model name (Everest stores it as "Toyota Hilux 2.4 GD…")
const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '')
const modelMain = modelStr.split(/\s+/)[0] || ''
const modelTrim = modelStr.replace(modelMain, '').trim()

const priceText = 'R ' + Number(car.price).toLocaleString('en-ZA').replace(/,/g, ' ')

const prompt = `Create a polished, professional Facebook automotive sales post (1:1 square, 1080x1080) for "Everest Motoring", a South African pre-owned car dealership.

VISUAL STYLE TO COPY EXACTLY (treat as a strict design reference):
- Pure black background (#000) with a very subtle dark-grey radial gradient lifting the top-right corner.
- Yellow accent #FFE600 used sparingly — only for: the logo circle, italic accent words in the headline, thin underlines, the spec icons, the special price border, the contact CTA chevron, and the contact-strip icons.
- Sharp, clean modern typography. Italic bold for the title. Spaced uppercase for labels.
- Photorealistic editorial design — NO cartoon, NO illustration, NO 3D render, NO painting. The car must be a real photograph.

LAYOUT (mandatory regions):

TOP-LEFT block:
  - A large filled yellow circle, about 22% of canvas width.
  - Inside the circle: a clean white minimalist "mountain peak" logo (two stylised triangular peaks).
  - Directly below the circle, in bold white sans-serif: "EVEREST" then beneath it a smaller white italic script "Motoring".

TOP-RIGHT block (covering the upper right ~60% width):
  - Line 1: "${car.year} ${car.make.toUpperCase()}"  — "${car.year}" in white italic, "${car.make.toUpperCase()}" in bold yellow italic.
  - Line 2 (larger): "${modelMain.toUpperCase()}" in bold white italic.
  - Line 3: "${modelTrim.toUpperCase()}" in bold yellow italic.
  - A thin yellow horizontal underline beneath line 3.
  - Below the underline, small spaced uppercase white text with yellow bullet dots between words:
    "POWER  •  RELIABILITY  •  VALUE"

LEFT COLUMN (under the logo): 5 spec rows top-to-bottom, each row is a small yellow-outlined circle icon (about 50px), then bold white uppercase text, then a thin yellow horizontal divider beneath:
  1. (engine icon)        2.4 GD-6 DIESEL
  2. (gearbox icon)       ${String(car.transmission).toUpperCase()}
  3. (mountain icon)      RWD
  4. (seat icon)          BASIC INTERIOR
  5. (people icon)        2 SEATER

CENTRE-RIGHT (visually dominant, ~50% of canvas):
  - DO NOT draw a car. Leave this region as a clean studio environment: deep dark-grey to black radial gradient with a polished reflective floor and subtle yellow rim-light hint along the bottom edge. A real car photograph will be composited into this area later, so you must KEEP IT EMPTY of any vehicle, person, or text.

BOTTOM-LEFT:
  - A bright yellow rectangular border (about 320×140 px) with no fill, containing three lines of left-aligned text:
    Line 1, small white spaced caps:   "SPECIAL PRICE"
    Line 2, large bold yellow:         "${priceText}"
    Line 3, small white spaced caps:   "INCL. VAT"

BOTTOM-CENTRE:
  - A bold yellow horizontal arrow/chevron shape pointing right (taking up the right ~60% of the lower band).
  - Inside the chevron, white bold uppercase text: "CONTACT" then in yellow "EVEREST MOTORING" then in white "TODAY".

VERY BOTTOM STRIP (a single row across the full width, 4 items separated by space):
  - Each item is a small yellow circle icon followed by white text.
  - Order, left to right:
    📞 ${CONTACT.phone}
    ✉ ${CONTACT.email}
    📍 ${CONTACT.address}
    🌐 ${CONTACT.website}

CRITICAL — TEXT MUST BE SPELLED EXACTLY (this is the most important instruction):
- Brand: E-V-E-R-E-S-T (seven letters: E, V, E, R, E, S, T) — render as "EVEREST". Below it, "Motoring" — eight letters: M, o, t, o, r, i, n, g.
- Year: ${car.year}
- Make: ${car.make.toUpperCase()} (spell letter-by-letter: ${car.make.toUpperCase().split('').join('-')})
- Model: ${modelMain.toUpperCase()} (spell letter-by-letter: ${modelMain.toUpperCase().split('').join('-')})
- Model trim: ${modelTrim.toUpperCase()}
- Price: exactly "${priceText}"
- Phone: exactly "${CONTACT.phone}"
- Email: exactly "${CONTACT.email}"
- Address: exactly "${CONTACT.address}"
- Website: exactly "${CONTACT.website}"
DO NOT invent words. DO NOT misspell. If unsure of any letter, render that block as solid yellow with no text rather than guessing.

Output a single 1080×1080 JPEG image.`

const MODEL = 'gemini-2.5-flash-image'
const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`
const body = {
    contents: [{
        parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: heroB64 } },
        ],
    }],
    generationConfig: {
        responseModalities: ['IMAGE'],
        temperature: 0.35,
    },
}

console.log('Calling Gemini 2.5 Flash Image…')
const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
})
const raw = await r.text()
let data
try { data = JSON.parse(raw) } catch { console.error('Non-JSON response:', raw.slice(0, 600)); process.exit(1) }

if (!r.ok) {
    console.error(`HTTP ${r.status}:`, JSON.stringify(data, null, 2).slice(0, 1200))
    process.exit(1)
}

const parts = data.candidates?.[0]?.content?.parts || []
const imgPart = parts.find(p => p.inline_data || p.inlineData)
const imgData = imgPart?.inline_data?.data || imgPart?.inlineData?.data
const textPart = parts.find(p => typeof p.text === 'string')
if (textPart) console.log('Model text:', textPart.text.slice(0, 200))

if (!imgData) {
    console.error('No image in response. Full body (truncated):')
    console.error(JSON.stringify(data, null, 2).slice(0, 1600))
    process.exit(1)
}

// === Sharp post-pass ===
// Gemini owns the frame (logo, gradient, special-price box, chevron, accents).
// Sharp owns the data-bearing slots so the customer sees the EXACT car + exact
// title, specs, price, and contact details.
function escXml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

const base = sharp(Buffer.from(imgData, 'base64'))
const meta = await base.metadata()
const W = meta.width, H = meta.height
const YELLOW = '#FFE600', BLACK = '#000000', WHITE = '#ffffff', GREY='#9a9aa0'

// --- Car photo: composite REAL inventory image into the centre-right slot ---
// Slot: x 32%..98%, y 26%..78% of canvas (matches where Gemini reserves space)
const cxL = Math.round(W * 0.32)
const cxT = Math.round(H * 0.26)
const cxW = Math.round(W * 0.66)
const cxH = Math.round(H * 0.52)
const carSized = await sharp(heroBuf)
  .resize({ width: cxW, height: cxH, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

// --- Title block: top-right ~30%w to ~98%w, top 6% to ~32% ---
const tx = Math.round(W * 0.32)
const ty = Math.round(H * 0.04)
const tw = W - tx - Math.round(W * 0.03)
const th = Math.round(H * 0.38)
const fsYear = Math.round(tw * 0.10)
const fsModel = Math.round(tw * 0.20)
const fsTrim = Math.round(tw * 0.085)
const fsSub = Math.round(tw * 0.045)
const titleSvg = `<svg width="${tw}" height="${th}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${tw}" height="${th}" fill="${BLACK}"/>
  <text x="${tw}" y="${fsYear * 1.05}" text-anchor="end" font-family="Arial, sans-serif" font-style="italic" font-weight="700" font-size="${fsYear}" fill="${WHITE}">${escXml(car.year)}  <tspan fill="${YELLOW}">${escXml(car.make.toUpperCase())}</tspan></text>
  <text x="${tw}" y="${fsYear * 1.05 + fsModel * 1.02}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-style="italic" font-weight="900" font-size="${fsModel}" fill="${WHITE}" letter-spacing="-1">${escXml(modelMain.toUpperCase())}</text>
  <text x="${tw}" y="${fsYear * 1.05 + fsModel * 1.02 + fsTrim * 1.12}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-style="italic" font-weight="900" font-size="${fsTrim}" fill="${YELLOW}" letter-spacing="-0.5">${escXml(modelTrim.toUpperCase())}</text>
  <rect x="${tw - tw * 0.85}" y="${fsYear * 1.05 + fsModel * 1.02 + fsTrim * 1.28}" width="${tw * 0.85}" height="3" fill="${YELLOW}"/>
  <text x="${tw}" y="${fsYear * 1.05 + fsModel * 1.02 + fsTrim * 1.28 + fsSub * 1.5}" text-anchor="end" font-family="Arial, sans-serif" font-weight="700" font-size="${fsSub}" fill="${WHITE}" letter-spacing="4">POWER  <tspan fill="${YELLOW}">•</tspan>  RELIABILITY  <tspan fill="${YELLOW}">•</tspan>  VALUE</text>
</svg>`

// --- Spec column: left side, 5 rows, each with yellow circle icon + white text ---
const sx = Math.round(W * 0.03)
const sy = Math.round(H * 0.36)
const sw = Math.round(W * 0.27)
const sRowH = Math.round(H * 0.06)
const sFs = Math.round(sRowH * 0.36)
const specs = [
  { ic: 'ENG', label: `${(car.fuel_type || '').toUpperCase()}` },
  { ic: 'GBX', label: `${(car.transmission || '').toUpperCase()}` },
  { ic: 'KM',  label: formatMileage(car.mileage) },
  { ic: 'COL', label: `${String(car.colour || '').toUpperCase()}` },
  { ic: 'YR',  label: `${car.year}` },
]
function formatMileage(m){const n=Number(m);return Number.isFinite(n)&&n>0?n.toLocaleString('en-ZA').replace(/,/g,' ')+' KM':''}
const sh = sRowH * specs.length + 12
const specSvg = `<svg width="${sw}" height="${sh}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${sw}" height="${sh}" fill="${BLACK}"/>
  ${specs.map((s, i) => {
    const y = i * sRowH + sRowH * 0.5
    return `
      <circle cx="22" cy="${y}" r="18" fill="none" stroke="${YELLOW}" stroke-width="2"/>
      <text x="22" y="${y + 4}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="11" fill="${YELLOW}">${s.ic}</text>
      <text x="50" y="${y + 6}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${sFs}" fill="${WHITE}" letter-spacing="0.5">${escXml(s.label)}</text>
      <rect x="50" y="${y + 18}" width="${sw - 60}" height="1.5" fill="${YELLOW}" opacity="0.6"/>
    `
  }).join('')}
</svg>`

// --- CTA chevron: bottom-centre, full TODAY visible ---
const ctaY = Math.round(H * 0.86)
const ctaH = Math.round(H * 0.08)
const ctaXL = Math.round(W * 0.30)
const ctaW = W - ctaXL - Math.round(W * 0.03)
const ctaFs = Math.round(ctaH * 0.30)
const ctaSvg = `<svg width="${ctaW}" height="${ctaH}" xmlns="http://www.w3.org/2000/svg">
  <polygon points="0,${ctaH/2} 24,0 ${ctaW - 6},0 ${ctaW},${ctaH/2} ${ctaW - 6},${ctaH} 24,${ctaH}" fill="${YELLOW}"/>
  <text x="${ctaW/2}" y="${ctaH * 0.42}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${ctaFs}" fill="${BLACK}" letter-spacing="2">CONTACT EVEREST MOTORING</text>
  <text x="${ctaW/2}" y="${ctaH * 0.82}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${Math.round(ctaFs * 1.05)}" fill="${BLACK}" letter-spacing="3">TODAY</text>
</svg>`

// --- Bottom contact strip: full width, bottom ~6% ---
const cH = Math.round(H * 0.06)
const cY = H - cH
const cFs = Math.round(cH * 0.32)
const colW = W / 4
const contactSvg = `<svg width="${W}" height="${cH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${cH}" fill="${BLACK}"/>
  <g font-family="Arial, sans-serif" font-size="${cFs}" fill="${WHITE}">
    ${[
      { x: 0,           ic: 'TEL', label: CONTACT.phone },
      { x: colW,        ic: 'EML', label: CONTACT.email },
      { x: colW * 2,    ic: 'LOC', label: CONTACT.address },
      { x: colW * 3,    ic: 'WEB', label: CONTACT.website },
    ].map(({x, ic, label}) => `
      <circle cx="${x + 18}" cy="${cH * 0.55}" r="12" fill="${YELLOW}"/>
      <text x="${x + 18}" y="${cH * 0.60}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9" fill="${BLACK}">${ic}</text>
      <text x="${x + 36}" y="${cH * 0.62}">${escXml(label)}</text>
    `).join('')}
  </g>
</svg>`

const finalBuf = await base
  .composite([
    { input: carSized,                top: cxT, left: cxL },
    { input: Buffer.from(titleSvg),   top: ty,  left: tx },
    { input: Buffer.from(specSvg),    top: sy,  left: sx },
    { input: Buffer.from(ctaSvg),     top: ctaY, left: ctaXL },
    { input: Buffer.from(contactSvg), top: cY,  left: 0 },
  ])
  .jpeg({ quality: 92 })
  .toBuffer()

const out = resolve('public/preview/vehicle-showcase-nano.jpg')
writeFileSync(out, finalBuf)
console.log(`Saved ${out}  (${W}x${H})`)
console.log('Open: http://localhost:3000/preview/vehicle-showcase-nano.jpg')
