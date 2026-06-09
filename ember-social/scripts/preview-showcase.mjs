/**
 * Vehicle/Product Showcase template — polished Sharp/SVG composition matching
 * the Caravelle/Nissan reference style. Black background with disciplined
 * yellow accents, designed-template look (not AI-generated), 100% accurate
 * per-vehicle data.
 *
 *   cd ember-social
 *   node scripts/preview-showcase.mjs
 *
 * Output: public/preview/vehicle-showcase.jpg  (1080x900 FB landscape)
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

const ES_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ES_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'

// Brand palette — disciplined: yellow only earns its place on the logo, title
// accent words, underlines, icon rings, price chip, chevron, and contact icons.
const Y = '#FFE600'
const BG = '#000000'
const BG_SOFT = '#15151a'
const W = '#ffffff'
const G = '#9a9aa0'

const CONTACT = {
    phone: '013 854 0600',
    email: 'info@everestmotoring.co.za',
    address: 'White River, Mpumalanga',
    website: 'www.everestmotoring.co.za',
}

const esXml = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const formatPrice = p => {
    const n = Number(p)
    if (!Number.isFinite(n) || n <= 0) return ''
    return 'R ' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')
}
const formatMileage = m => {
    const n = Number(m)
    if (!Number.isFinite(n) || n <= 0) return ''
    return n.toLocaleString('en-ZA').replace(/,/g, ' ') + ' KM'
}

async function fetchBuf(url) {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`fetch ${url} -> ${r.status}`)
    return Buffer.from(await r.arrayBuffer())
}
async function jget(url, key) {
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    return r.json()
}

// === Spec icons (SVG path strings, viewBox 0 0 24 24, stroke-rendered) ===
const ICONS = {
    ENGINE:    'M4 9h2V7h12v2h2v6h-2v2H6v-2H4z M9 11v2 M15 11v2',
    GEARBOX:   'M6 6v12 M12 6v12 M18 6v12 M6 6h12 M6 12h12 M6 18h12',  // grid shifter
    DRIVE:     'M3 18 L9 8 L13 14 L17 6 L21 18 Z',                       // mountain peaks
    INTERIOR:  'M7 7v8a3 3 0 003 3h4 M7 7l3 3 M14 7h3v8',                // seat outline
    SEATS:     'M8 11a2 2 0 100-4 2 2 0 000 4z M16 11a2 2 0 100-4 2 2 0 000 4z M6 18v-1a4 4 0 014-4h0 M14 13a4 4 0 014 4v1', // 2 people
    PHONE:     'M5 4h4l2 5-2 1a11 11 0 005 5l1-2 5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
    MAIL:      'M3 7h18v10H3z M3 7l9 6 9-6',
    PIN:       'M12 22s-7-7.5-7-13a7 7 0 1114 0c0 5.5-7 13-7 13z M12 11a2 2 0 100-4 2 2 0 000 4z',
    WEB:       'M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18 M12 3a13 13 0 010 18 M12 3a13 13 0 000 18',
}

function specRow(x, y, w, rowH, iconPath, label) {
    const r = Math.round(rowH * 0.38)
    const cx = x + r + 2
    const cy = y + rowH / 2
    const labelFs = Math.round(rowH * 0.36)
    const lineY = y + rowH - 2
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${Y}" stroke-width="2"/>
      <g transform="translate(${cx - 12} ${cy - 12}) scale(1)" fill="none" stroke="${Y}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">
        <path d="${iconPath}"/>
      </g>
      <text x="${cx + r + 14}" y="${cy + labelFs * 0.34}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${labelFs}" fill="${W}" letter-spacing="1">${esXml(label)}</text>
      <line x1="${cx + r + 14}" x2="${x + w - 6}" y1="${lineY}" y2="${lineY}" stroke="${Y}" stroke-width="1" opacity="0.55"/>
    `
}

function contactItem(x, y, iconPath, label, colW, iconR, fs) {
    const cx = x + iconR + 2
    return `
      <circle cx="${cx}" cy="${y}" r="${iconR}" fill="${Y}"/>
      <g transform="translate(${cx - 9} ${y - 9})" fill="none" stroke="${BG}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="${iconPath}"/>
      </g>
      <text x="${cx + iconR + 10}" y="${y + fs * 0.34}" font-family="Arial, sans-serif" font-size="${fs}" fill="${W}">${esXml(label)}</text>
    `
}

async function renderShowcase({ width, height, car, logoBuf, heroBuf, modelMain, modelTrim }) {
    const PAD = Math.round(width * 0.035)

    // === Background: radial gradient (lift toward upper-right), with subtle vignette ===
    const bgSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="0.78" cy="0.18" r="0.92">
          <stop offset="0" stop-color="${BG_SOFT}"/>
          <stop offset="0.55" stop-color="#0a0a0c"/>
          <stop offset="1" stop-color="${BG}"/>
        </radialGradient>
        <linearGradient id="floor" x1="0" x2="0" y1="0.5" y2="1">
          <stop offset="0" stop-color="#000" stop-opacity="0"/>
          <stop offset="1" stop-color="${Y}" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect y="${Math.round(height * 0.55)}" width="${width}" height="${Math.round(height * 0.45)}" fill="url(#floor)"/>
    </svg>`

    const overlays = []

    // === Logo block (top-left) — yellow circle + white peaks logo + EVEREST/Motoring wordmark ===
    // Single SVG containing circle + wordmark, wide enough to host both without clipping.
    const logoCircleR = Math.round(width * 0.075)
    const logoBlockW = Math.round(width * 0.30)
    const logoBlockH = logoCircleR * 2 + 140
    const circleCx = logoBlockW / 2
    const circleCy = logoCircleR + 12
    const wordFs = Math.round(width * 0.038)
    const motFs = Math.round(width * 0.022)
    const wordY = circleCy + logoCircleR + 36
    const motY  = wordY + motFs + 6

    // Single SVG with: yellow circle + WHITE PEAKS icon (drawn inline, no PNG) + wordmark
    // Two stacked triangular peaks, vector-clean — matches the reference design exactly.
    const peakScale = logoCircleR * 0.7
    const peakCx = circleCx
    const peakBaseY = circleCy + peakScale * 0.35
    const peaksPath = `M ${peakCx - peakScale} ${peakBaseY}
                       L ${peakCx - peakScale * 0.45} ${peakBaseY - peakScale * 0.55}
                       L ${peakCx - peakScale * 0.1}  ${peakBaseY - peakScale * 0.15}
                       L ${peakCx + peakScale * 0.25} ${peakBaseY - peakScale * 0.85}
                       L ${peakCx + peakScale}        ${peakBaseY}
                       Z`

    const logoBlockSvg = `<svg width="${logoBlockW}" height="${logoBlockH}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${circleCx}" cy="${circleCy}" r="${logoCircleR}" fill="${Y}"/>
      <path d="${peaksPath}" fill="${W}"/>
      <text x="${circleCx}" y="${wordY}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${wordFs}" fill="${W}" letter-spacing="3">EVEREST</text>
      <text x="${circleCx}" y="${motY}" text-anchor="middle" font-family="Georgia, Times, serif" font-style="italic" font-size="${motFs}" fill="${W}">Motoring</text>
    </svg>`
    overlays.push({ input: Buffer.from(logoBlockSvg), top: PAD, left: PAD })

    // (logoBuf intentionally unused — we draw the peaks as a clean SVG path instead of compositing
    //  the noisy logo PNG which has its own circle + text baked in.)
    void logoBuf

    // === Title block (right side, top) ===
    const titleX = Math.round(width * 0.36)
    const titleY = PAD + 8
    const titleW = width - titleX - PAD
    const yearFs = Math.round(width * 0.045)
    const modelFs = Math.round(width * 0.105)
    const trimFs = Math.round(width * 0.045)
    const subFs = Math.round(width * 0.022)

    const yearBaseline = yearFs + 4
    const modelBaseline = yearBaseline + modelFs + 4
    const trimBaseline = modelBaseline + trimFs + 6
    const underlineY = trimBaseline + 10
    const subBaseline = underlineY + subFs + 14
    const titleH = subBaseline + 10

    const titleSvg = `<svg width="${titleW}" height="${titleH}" xmlns="http://www.w3.org/2000/svg">
      <text x="${titleW}" y="${yearBaseline}" text-anchor="end" font-family="Arial, sans-serif" font-style="italic" font-weight="700" font-size="${yearFs}" fill="${W}">${esXml(car.year)} <tspan fill="${Y}">${esXml(car.make.toUpperCase())}</tspan></text>
      <text x="${titleW}" y="${modelBaseline}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-style="italic" font-weight="900" font-size="${modelFs}" fill="${W}" letter-spacing="-2">${esXml(modelMain.toUpperCase())}</text>
      <text x="${titleW}" y="${trimBaseline}" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-style="italic" font-weight="900" font-size="${trimFs}" fill="${Y}" letter-spacing="-0.5">${esXml(modelTrim.toUpperCase())}</text>
      <rect x="${titleW * 0.20}" y="${underlineY}" width="${titleW * 0.80}" height="3" fill="${Y}"/>
      <text x="${titleW}" y="${subBaseline}" text-anchor="end" font-family="Arial, sans-serif" font-weight="700" font-size="${subFs}" fill="${W}" letter-spacing="6">POWER <tspan fill="${Y}">•</tspan> RELIABILITY <tspan fill="${Y}">•</tspan> VALUE</text>
    </svg>`
    overlays.push({ input: Buffer.from(titleSvg), top: titleY, left: titleX })

    // === Spec column (left, below wordmark) ===
    const specsX = PAD
    const specsY = PAD + motY + 30
    const specsW = Math.round(width * 0.30)
    const specRowH = Math.round(width * 0.055)
    const specsList = [
        { ic: ICONS.ENGINE,   label: `${(car.fuel_type || 'PETROL').toUpperCase()}` },
        { ic: ICONS.GEARBOX,  label: `${(car.transmission || 'MANUAL').toUpperCase()}` },
        { ic: ICONS.DRIVE,    label: formatMileage(car.mileage) || 'LOW KMS' },
        { ic: ICONS.INTERIOR, label: `${String(car.colour || '').toUpperCase()}` },
        { ic: ICONS.SEATS,    label: `${car.year}` },
    ]
    const specsSvg = `<svg width="${specsW}" height="${specRowH * specsList.length + 8}" xmlns="http://www.w3.org/2000/svg">
      ${specsList.map((s, i) => specRow(0, i * specRowH, specsW, specRowH, s.ic, s.label)).join('\n')}
    </svg>`
    overlays.push({ input: Buffer.from(specsSvg), top: specsY, left: specsX })

    // === Hero photo (right-bottom, dominant), de-saturated slightly + vignette overlay
    // so the busy dealership background calms down behind the headline + specs columns.
    const heroSlotX = Math.round(width * 0.31)
    const heroSlotY = titleY + titleH + 16
    const heroSlotW = width - heroSlotX - PAD
    const heroSlotH = Math.round(height * 0.50)
    const heroSized = await sharp(heroBuf)
        .resize({ width: heroSlotW, height: heroSlotH, fit: 'cover' })
        .modulate({ saturation: 0.55, brightness: 0.82 })
        .toBuffer()
    overlays.push({ input: heroSized, top: heroSlotY, left: heroSlotX })

    // Radial vignette darkening the photo's edges (helps blend the dealership context into the bg)
    const vignetteSvg = `<svg width="${heroSlotW}" height="${heroSlotH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="v" cx="0.5" cy="0.55" r="0.65">
          <stop offset="0.20" stop-color="#000" stop-opacity="0"/>
          <stop offset="0.65" stop-color="#000" stop-opacity="0.45"/>
          <stop offset="1"    stop-color="#000" stop-opacity="0.92"/>
        </radialGradient>
      </defs>
      <rect width="${heroSlotW}" height="${heroSlotH}" fill="url(#v)"/>
    </svg>`
    overlays.push({ input: Buffer.from(vignetteSvg), top: heroSlotY, left: heroSlotX })

    // === SPECIAL PRICE box (bottom-left, framed yellow) ===
    // Wider SVG canvas with internal padding so the centered text never clips
    // even if librsvg has quirky kerning.
    const priceBoxX = PAD
    const priceBoxW = Math.round(width * 0.32)
    const priceBoxH = Math.round(height * 0.16)
    const priceBoxY = height - PAD - priceBoxH - Math.round(height * 0.075) - 8
    const priceLabelFs = Math.round(width * 0.022)
    const priceFs = Math.round(width * 0.055)
    const priceSubFs = Math.round(width * 0.020)
    const innerPad = 14
    const priceBoxSvg = `<svg width="${priceBoxW}" height="${priceBoxH}" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="${priceBoxW - 6}" height="${priceBoxH - 6}" rx="2" fill="none" stroke="${Y}" stroke-width="3"/>
      <text x="${priceBoxW / 2}" y="${innerPad + priceLabelFs}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${priceLabelFs}" fill="${W}" letter-spacing="3">SPECIAL PRICE</text>
      <text x="${priceBoxW / 2}" y="${innerPad + priceLabelFs + priceFs + 10}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${priceFs}" fill="${Y}">${esXml(formatPrice(car.price))}</text>
      <text x="${priceBoxW / 2}" y="${innerPad + priceLabelFs + priceFs + 10 + priceSubFs + 12}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${priceSubFs}" fill="${W}" letter-spacing="3">INCL. VAT</text>
    </svg>`
    overlays.push({ input: Buffer.from(priceBoxSvg), top: priceBoxY, left: priceBoxX })

    // === CTA chevron (bottom-centre/right, points right with TODAY visible) ===
    const ctaY = priceBoxY + Math.round((priceBoxH - Math.round(height * 0.10)) / 2)
    const ctaH = Math.round(height * 0.10)
    const ctaX = priceBoxX + priceBoxW + Math.round(width * 0.025)
    const ctaW = width - ctaX - PAD
    const arrowTip = ctaW
    const arrowDepth = Math.round(ctaH * 0.4)
    const ctaTextFs = Math.round(ctaH * 0.30)
    const ctaSvg = `<svg width="${ctaW}" height="${ctaH}" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,0 ${arrowTip - arrowDepth},0 ${arrowTip},${ctaH / 2} ${arrowTip - arrowDepth},${ctaH} 0,${ctaH}" fill="${Y}"/>
      <text x="${ctaW / 2 - arrowDepth / 2}" y="${ctaH / 2 - 2}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${ctaTextFs}" fill="${BG}" letter-spacing="2">CONTACT <tspan fill="${BG}">EVEREST MOTORING</tspan></text>
      <text x="${ctaW / 2 - arrowDepth / 2}" y="${ctaH / 2 + ctaTextFs + 2}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${ctaTextFs}" fill="${BG}" letter-spacing="6">TODAY</text>
    </svg>`
    overlays.push({ input: Buffer.from(ctaSvg), top: ctaY, left: ctaX })

    // === Contact strip (very bottom, 3 items so address has room) ===
    const cH = Math.round(height * 0.075)
    const cY = height - cH
    const cIconR = Math.round(cH * 0.32)
    const cFs = Math.round(cH * 0.30)
    const items = [
        { ic: ICONS.PHONE, label: CONTACT.phone },
        { ic: ICONS.MAIL,  label: CONTACT.email },
        { ic: ICONS.WEB,   label: CONTACT.website },
    ]
    const colW = (width - PAD * 2) / items.length
    const colY = cH / 2
    const contactSvg = `<svg width="${width}" height="${cH}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${cH}" fill="${BG}"/>
      <rect width="${width}" height="2" fill="${Y}" opacity="0.6"/>
      ${items.map((it, i) => contactItem(PAD + i * colW, colY, it.ic, it.label, colW, cIconR, cFs)).join('\n')}
    </svg>`
    overlays.push({ input: Buffer.from(contactSvg), top: cY, left: 0 })

    return await sharp(Buffer.from(bgSvg))
        .composite(overlays)
        .jpeg({ quality: 92 })
        .toBuffer()
}

function modelHeadlineParts(makeStr, modelStr) {
    // "Toyota Hilux 2.4 GD Single-Cab" with make "Toyota" -> {main:"HILUX", trim:"2.4 GD SINGLE-CAB"}
    const cleaned = String(modelStr || '').replace(new RegExp(`^${makeStr}\\s+`, 'i'), '').trim()
    const parts = cleaned.split(/\s+/)
    return {
        modelMain: parts[0] || cleaned,
        modelTrim: parts.slice(1).join(' '),
    }
}

;(async () => {
    const ws = (await jget(
        `${ES_URL}/rest/v1/workspaces?select=client_supabase_url,client_supabase_service_key&id=eq.${WORKSPACE_ID}`,
        ES_KEY
    ))[0]
    const bk = (await jget(
        `${ES_URL}/rest/v1/brand_kits?select=logo_url&workspace_id=eq.${WORKSPACE_ID}`,
        ES_KEY
    ))[0] || {}
    const car = (await jget(
        `${ws.client_supabase_url}/rest/v1/cars?select=id,make,model,year,colour,price,mileage,transmission,fuel_type,main_image_url&limit=1&order=year.desc`,
        ws.client_supabase_service_key
    ))[0]
    console.log(`Vehicle: ${car.year} ${car.make} ${car.model}  ${formatPrice(car.price)}`)

    const [heroBuf, logoBuf] = await Promise.all([
        fetchBuf(car.main_image_url),
        bk.logo_url ? fetchBuf(bk.logo_url).catch(() => null) : Promise.resolve(null),
    ])

    const { modelMain, modelTrim } = modelHeadlineParts(car.make, car.model)

    const out = await renderShowcase({
        width: 1080,
        height: 900,
        car, logoBuf, heroBuf, modelMain, modelTrim,
    })
    writeFileSync(resolve('public/preview/vehicle-showcase.jpg'), out)
    console.log('Saved public/preview/vehicle-showcase.jpg (1080x900 FB landscape)')
    console.log('Open: http://localhost:3000/preview/vehicle-showcase.jpg')
})().catch(e => { console.error(e); process.exit(1) })
