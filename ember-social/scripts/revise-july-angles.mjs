/**
 * Surgically swap 4 posts in the existing July client-review batch to rotate in
 * new content angles, WITHOUT touching the other posts, the videos, or the
 * format-example posts. Replaces (by scheduled date):
 *   08 Jul → 💰 Finance / affordability  (Suzuki Swift, "from ~R/month" estimate)
 *   14 Jul → ⚖️ Comparison "which one is you?" (Tucson vs Kiger, 2-up)
 *   22 Jul → 🎠 Carousel — Grand Vitara walkthrough → finance CTA (4-slide preview)
 *   28 Jul → 🗺️ Seasonal / local hook (VW T-Roc on the Panorama Route)
 *
 * Only these 4 rows are PATCHed; images upload to NEW storage paths so no cache
 * staleness. Videos + all other posts are left exactly as they are.
 *
 *   cd ember-social
 *   node scripts/revise-july-angles.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')
const OPENAI_KEY = process.env.OPENAI_API_KEY
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'
const BUCKET = 'campaign-media'
const EXISTING_TOKEN = '7f4cd715-d93d-4a00-8d3d-5f267d6d5581'
const W = 1080, H = 1350, YELLOW = '#FFE600'
const PAD = Math.round(W * 0.10), SAFE_W = W - PAD * 2
const P = n => resolve('public/preview', n)
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const CONTACT = '\n\n📞 013 854 0600\n🌐 everestmotoring.co.za\n📍 White River, Mpumalanga'

const fit = (text, maxFont, factor = 0.72) => { let f = maxFont; while (f > 14 && text.length * f * factor > SAFE_W) f -= 1; return f }
const jget = async (url, key) => (await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })).json()
const fetchBuf = async (url) => Buffer.from(await (await fetch(url)).arrayBuffer())
const svg = s => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`)
const crop45 = (buf, pos = 'centre') => sharp(buf).resize(W, H, { fit: 'cover', position: pos }).png().toBuffer()
const vehicleSlug = c => `${c.year}-${c.make}-${c.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + String(c.id).slice(0, 8)
const vehicleUrl = c => `https://everestmotoring.co.za/inventory/${vehicleSlug(c)}`

async function logo(width = 150) {
    const l = await sharp('public/images/logo.png').resize({ width, fit: 'inside' }).png().toBuffer()
    return { input: l, top: 40, left: 40 }
}
async function gen(prompt) {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1536', quality: 'high', n: 1 }),
    })
    const d = await r.json(); if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 200))
    return Buffer.from(d.data[0].b64_json, 'base64')
}

// Illustrative monthly installment: no deposit, no balloon, 72 months @ 12.5% p.a.
// Rounded to nearest R100. Shown with a ± — clearly an estimate the client corrects on review.
function estMonthly(price) {
    const n = 72, r = 0.125 / 12
    const m = price * r / (1 - Math.pow(1 + r, -n))
    return Math.round(m / 100) * 100
}
const rand = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const FIN_NOTE = '*Est: no deposit, no balloon, 72 months @ 12.5% p.a. On approved credit. T&Cs apply.'

// ---- image builders ----
// SOUTH AFRICA = RIGHT-HAND DRIVE. Steering wheel on the RIGHT; tint the glass so the cabin
// isn't legible (gpt-image-1 tends to default to LHD, so hiding the interior is the safety net).
const RHD = 'South African right-hand-drive specification, steering wheel on the RIGHT-hand side, dark privacy-tinted windows so the cabin interior is not clearly visible'
const STUDIO_TAIL = `${RHD}, photorealistic, sharp focus, no text, no logos, blank number plates, no people`

function financeSvg(amount) {
    const note = FIN_NOTE, nf = fit(note, 26)
    return svg(`
      <text x="${W / 2}" y="250" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="7" fill="${YELLOW}">AFFORDABLE FINANCE</text>
      <text x="${W / 2}" y="368" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="104" fill="${YELLOW}">±R${rand(amount)}</text>
      <text x="${W / 2}" y="438" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="52" letter-spacing="4" fill="#fff">PER MONTH*</text>
      <text x="${W / 2}" y="${H - 70}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="${nf}" fill="#9a9ab0">${esc(note)}</text>`)
}

async function buildFinance(car) {
    const prompt = `Studio automotive photograph of a pearl-white ${car.year} Suzuki Swift hatchback isolated on a pure black background, dramatic side rim lighting with a subtle warm highlight, polished concrete floor reflection, three-quarter front angle, the vehicle in the lower-centre leaving the upper area as empty black space, ${STUDIO_TAIL}.`
    const base = await crop45(await gen(prompt))
    return sharp(base).composite([await logo(), { input: financeSvg(estMonthly(car.price)), top: 0, left: 0 }]).jpeg({ quality: 90 }).toBuffer()
}

async function buildComparison(left, right) {
    const gap = 8, headerH = 240, footH = 150
    const panelW = Math.floor((W - gap) / 2)
    const panelH = H - headerH - footH
    const lImg = await sharp(await fetchBuf(left.main_image_url)).resize(panelW, panelH, { fit: 'cover', position: 'centre' }).png().toBuffer()
    const rImg = await sharp(await fetchBuf(right.main_image_url)).resize(panelW, panelH, { fit: 'cover', position: 'centre' }).png().toBuffer()
    const logoSmall = await sharp('public/images/logo.png').resize({ width: 110, fit: 'inside' }).png().toBuffer()
    const cx = W / 2, cy = headerH + panelH / 2
    const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${cx}" y="150" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="64" fill="#fff">WHICH ONE IS <tspan fill="${YELLOW}">YOU?</tspan></text>
      <text x="${cx}" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="30" fill="#b0b0c0">Family or fun — tell us in the comments 👇</text>
      <circle cx="${cx}" cy="${cy}" r="52" fill="${YELLOW}" stroke="#0a0a0f" stroke-width="6"/>
      <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#0a0a0f">VS</text>
      <text x="${W / 4}" y="${H - footH + 60}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#fff">FAMILY</text>
      <text x="${W / 4}" y="${H - footH + 100}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="26" fill="${YELLOW}">${esc(left.make + ' ' + left.model.split(' ')[0])}</text>
      <text x="${W * 3 / 4}" y="${H - footH + 60}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#fff">FUN</text>
      <text x="${W * 3 / 4}" y="${H - footH + 100}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="26" fill="${YELLOW}">${esc(right.make + ' ' + right.model.split(' ')[0])}</text>
    </svg>`
    return sharp({ create: { width: W, height: H, channels: 4, background: '#0c0c12' } })
        .composite([
            { input: lImg, top: headerH, left: 0 },
            { input: rImg, top: headerH, left: panelW + gap },
            { input: Buffer.from(overlay), top: 0, left: 0 },
            { input: logoSmall, top: 40, left: 40 },
        ]).jpeg({ quality: 90 }).toBuffer()
}

function wrap(text, maxChars) {
    const words = text.split(' '), lines = []; let cur = ''
    for (const w of words) { if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w } else cur += ' ' + w }
    if (cur.trim()) lines.push(cur.trim()); return lines
}
function cellText(cx, cy, cw, title, accent) {
    const lines = wrap(title, 15)
    const longest = Math.max(...lines.map(l => l.length))
    let fs = 46; while (fs > 20 && longest * fs * 0.72 > cw * 0.84) fs -= 1
    const lh = fs + 8, startY = cy - ((lines.length - 1) * lh) / 2 + fs * 0.34
    return lines.map((l, i) => {
        const words = l.split(' ').map(w => w.replace(/[.,!?~]/g, '').toUpperCase() === accent
            ? `<tspan fill="${YELLOW}">${esc(w)}</tspan>` : `<tspan fill="#fff"> ${esc(w)}</tspan>`).join(' ')
        return `<text x="${cx}" y="${startY + i * lh}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" xml:space="preserve">${words}</text>`
    }).join('')
}
async function buildCarousel(car) {
    const headerH = 150, pad = 20
    const cellW = Math.floor((W - pad * 3) / 2)
    const gridTop = headerH + pad
    const cellH = Math.floor((H - gridTop - pad * 2) / 2)
    const est = estMonthly(car.price)
    // Every slide backs onto a real photo of the SAME car (main + gallery), with a
    // dark transparent overlay so the text reads. Slide 1 = light bottom gradient.
    const imgs = [car.main_image_url, ...(car.gallery_urls || [])].filter(Boolean)
    while (imgs.length < 4) imgs.push(imgs[imgs.length - 1] || car.main_image_url)
    const slides = [
        { hero: true },
        { t: 'ROOM WHERE IT COUNTS', a: 'ROOM' },
        { t: 'WEEKEND-BAG APPROVED', a: 'WEEKEND-BAG' },
        { t: `±R${rand(est)} PER MONTH*`, a: `±R${String(est)}` },
    ]
    const heroOverlay = `<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.4" stop-color="#0a0a0f" stop-opacity="0"/><stop offset="1" stop-color="#0a0a0f" stop-opacity="0.85"/></linearGradient></defs><rect width="${cellW}" height="${cellH}" fill="url(#g)"/></svg>`
    const darkOverlay = `<svg width="${cellW}" height="${cellH}" xmlns="http://www.w3.org/2000/svg"><rect width="${cellW}" height="${cellH}" fill="#0a0a0f" fill-opacity="0.62"/></svg>`
    const cellComposites = []
    let textCells = ''
    for (let i = 0; i < 4; i++) {
        const col = i % 2, row = Math.floor(i / 2)
        const x = pad + col * (cellW + pad), y = gridTop + row * (cellH + pad)
        const photo = await sharp(await fetchBuf(imgs[i])).resize(cellW, cellH, { fit: 'cover', position: 'centre' }).png().toBuffer()
        const overlay = Buffer.from(slides[i].hero ? heroOverlay : darkOverlay)
        cellComposites.push({ input: await sharp(photo).composite([{ input: overlay, top: 0, left: 0 }]).png().toBuffer(), top: y, left: x })
        const cx = x + cellW / 2, cy = y + cellH / 2
        textCells += `<circle cx="${x + 36}" cy="${y + 36}" r="20" fill="${YELLOW}"/>
          <text x="${x + 36}" y="${y + 44}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="24" fill="#0a0a0f">${i + 1}</text>`
        textCells += slides[i].hero
            ? `<text x="${cx}" y="${y + cellH - 30}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="#fff">A CLOSER <tspan fill="${YELLOW}">LOOK</tspan></text>`
            : cellText(cx, cy, cellW, slides[i].t, slides[i].a)
    }
    const logoSmall = await sharp('public/images/logo.png').resize({ width: 110, fit: 'inside' }).png().toBuffer()
    const textSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${W / 2}" y="108" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="32" fill="#fff">CAROUSEL · <tspan fill="${YELLOW}">SWIPE</tspan> 4 SLIDES →</text>
      ${textCells}</svg>`
    return sharp({ create: { width: W, height: H, channels: 4, background: '#0c0c12' } })
        .composite([...cellComposites, { input: Buffer.from(textSvg), top: 0, left: 0 }, { input: logoSmall, top: 40, left: 40 }])
        .jpeg({ quality: 90 }).toBuffer()
}

async function buildSeasonal() {
    // lifestyle-ex-4.jpg already carries Everest branding — just crop to 4:5.
    return sharp(await crop45(readFileSync(P('lifestyle-ex-4.jpg')), 'centre')).jpeg({ quality: 90 }).toBuffer()
}

// ---- storage + db ----
async function upload(name, bytes) {
    const path = `july-2026-review/${name}`
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'image/jpeg', 'cache-control': 'max-age=3600', 'x-upsert': 'true' },
        body: bytes,
    })
    if (!r.ok) throw new Error(`upload ${name}: ${r.status} ${(await r.text()).slice(0, 150)}`)
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`
}
async function patchPost(id, row) {
    const r = await fetch(`${SB_URL}/rest/v1/posts?id=eq.${id}`, {
        method: 'PATCH', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row),
    })
    if (!r.ok) throw new Error(`patch ${id}: ${r.status} ${(await r.text()).slice(0, 200)}`)
}

// ---- run ----
const ws = (await jget(`${SB_URL}/rest/v1/workspaces?select=client_supabase_url,client_supabase_service_key&id=eq.${WORKSPACE_ID}`, SB_KEY))[0]
const CARS = await jget(`${ws.client_supabase_url}/rest/v1/cars?select=id,make,model,year,colour,price,main_image_url,gallery_urls&order=year.desc`, ws.client_supabase_service_key)
const find = re => CARS.find(c => re.test(c.model))
const swift = find(/swift/i), tucson = find(/tucson/i), kiger = find(/kiger/i), vitara = find(/grand vitara/i)
for (const [n, c] of [['swift', swift], ['tucson', tucson], ['kiger', kiger], ['vitara', vitara]]) {
    if (!c) { console.error(`Missing ${n} in inventory — aborting.`); process.exit(1) }
}

const batch = (await jget(`${SB_URL}/rest/v1/campaign_batches?public_token=eq.${EXISTING_TOKEN}&select=id`, SB_KEY))[0]
if (!batch) { console.error('batch not found'); process.exit(1) }
const posts = await jget(`${SB_URL}/rest/v1/posts?campaign_batch_id=eq.${batch.id}&select=id,scheduled_at,pillar&order=scheduled_at`, SB_KEY)
const byDate = d => posts.find(p => (p.scheduled_at || '').slice(0, 10) === d)

const swiftM = estMonthly(swift.price), vitaraM = estMonthly(vitara.price)

const CHANGES = [
    {
        date: '2026-07-08', file: 'post-04-finance.jpg', pillar: 'Finance & affordability',
        build: () => buildFinance(swift),
        fb: `Getting into something you love shouldn't mean waiting years.\n\nThe ${swift.year} Suzuki Swift 1.5 GLX — light on fuel, easy to live with — works out to an estimated ±R${rand(swiftM)} a month.* Come talk numbers; you might be closer than you think.\n\n${FIN_NOTE}\n\nView this one in our inventory:\n${vehicleUrl(swift)}${CONTACT}`,
        ig: `Estimated ±R${rand(swiftM)}/month.* 🚗 The ${swift.year} Suzuki Swift GLX.\n${FIN_NOTE}\n${vehicleUrl(swift)}\n📞 013 854 0600`,
        tags: ['#EverestMotoring', '#CarFinance', '#SuzukiSwift', '#AffordableCars', '#WhiteRiver'],
    },
    {
        date: '2026-07-14', file: 'post-06-comparison.jpg', pillar: 'Comparison · which one?',
        build: () => buildComparison(tucson, kiger),
        fb: `Two very different kinds of Saturday. 👇\n\nLeft: the ${tucson.year} Hyundai Tucson — space, comfort, the whole family along for the ride. Right: the ${kiger.year} Renault Kiger — nippy, easy to park, and just wants to have fun in town.\n\nWhich one is you? Tell us in the comments — we'll help you find it in stock.${CONTACT}`,
        ig: `Family or fun? 🤔 Tucson vs Kiger — which one is you? Comment below 👇\n📞 013 854 0600`,
        tags: ['#EverestMotoring', '#WhichIsYou', '#Tucson', '#RenaultKiger', '#WhiteRiver'],
    },
    {
        date: '2026-07-22', file: 'post-09-carousel.jpg', pillar: 'Carousel · closer look',
        build: () => buildCarousel(vitara),
        fb: `Sometimes you just need to see it properly. 👀\n\nSwipe through the ${vitara.year} Suzuki Grand Vitara GLX — the space, the detail, and yes, finance can be arranged (an estimated ±R${rand(vitaraM)} a month*). Then come see it in person in White River.\n\n${FIN_NOTE}\n\nView this one in our inventory:\n${vehicleUrl(vitara)}${CONTACT}`,
        ig: `A closer look: ${vitara.year} Suzuki Grand Vitara. Swipe → 👉 Room, detail, and finance sorted.\n${vehicleUrl(vitara)}\n📞 013 854 0600`,
        tags: ['#EverestMotoring', '#SuzukiGrandVitara', '#FamilySUV', '#WhiteRiver'],
    },
    {
        date: '2026-07-28', file: 'post-11-seasonal.jpg', pillar: 'Seasonal & local',
        build: () => buildSeasonal(),
        fb: `Long weekend ahead — where are you headed? 🗺️\n\nThe Panorama Route is at its winter best: golden light, crisp air, and roads made for a slow Sunday drive. Whatever you're in, make the most of it.\n\nAnd if it's time for something that makes the trip even better — you know where we are.${CONTACT}`,
        ig: `Long weekend ahead — where are you headed? 🏔️ Panorama Route, we're looking at you.\n📞 013 854 0600`,
        tags: ['#EverestMotoring', '#PanoramaRoute', '#Mpumalanga', '#LongWeekend', '#WhiteRiver'],
    },
]

const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)   // e.g. ONLY=2026-07-22 to rebuild one
for (const c of CHANGES) {
    if (ONLY.length && !ONLY.includes(c.date)) continue
    const post = byDate(c.date)
    if (!post) { console.error(`No post on ${c.date} — skipping`); continue }
    console.log(`${c.date}: "${post.pillar}" → "${c.pillar}"`)
    const bytes = await c.build()
    const url = await upload(c.file, bytes)
    await patchPost(post.id, {
        pillar: c.pillar, content: c.fb,
        variants: { facebook: { content: c.fb, hashtags: c.tags }, instagram: { content: c.ig, hashtags: c.tags } },
        platforms: ['facebook', 'instagram'], media_urls: [url],
        client_status: 'pending', image_status: 'ready',
    })
    console.log(`  ok -> ${url}`)
}

console.log(`\n✅ 4 posts rotated in. Videos + other posts untouched.\n   /plan/${EXISTING_TOKEN}`)
