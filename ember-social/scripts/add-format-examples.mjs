/**
 * Append FORMAT-VARIATION example posts to the existing July client-review batch,
 * WITHOUT touching the 14 scheduled posts. Demonstrates, for the client:
 *   1. Vertical (9:16) family reel   — IG Reels / TikTok cut
 *   2. Vertical (9:16) rugged reel   — IG Reels / TikTok cut
 *   3. Carousel example (Trust angle) — multi-slide preview (2x2)
 *   4. Static → motion clip           — Ken-Burns from a still (free, ffmpeg)
 *
 * Idempotent: clears any prior "Format example" posts in the batch, re-inserts.
 *
 *   cd ember-social
 *   node scripts/add-format-examples.mjs
 */
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import ffmpegPath from 'ffmpeg-static'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')
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
const TMP = join(process.env.TEMP || '/tmp', 'everest-format-ex')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })

const jget = async (url) => (await fetch(url, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })).json()
const ff = args => execFileSync(ffmpegPath, ['-y', ...args], { stdio: 'inherit' })

async function upload(name, bytes, ct, cacheSec) {
    const path = `july-2026-review/${name}`
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: 'POST', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': ct, 'cache-control': `max-age=${cacheSec}`, 'x-upsert': 'true' },
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

// ---- Carousel preview: 2x2 of branded "Trust" slides + header ----
function wrap(text, maxChars) {
    const words = text.split(' '), lines = []
    let cur = ''
    for (const w of words) {
        if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w }
        else cur += ' ' + w
    }
    if (cur.trim()) lines.push(cur.trim())
    return lines
}
function cellText(cx, cy, cw, title, accent) {
    const lines = wrap(title, 16)
    const longest = Math.max(...lines.map(l => l.length))
    let fs = 48
    while (fs > 20 && longest * fs * 0.72 > cw * 0.84) fs -= 1   // fit widest line inside the cell
    const lh = fs + 8
    const startY = cy - ((lines.length - 1) * lh) / 2 + fs * 0.34
    return lines.map((l, i) => {
        const words = l.split(' ').map(w =>
            w.replace(/[.,!?✓]/g, '').toUpperCase() === accent
                ? `<tspan fill="${YELLOW}">${esc(w)}</tspan>` : `<tspan fill="#fff"> ${esc(w)}</tspan>`).join(' ')
        return `<text x="${cx}" y="${startY + i * lh}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" xml:space="preserve">${words}</text>`
    }).join('')
}
async function buildCarouselPreview() {
    const headerH = 150, pad = 20
    const cellW = Math.floor((W - pad * 3) / 2)
    const gridTop = headerH + pad
    const cellH = Math.floor((H - gridTop - pad * 2) / 2)
    const slides = [
        { t: 'WHY BUY FROM EVEREST?', a: 'WHY' },
        { t: 'EVERY CAR WORKSHOP-CHECKED', a: 'WORKSHOP-CHECKED' },
        { t: 'WARRANTY & FINANCE ARRANGED', a: 'FINANCE' },
        { t: 'TRADE-INS WELCOME — VISIT US', a: 'TRADE-INS' },
    ]
    let cells = ''
    slides.forEach((s, i) => {
        const col = i % 2, row = Math.floor(i / 2)
        const x = pad + col * (cellW + pad), y = gridTop + row * (cellH + pad)
        const cx = x + cellW / 2, cy = y + cellH / 2
        cells += `
          <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="22" fill="#13131a" stroke="#2a2a3d" stroke-width="2"/>
          <circle cx="${x + 36}" cy="${y + 36}" r="20" fill="${YELLOW}"/>
          <text x="${x + 36}" y="${y + 44}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="24" fill="#0a0a0f">${i + 1}</text>
          ${cellText(cx, cy, cellW, s.t, s.a)}`
    })
    const logoSmall = await sharp('public/images/logo.png').resize({ width: 110, fit: 'inside' }).png().toBuffer()
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <text x="${W / 2}" y="108" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="32" fill="#fff">CAROUSEL · <tspan fill="${YELLOW}">SWIPE</tspan> 4 SLIDES →</text>
      ${cells}
    </svg>`
    return sharp({ create: { width: W, height: H, channels: 4, background: '#0c0c12' } })
        .composite([{ input: logoSmall, top: 40, left: 40 }, { input: Buffer.from(svg), top: 0, left: 0 }])
        .jpeg({ quality: 90 }).toBuffer()
}

// ---- Static -> motion: gentle Ken-Burns 4:5 clip from a lifestyle still ----
async function buildKenBurns(stillName) {
    // Smooth, fairly quick ZOOM-OUT (1.32 → 1.0). The still is supersampled 4x so the
    // per-frame crop steps are sub-pixel — this is what removes the jagged zoom jitter.
    // The lifestyle still already carries Everest branding — no extra logo overlay.
    const big = await sharp(P(stillName)).resize(W * 4, H * 4, { fit: 'cover', position: 'top' }).png().toBuffer()
    const framed = join(TMP, 'kb-frame.jpg')
    await sharp(big).jpeg({ quality: 92 }).toFile(framed)
    const out = join(TMP, 'static-to-motion.mp4')
    // d=150 (> rendered 125 frames) so the zoom block never resets mid-clip; zoom settles at 1.0.
    ff(['-loop', '1', '-i', framed, '-t', '5', '-r', '25',
        '-vf', `zoompan=z='if(eq(on,0),1.32,max(1.0,zoom-0.0030))':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=25,format=yuv420p`,
        '-c:v', 'libx264', '-profile:v', 'main', '-level', '4.0', '-preset', 'medium',
        '-crf', '23', '-maxrate', '2500k', '-bufsize', '5000k', '-movflags', '+faststart', out])
    return readFileSync(out)
}

// ---- Resolve batch ----
const batch = (await jget(`${SB_URL}/rest/v1/campaign_batches?public_token=eq.${EXISTING_TOKEN}&select=id`))[0]
if (!batch) { console.error('batch not found for token'); process.exit(1) }
const batchId = batch.id

// Clear prior format-example posts (idempotent re-run)
await fetch(`${SB_URL}/rest/v1/posts?campaign_batch_id=eq.${batchId}&pillar=like.Format example*`, {
    method: 'DELETE', headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Prefer: 'return=minimal' },
})
console.log('Cleared any prior format-example posts.')

const VID_RUGGED = 'everest-reel-seedance-vertical-outro.mp4'
if (!existsSync(P(VID_RUGGED))) { console.error(`Missing ${VID_RUGGED} — run the vertical render + append-outro first.`); process.exit(1) }

const items = [
    { d: '2026-07-31T14:00:00Z', pillar: 'Format example · Vertical Reel', file: VID_RUGGED, video: true,
      platforms: ['instagram', 'tiktok'],
      fb: `📱 VERTICAL (9:16) cut of the rugged reel — built for Instagram Reels & TikTok. The same cinematic 4x4 film, reframed tall with a vertical branded outro for maximum mobile reach.${CONTACT}`,
      ig: `No traffic. No rush. Just the road. 🏔️ (Reels / TikTok 9:16 cut)\n\n📞 013 854 0600`,
      tk: `take the long way round 🌄 #4x4 #fyp`, tags: ['#EverestMotoring', '#Reels', '#TikTok', '#4x4'] },

    { d: '2026-07-31T15:00:00Z', pillar: 'Format example · Carousel', kind: 'carousel',
      platforms: ['facebook', 'instagram'],
      fb: `🖼️ CAROUSEL example (Trust angle) — multiple swipeable slides, one promise per slide. Carousels get the strongest organic reach on Instagram right now. The same format also works for finance ("from R—/month"), comparison ("which one?") and single-car spotlights.\n\n(Preview shows all 4 slides; live it's a swipe.)${CONTACT}`,
      ig: `Why buy from Everest? Swipe → ✅ Checked · Warrantied · Finance-ready · Trade-ins welcome.\n\n📞 013 854 0600`,
      tags: ['#EverestMotoring', '#WhyBuyHere', '#WhiteRiver', '#CarDealership'] },

    { d: '2026-07-31T16:00:00Z', pillar: 'Format example · Static→Motion', kind: 'kenburns',
      platforms: ['instagram', 'tiktok'],
      fb: `🎞️ STATIC → MOTION — any still spotlight turned into a gentle 6-second moving clip with our ffmpeg pipeline. No AI-video cost, so it's a cheap way to add Reels / TikTok volume between the big cinematic films.${CONTACT}`,
      ig: `A little motion goes a long way. 🎞️ (still → 6s clip, no extra cost)\n\n📞 013 854 0600`,
      tk: `bringing the stills to life ✨ #cars`, tags: ['#EverestMotoring', '#Reels', '#BehindTheScenes'] },
]

for (const [i, it] of items.entries()) {
    console.log(`Building: ${it.pillar}`)
    let bytes, ct, ext, cacheSec
    if (it.video) { bytes = readFileSync(P(it.file)); ct = 'video/mp4'; ext = 'mp4'; cacheSec = 604800 }
    else if (it.kind === 'carousel') { bytes = await buildCarouselPreview(); ct = 'image/jpeg'; ext = 'jpg'; cacheSec = 3600 }
    else { bytes = await buildKenBurns('lifestyle-ex-1.jpg'); ct = 'video/mp4'; ext = 'mp4'; cacheSec = 604800 }
    // index keeps the two vertical reels (same pillar) on distinct storage paths.
    const slug = it.pillar.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const url = await upload(`format-${String(i + 1).padStart(2, '0')}-${slug}.${ext}`, bytes, ct, cacheSec)
    const variants = { facebook: { content: it.fb, hashtags: it.tags }, instagram: { content: it.ig, hashtags: it.tags } }
    if (it.tk) variants.tiktok = { content: it.tk, hashtags: it.tags }
    await sbInsert('posts', {
        id: randomUUID(), workspace_id: WORKSPACE_ID, campaign_batch_id: batchId,
        pillar: it.pillar, content: it.fb, variants, platforms: it.platforms,
        media_urls: [url], scheduled_at: it.d,
        status: 'pending_approval', client_status: 'pending', approval_token: randomUUID(), image_status: 'ready',
    })
    console.log(`  ok -> ${url}`)
}

console.log(`\n✅ Format examples added to /plan/${EXISTING_TOKEN}`)
