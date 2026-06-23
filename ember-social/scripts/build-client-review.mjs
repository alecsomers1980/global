/**
 * Build the July 2026 Everest Motoring client-review plan:
 *  - crops the 4 lifestyle stills to 4:5 (1080x1350)
 *  - generates the remaining static posts (studio / spec / tip / sell / multi) at 4:5
 *  - uploads all images + the 2 finished videos to the public bucket
 *  - creates a campaign_batches row + 14 posts -> shows up under Client Review Links
 *
 *   cd ember-social
 *   node scripts/build-client-review.mjs
 *
 * Prints the /plan/{token} review link at the end.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
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
const W = 1080, H = 1350, YELLOW = '#FFE600'
const P = (n) => resolve('public/preview', n)
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const CONTACT = '\n\n📞 013 854 0600\n🌐 everestmotoring.co.za\n📍 White River, Mpumalanga'

async function gen(prompt) {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST', headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1024x1536', quality: 'high', n: 1 }),
    })
    const d = await r.json(); if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 200))
    return Buffer.from(d.data[0].b64_json, 'base64')
}
const crop45 = (buf, pos = 'centre') => sharp(buf).resize(W, H, { fit: 'cover', position: pos }).png().toBuffer()
async function logo(width = 150) {
    const l = await sharp('public/images/logo.png').resize({ width, fit: 'inside' }).png().toBuffer()
    return { input: l, top: 40, left: 40 }
}
const svg = s => Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`)

function taglineSvg(line, accent, y = 320) {
    const words = line.split(' ').map(w =>
        w.replace(/[.,]/g, '').toUpperCase() === accent.toUpperCase()
            ? `<tspan fill="${YELLOW}">${esc(w)}</tspan>` : `<tspan fill="#fff"> ${esc(w)}</tspan>`).join(' ')
    return svg(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="92" letter-spacing="-1" xml:space="preserve">${words}</text>`)
}
function wrapLines(text, maxChars) {
    const words = text.split(' '), lines = []
    let cur = ''
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w }
        else cur += ' ' + w
    }
    if (cur.trim()) lines.push(cur.trim())
    return lines
}
function tipSvg(eyebrow, head, sub) {
    const subLines = wrapLines(sub, 42)
        .map((l, i) => `<text x="${W / 2}" y="${740 + i * 48}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="34" fill="#d6d6e0">${esc(l)}</text>`).join('')
    return svg(`
      <text x="${W / 2}" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="6" fill="${YELLOW}">${esc(eyebrow)}</text>
      <text x="${W / 2}" y="650" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="74" fill="#fff">${esc(head)}</text>
      ${subLines}`)
}
function specSvg(model, rows, price) {
    const r = rows.map((t, i) =>
        `<text x="80" y="${1080 + i * 64}" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#fff" letter-spacing="1">${esc(t)}</text>`).join('')
    return svg(`
      <rect x="0" y="1000" width="${W}" height="${H - 1000}" fill="#000" opacity="0.55"/>
      <text x="80" y="1030" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#fff">${esc(model)}</text>
      <rect x="80" y="1046" width="${W - 160}" height="3" fill="${YELLOW}"/>
      ${r}
      <text x="${W - 80}" y="1300" text-anchor="end" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="56" fill="${YELLOW}">${esc(price)}</text>`)
}
function sellSvg() {
    return svg(`
      <text x="${W / 2}" y="300" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="78" fill="#fff">WE'LL BUY YOUR <tspan fill="${YELLOW}">CAR</tspan></text>
      <text x="${W / 2}" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="34" fill="#d6d6e0">Free valuation · Trade-ins welcome · Fast offer</text>
      <text x="${W / 2}" y="${H - 90}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="30" fill="${YELLOW}">everestmotoring.co.za/value-my-car</text>`)
}

async function collage(files) {
    const pad = 24, headerH = 220
    const cellW = Math.floor((W - pad * 3) / 2)
    const cellH = Math.floor((H - headerH - pad * 3) / 2)
    const cells = []
    for (let i = 0; i < 4; i++) {
        const img = await sharp(P(files[i])).resize(cellW, cellH, { fit: 'cover', position: 'centre' }).png().toBuffer()
        const col = i % 2, row = Math.floor(i / 2)
        cells.push({ input: img, left: pad + col * (cellW + pad), top: headerH + pad + row * (cellH + pad) })
    }
    const logoSmall = await sharp('public/images/logo.png').resize({ width: 86, fit: 'inside' }).png().toBuffer()
    const head = svg(`<text x="${W / 2}" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="56" fill="#fff">FRESH <tspan fill="${YELLOW}">ARRIVALS</tspan> THIS WEEK</text>`)
    return sharp({ create: { width: W, height: H, channels: 4, background: '#0c0c12' } })
        .composite([...cells, { input: head, top: 0, left: 0 }, { input: logoSmall, top: 40, left: Math.round((W - 86) / 2) }]).jpeg({ quality: 90 }).toBuffer()
}

// ---- Post definitions (calendar order) ----
const STUDIO_TAIL = 'photorealistic, sharp focus, no text, no logos, blank number plates, no people'
const POSTS = [
    { d: '2026-07-01T08:00:00Z', pillar: 'Lifestyle & adventure', src: { crop: 'lifestyle-ex-1.jpg', pos: 'top' },
      fb: `The lowveld is at its best right now — crisp mornings, golden afternoons, and roads that ask to be driven.\n\nWhether it's a weekend on the Panorama Route or a quiet escape into the bush, the right vehicle turns the drive into the destination.\n\nCome find the one that takes you further.${CONTACT}`,
      ig: `Winter belongs out here. 🏔️ The right vehicle turns the drive into the destination.\n\n📞 013 854 0600 · everestmotoring.co.za`,
      tags: ['#EverestMotoring', '#WhiteRiver', '#Mpumalanga', '#PanoramaRoute', '#4x4Life'] },

    { d: '2026-07-03T10:00:00Z', pillar: 'Maintenance tips', img: { type: 'tip', base: 'tip-battery',
        prompt: `Close-up macro photograph of a clean car battery and terminals in dramatic low-key lighting on a dark textured background, deep shadows, subtle warm rim light, generous empty dark space at top and bottom, photorealistic, no text, no logos.`,
        eyebrow: 'EVEREST MOTORING TIP', head: 'CHECK YOUR BATTERY', sub: 'Cold lowveld mornings drain a tired battery — the first sign is a slow, struggling start. Over three years old? Have it tested before the next cold snap.' },
      fb: `Winter is the season batteries quietly give up. Those cold lowveld mornings put extra strain on a tired battery.\n\nA quick check now saves you a stranded morning later. If yours is over three years old, have it tested.\n\nNeed a hand? Our team is happy to take a look.${CONTACT}`,
      ig: `Cold mornings? 🔋 Test your battery before it lets you down.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#CarTips', '#WinterDriving', '#WhiteRiver'] },

    { d: '2026-07-06T09:00:00Z', pillar: 'Lifestyle & adventure', video: 'everest-reel-family-outro.mp4',
      fb: `Saturday belongs to you. 🌅\n\nPack the family, point the Tucson at the mountains, and let the day unfold. The right SUV makes the whole escape feel effortless.\n\nWhere will the weekend take you?${CONTACT}`,
      ig: `Saturday belongs to you. Where will the weekend take you? 🚗💨\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#FamilyTime', '#WeekendEscape', '#Mpumalanga'] },

    { d: '2026-07-08T11:00:00Z', pillar: 'Vehicle showcase', img: { type: 'studio', tagline: 'BUILT FOR MORE.', accent: 'MORE',
        prompt: `Studio automotive photograph of a silver 2024 Toyota Hilux Raider double-cab bakkie isolated on a pure black background, dramatic side rim lighting with a subtle warm highlight, polished concrete floor reflection, three-quarter front angle, the vehicle in the lower-centre leaving the upper area as empty black space, ${STUDIO_TAIL}.` },
      fb: `Some bakkies haul. This one does it all.\n\nThe 2024 Toyota Hilux Raider — diesel muscle, automatic ease, and the legendary reliability that never quits. Workshop-inspected and ready for its next owner.\n\nBook a test drive today.${CONTACT}`,
      ig: `BUILT FOR MORE. The 2024 Hilux Raider. 🛻\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#ToyotaHilux', '#Bakkie', '#WhiteRiver'] },

    { d: '2026-07-11T08:00:00Z', pillar: 'Lifestyle & adventure', src: { crop: 'family-shot-3.jpg', pos: 'centre', logo: true },
      fb: `School holidays, sorted. 🌄\n\nThere's nothing like watching the kids take in a view they'll never forget. The right family SUV makes getting there the easy part.\n\nCome find yours before the next long weekend.${CONTACT}`,
      ig: `School holidays, sorted. Make the memories — we'll sort the wheels. 🚙\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#FamilySUV', '#SchoolHolidays', '#Mpumalanga'] },

    { d: '2026-07-14T12:00:00Z', pillar: 'Vehicle showcase', img: { type: 'spec', model: '2024 SUZUKI GRAND VITARA GLX',
        rows: ['1.5 Petrol · Automatic', '85 600 km · Silver', 'Workshop-inspected'], price: 'R 329 900',
        prompt: `Studio automotive photograph of a silver 2024 Suzuki Grand Vitara SUV on a smooth dark-grey-to-black gradient background, vehicle in the UPPER 60% of the frame, three-quarter front angle, soft top studio lighting with a subtle yellow rim accent, leave the bottom 40% as clean empty dark space, ${STUDIO_TAIL}.` },
      fb: `Modern, efficient and built for the family — the 2024 Suzuki Grand Vitara GLX.\n\nAutomatic, petrol-light on the pocket, and loaded with the features that make every trip easier. Priced at R 329 900.\n\nView it on our website or pop in to White River.${CONTACT}`,
      ig: `Every detail considered. 2024 Suzuki Grand Vitara GLX — R 329 900.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#SuzukiGrandVitara', '#FamilySUV', '#WhiteRiver'] },

    { d: '2026-07-16T09:00:00Z', pillar: 'Lifestyle & adventure', src: { crop: 'lifestyle-ex-2.jpg', pos: 'top' },
      fb: `Take the long way home. 🌾\n\nThere's a kind of freedom you only find on a dust road with the sun dropping low. A proper bakkie turns an ordinary drive into an adventure.\n\nReady to find yours?${CONTACT}`,
      ig: `Take the long way home. 🚙💨\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#LandCruiser', '#4x4Life', '#Lowveld'] },

    { d: '2026-07-20T09:00:00Z', pillar: 'Lifestyle & adventure', video: 'everest-reel-seedance-outro.mp4',
      fb: `No traffic. No rush. Just the road. 🌅\n\nFrom the bushveld back-roads to the canyon's edge — our 4x4s are built for the kind of weekend that stays with you.\n\nBuilt for the road ahead.${CONTACT}`,
      ig: `No traffic. No rush. Just the road. Built for the road ahead. 🏔️\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#4x4', '#Bushveld', '#Mpumalanga'] },

    { d: '2026-07-22T11:00:00Z', pillar: 'Sell your car', img: { type: 'sell',
        prompt: `A clean side-profile of a single dark SUV silhouette on a glossy black floor, dramatic single-source rim lighting outlining the body, deep shadow background, vehicle in the lower 45%, upper 55% pure black empty space, ${STUDIO_TAIL}.` },
      fb: `Thinking of selling or upgrading? We'll make it easy.\n\nGet a free, no-obligation valuation on your current vehicle — trade-ins welcome and we pay a fair price, fast.\n\nGet your free valuation: everestmotoring.co.za/value-my-car${CONTACT}`,
      ig: `We'll buy your car. 💰 Free valuation · Trade-ins welcome.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#SellYourCar', '#TradeIn', '#WhiteRiver'] },

    { d: '2026-07-24T10:00:00Z', pillar: 'Lifestyle & adventure', src: { crop: 'lifestyle-ex-3.jpg', pos: 'top' },
      fb: `Coffee with a view. ☕\n\nThe best mornings start with an early drive and a quiet spot to take it all in. Life's too short for the same old route.\n\nFind the vehicle that gets you out there.${CONTACT}`,
      ig: `Coffee with a view. ☕ Life's too short for the same old route.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#Hilux', '#WeekendVibes', '#Hazyview'] },

    { d: '2026-07-28T12:00:00Z', pillar: 'Maintenance tips', img: { type: 'tip', base: 'tip-tyre',
        prompt: `Close-up macro photograph of a car tyre tread next to a tyre-pressure gauge in dramatic low-key lighting on a dark background, deep shadows, generous empty dark space top and bottom, photorealistic, no text, no logos.`,
        eyebrow: 'EVEREST MOTORING TIP', head: 'MIND YOUR TYRE PRESSURE', sub: 'Correct winter pressure means better grip, safer braking and lower fuel use. A two-minute check at the forecourt pays for itself.' },
      fb: `Your tyres are the only thing between you and the road — treat them well this winter.\n\nCorrect pressure means better grip, safer braking and lower fuel use. A two-minute check at the forecourt is all it takes.${CONTACT}`,
      ig: `Tyre pressure: your winter friend. 🛞 Two-minute check, big payoff.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#CarTips', '#WinterDriving', '#RoadSafety'] },

    { d: '2026-07-29T09:00:00Z', pillar: 'Vehicle showcase', img: { type: 'studio', tagline: 'QUIET CONFIDENCE.', accent: 'CONFIDENCE',
        prompt: `Studio automotive photograph of a black 2016 Land Rover Discovery 4 SUV isolated on a pure black background, dramatic side rim lighting, polished concrete floor reflection, three-quarter front angle, vehicle in the lower-centre leaving the upper area as empty black space, ${STUDIO_TAIL}.` },
      fb: `Presence you can feel before it even moves.\n\nThe Land Rover Discovery 4 — a premium 7-seater with genuine go-anywhere ability and timeless design. A rare find, workshop-inspected and ready.\n\nEnquire today.${CONTACT}`,
      ig: `QUIET CONFIDENCE. Land Rover Discovery 4. 🖤\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#LandRover', '#Discovery', '#PremiumSUV'] },

    { d: '2026-07-30T11:00:00Z', pillar: 'Vehicle showcase', img: { type: 'collage', files: ['lifestyle-ex-1.jpg', 'lifestyle-ex-2.jpg', 'lifestyle-ex-3.jpg', 'family-shot-3.jpg'] },
      fb: `Fresh stock, freshly inspected. 🚗\n\nFrom rugged 4x4s to easy family SUVs — there's something new on the floor this week. Every vehicle is workshop-checked before it reaches you.\n\nBrowse the full range online or visit us in White River.${CONTACT}`,
      ig: `Fresh arrivals this week. 👀 Which one's calling your name?\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#UsedCarsSA', '#WhiteRiver', '#CarDealership'] },

    { d: '2026-07-31T10:00:00Z', pillar: 'Vehicle showcase', img: { type: 'spec', model: '2024 TOYOTA HILUX 2.4 GD-6 RAIDER',
        rows: ['2.4 Diesel · Automatic', '37 200 km · Silver', 'Raised body · Double-cab'], price: 'R 599 900',
        prompt: `Studio automotive photograph of a silver 2024 Toyota Hilux double-cab bakkie on a smooth dark-grey-to-black gradient background, vehicle in the UPPER 60% of the frame, three-quarter front angle, soft top studio lighting with a subtle yellow rim accent, leave the bottom 40% as clean empty dark space, ${STUDIO_TAIL}.` },
      fb: `The one that never quits.\n\nThe 2024 Toyota Hilux 2.4 GD-6 Raider — raised body, automatic, and ready for work or weekend. Just 37 200 km. Priced at R 599 900.\n\nBook your test drive before it's gone.${CONTACT}`,
      ig: `Hilux. The one that never quits. 🛻 R 599 900.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#ToyotaHilux', '#Bakkie', '#WhiteRiver'] },
]

async function buildImage(post) {
    if (post.video) return readFileSync(P(post.video))
    if (post.src) {
        const cropped = await crop45(readFileSync(P(post.src.crop)), post.src.pos)
        if (post.src.logo) return sharp(cropped).composite([await logo()]).jpeg({ quality: 90 }).toBuffer()
        return sharp(cropped).jpeg({ quality: 90 }).toBuffer()
    }
    const im = post.img
    if (im.type === 'collage') return collage(im.files)
    const base = await crop45(await gen(im.prompt))
    const comps = [await logo()]
    if (im.type === 'studio') comps.push({ input: taglineSvg(im.tagline, im.accent), top: 0, left: 0 })
    if (im.type === 'tip') comps.push({ input: tipSvg(im.eyebrow, im.head, im.sub), top: 0, left: 0 })
    if (im.type === 'spec') comps.push({ input: specSvg(im.model, im.rows, im.price), top: 0, left: 0 })
    if (im.type === 'sell') comps.push({ input: sellSvg(), top: 0, left: 0 })
    return sharp(base).composite(comps).jpeg({ quality: 90 }).toBuffer()
}

async function upload(name, bytes, ct) {
    const path = `july-2026-review/${name}`
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': ct, 'x-upsert': 'true' },
        body: bytes,
    })
    if (!r.ok) throw new Error(`upload ${name}: ${r.status} ${(await r.text()).slice(0, 150)}`)
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${path}`
}
const sbInsert = async (table, row) => {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row),
    })
    if (!r.ok) throw new Error(`insert ${table}: ${r.status} ${(await r.text()).slice(0, 200)}`)
}

// ---- Patch mode: rebuild specific posts' images to their existing URLs (no DB change) ----
const PATCH = (process.env.PATCH || '').split(',').filter(Boolean).map(Number)
if (PATCH.length) {
    for (const idx of PATCH) {
        const post = POSTS[idx - 1]
        const ext = post.video ? 'mp4' : 'jpg'
        console.log(`Patching post ${idx} (${post.img?.type || post.src?.crop || 'video'})...`)
        const bytes = await buildImage(post)
        const url = await upload(`post-${String(idx).padStart(2, '0')}.${ext}`, bytes, post.video ? 'video/mp4' : 'image/jpeg')
        console.log(`  re-uploaded -> ${url}`)
    }
    console.log('Patch done.')
    process.exit(0)
}

// ---- Run ----
const publicToken = randomUUID()
const batchId = randomUUID()
console.log('Creating batch...')
await sbInsert('campaign_batches', {
    id: batchId, workspace_id: WORKSPACE_ID, public_token: publicToken, duration_days: 31,
    schedule_pattern: 'lifestyle_premium',
    strategy_rationale: 'July 2026 — premium, lifestyle-led plan. ~58% lifestyle/showcase showing what the cars can do, plus retained maintenance tips and car-feature spotlights. Two cinematic 16:9 video reels (family + rugged) in weeks 2 and 4. All real in-stock vehicles; static posts at 4:5 for Facebook + Instagram.',
    pillars: ['Lifestyle & adventure', 'Vehicle showcase', 'Maintenance tips', 'Sell your car'],
})

for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i]
    const isVideo = !!post.video
    const label = isVideo ? `video ${post.video}` : (post.src?.crop || post.img?.type)
    console.log(`Post ${i + 1}/${POSTS.length} (${post.pillar}) — ${label}`)
    const bytes = await buildImage(post)
    const ext = isVideo ? 'mp4' : 'jpg'
    const url = await upload(`post-${String(i + 1).padStart(2, '0')}.${ext}`, bytes, isVideo ? 'video/mp4' : 'image/jpeg')
    await sbInsert('posts', {
        id: randomUUID(), workspace_id: WORKSPACE_ID, campaign_batch_id: batchId,
        pillar: post.pillar, content: post.fb,
        variants: { facebook: { content: post.fb, hashtags: post.tags }, instagram: { content: post.ig, hashtags: post.tags } },
        platforms: ['facebook', 'instagram'], media_urls: [url], scheduled_at: post.d,
        status: 'pending_approval', client_status: 'pending', approval_token: randomUUID(),
        image_status: 'ready',
    })
    console.log(`  ok -> ${url}`)
}

console.log(`\n✅ Done. Client review link:`)
console.log(`   /plan/${publicToken}`)
console.log(`   (also now listed under "Client Review Links" on the Everest workspace dashboard)`)
