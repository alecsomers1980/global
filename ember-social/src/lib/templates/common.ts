// Shared config, helpers, and types for the 5-pillar template system.
// Next.js handles .env.local automatically — just read process.env directly.

import '@/lib/fonts/init'
import path from 'path'
import sharp from 'sharp'

export interface HeadlineSpec {
    lines: string[]
    accent: string
    subhead?: string | null
    subheadAccent?: string | null
    caption?: string | null  // AI-written fresh post body (no URL/contact — template appends those)
    imageSubject?: string | null  // maintenance only: the macro subject to photograph for this tip
}

export interface RenderOpts {
    targetDate?: Date
    variantIndex?: number  // 0-based; used to pick a distinct headline per post in a batch
    headline?: HeadlineSpec | null  // AI-generated override; falls back to the curated pool when absent
    season?: string  // override the SA season (seasonal template); defaults to the current date's season
}

export interface VehicleInput {
    id: string
    make: string
    model: string
    year: number | string
    colour?: string
    price?: number | string
    mileage?: number | string
    transmission?: string
    fuel_type?: string
    main_image_url?: string
}

export interface RenderResult {
    image: Buffer
    caption: string
    hashtags: string[]
    scheduledAt: Date
    ctaUrl?: string
    pillar: 'showcase' | 'lifestyle' | 'maintenance' | 'seasonal' | 'sellYourCar' | 'finance' | 'comparison' | 'seasonalLocal'
}

export const OPENAI_KEY = process.env.OPENAI_API_KEY
export const LOGO_PATH = path.join(process.cwd(), 'public', 'images', 'logo.png')

// Static feed posts export at 4:5 — the ratio that fills the feed on both
// Facebook and Instagram (see the July 2026 plan, §3 "Formats").
export const POST_W = 1080, POST_H = 1350

// South Africa is right-hand drive. gpt-image-1 defaults to LHD, so we ask for
// RHD explicitly AND tint the glass so a wrong cabin isn't legible either way.
export const RHD_SPEC = 'South African right-hand-drive specification, steering wheel on the RIGHT-hand side, dark privacy-tinted windows so the cabin interior is not clearly visible'

// Makes the image model cannot draw faithfully — newer Chinese marques that
// post-date or barely feature in its training data. Asked for a "Jetour T2" it
// produces a generic curvy crossover, not the boxy vehicle actually in stock,
// and a post showing the wrong car is worse than one showing a different car.
// These are excluded from templates that generate their picture from a text
// prompt; they can still feature in templates that composite the REAL
// inventory photograph (comparison), where accuracy is guaranteed.
const AI_UNRENDERABLE_MAKES = /jetour|chery|haval|gwm|omoda|jaecoo|baic|foton|jac\b/i

export function isAiRenderable(car: Pick<VehicleInput, 'make' | 'model'>): boolean {
    return !AI_UNRENDERABLE_MAKES.test(`${car.make} ${car.model}`)
}

export const CONTACT = {
    phone: '013 854 0600',
    email: 'info@everestmotoring.co.za',
    website: 'https://everestmotoring.co.za',
    location: 'White River, Mpumalanga',
    defaultHashtags: [
        '#EverestMotoring', '#WhiteRiver', '#Mpumalanga', '#PreOwnedCars',
        '#UsedCarsSA', '#CarDealershipSA', '#CarFinance', '#TradeIns',
    ],
    sellYourCarUrl: 'https://everestmotoring.co.za/value-my-car',
}

const DAY_MAP: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const SAST_UTC_HOURS: Record<string, number> = { mon: 7, tue: 9, wed: 11, thu: 11, fri: 13, sat: 8, sun: 0 }

export function nextSlot(dayName: string): Date {
    const targetDow = DAY_MAP[dayName]
    if (targetDow === undefined) throw new Error(`Unknown day: ${dayName}`)
    const hour = SAST_UTC_HOURS[dayName] || 9
    const d = new Date()
    d.setUTCHours(0, 0, 0, 0)
    const today = d.getUTCDay()
    let daysToAdd = targetDow - today
    if (daysToAdd <= 0) daysToAdd += 7
    d.setUTCDate(d.getUTCDate() + daysToAdd)
    d.setUTCHours(hour, 0, 0, 0)
    return d
}

export const fmtPrice = (p: number | string | undefined | null): string => {
    const n = Number(p)
    return Number.isFinite(n) && n > 0
        ? 'R ' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')
        : ''
}

export const escXml = (s: string): string => String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export function vehicleSlug(car: VehicleInput): string {
    const slug = `${car.year}-${car.make}-${car.model}`.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `${slug}-${String(car.id).slice(0, 8)}`
}

export function vehicleUrl(car: VehicleInput): string {
    const base = CONTACT.website.replace(/\/$/, '')
    return `${base}/inventory/${vehicleSlug(car)}`
}

export async function compositeLogo(baseBuf: Buffer, logoPath: string) {
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width!, H = meta.height!
    const logoTargetW = Math.round(W * 0.16)
    const logoSized = await sharp(logoPath).resize({ width: logoTargetW, fit: 'inside' }).png().toBuffer()
    const inset = Math.round(W * 0.028)
    return [{ input: logoSized, top: inset, left: inset }]
}

/**
 * Composites a bold headline onto the base image at the specified position.
 * One word can be rendered in accent yellow; the rest is white.
 * Sharp draws this AFTER the AI image, so spelling is always exact.
 */
function wrapLine(line: string, maxChars: number): string[] {
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length === 0) return ['']
    const result: string[] = []
    let currentLine = ''
    for (const word of words) {
        if (currentLine.length === 0) {
            currentLine = word
        } else if (currentLine.length + 1 + word.length <= maxChars) {
            currentLine += ' ' + word
        } else {
            result.push(currentLine)
            currentLine = word
        }
    }
    if (currentLine.length > 0) {
        result.push(currentLine)
    }
    return result
}

// Samples the average brightness of the image region a headline will sit on
// top of, so we can flip the headline colour to dark when an AI-generated
// background turns out lighter than the prompt asked for (bright sky, snow,
// etc). Prompts already ask for a "quiet, low-contrast" headline area, but
// image models don't reliably comply — this is the compositing-side safety
// net, same spirit as the RHD tint/reflection fallback elsewhere.
async function sampleIsLightRegion(baseImage: Buffer, region: { left: number; top: number; width: number; height: number }): Promise<boolean> {
    try {
        if (region.width <= 0 || region.height <= 0) return false
        const stats = await sharp(baseImage).extract(region).stats()
        const [r, g, b] = stats.channels
        const luminance = 0.299 * r.mean + 0.587 * g.mean + 0.114 * b.mean
        return luminance > 175
    } catch {
        return false
    }
}

export async function buildHeadlineSvg(args: {
    W: number; H: number
    lines: string[]
    accentWord?: string | null
    position?: 'center' | 'top-right' | 'lower-center'
    subhead?: string | null
    subheadAccent?: string | null
    baseImage: Buffer
}): Promise<string> {
    const { W, H, lines, accentWord, position = 'center', subhead = null, subheadAccent = null, baseImage } = args
    const YELLOW = '#FFE600'

    const MAX_CHARS_PER_LINE = 14
    const processedLines = lines.flatMap(l => wrapLine(l, MAX_CHARS_PER_LINE))

    // Tracking is size-specific, so it is expressed in em and resolved against
    // the final font size rather than being a fixed pixel value. Display type
    // needs NEGATIVE tracking — letters read too far apart as they grow — and a
    // -1px track tuned for a 76px headline is proportionally more than twice as
    // tight once auto-fit drops that headline to 43px.
    const HEAD_TRACK_EM = -0.02

    // Auto-fit: scale the headline font down so the longest line never exceeds
    // the safe width (W - 100). Arial Black caps advance ~0.72× the font size
    // per glyph before tracking; folding tracking in keeps the estimate honest.
    const SAFE_W = W - 100
    const HEAD_GLYPH = 0.72 + HEAD_TRACK_EM
    const longestLineChars = Math.max(1, ...processedLines.map(l => l.length))
    const maxFs = Math.round(W * 0.070)
    const minFs = Math.round(W * 0.040)
    let fs = maxFs
    const estWidth = longestLineChars * fs * HEAD_GLYPH
    if (estWidth > SAFE_W) fs = Math.max(minFs, Math.floor(fs * (SAFE_W / estWidth)))
    const headTracking = +(fs * HEAD_TRACK_EM).toFixed(2)

    // Leading tracks size inversely: tight on large display lines, looser as the
    // type gets smaller and the lines need more air to stay readable.
    const sizeT = (fs - minFs) / Math.max(1, maxFs - minFs)   // 0 at min size → 1 at max
    const lineGap = Math.round(fs * (0.18 - 0.08 * sizeT))

    // Same idea for the subhead (regular weight ~0.52× per glyph), but tracking
    // inverts at this size: small text reads better opened up slightly, where
    // display text needs tightening.
    const SUB_TRACK_EM = 0.01
    const SUB_GLYPH = 0.52 + SUB_TRACK_EM
    const maxSubFs = Math.round(W * 0.030)
    const minSubFs = Math.round(W * 0.018)
    let subFs = maxSubFs
    if (subhead) {
        const estSub = subhead.length * subFs * SUB_GLYPH
        if (estSub > SAFE_W) subFs = Math.max(minSubFs, Math.floor(subFs * (SAFE_W / estSub)))
    }
    const subTracking = +(subFs * SUB_TRACK_EM).toFixed(2)

    const totalHeight = processedLines.length * fs + (processedLines.length - 1) * lineGap + (subhead ? (subFs + 16) : 0)

    let cy: number
    if (position === 'top-right') cy = Math.round(H * 0.18) + fs
    else if (position === 'lower-center') cy = Math.round(H * 0.78) - totalHeight / 2 + fs
    else cy = Math.round(H * 0.50) - totalHeight / 2 + fs

    const sampleTop = Math.max(0, Math.round(cy - fs * 1.1))
    const sampleHeight = Math.min(H - sampleTop, Math.round(totalHeight + fs * 0.5))
    const isLight = await sampleIsLightRegion(baseImage, { left: 50, top: sampleTop, width: SAFE_W, height: sampleHeight })
    const WHITE = isLight ? '#111111' : '#ffffff'

    const SPACE = ' '
    const accent = (accentWord || '').toUpperCase()
    const renderLine = (text: string, y: number) => {
        const parts = text.split(/\s+/).filter(Boolean)
        const segs = parts.map((p, idx) => {
            const colour = (accent && p.toUpperCase().replace(/[.,!?]/g, '') === accent) ? YELLOW : WHITE
            const word = `<tspan fill="${colour}">${escXml(p)}</tspan>`
            const gap = idx < parts.length - 1 ? `<tspan>${SPACE}</tspan>` : ''
            return word + gap
        }).join('')
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" letter-spacing="${headTracking}" xml:space="preserve">${segs}</text>`
    }
    const lineEls = processedLines.map((l, i) => renderLine(l, cy + i * (fs + lineGap))).join('\n')

    let subEl = ''
    if (subhead) {
        const subY = cy + (processedLines.length - 1) * (fs + lineGap) + subFs + 18
        const subAccent = (subheadAccent || '').toLowerCase()
        const subParts = subhead.split(/\s+/).filter(Boolean)
        const subSegs = subParts.map((p, idx) => {
            const norm = p.toLowerCase().replace(/[.,!?]/g, '')
            const colour = (subAccent && norm === subAccent) ? YELLOW : WHITE
            const word = `<tspan fill="${colour}">${escXml(p)}</tspan>`
            const gap = idx < subParts.length - 1 ? `<tspan>${SPACE}</tspan>` : ''
            return word + gap
        }).join('')
        subEl = `<text x="${W / 2}" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${subFs}" letter-spacing="${subTracking}" xml:space="preserve">${subSegs}</text>`
    }

    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${lineEls}${subEl}</svg>`
}

// Generate the base image from OpenAI gpt-image-1, returned cropped to the 4:5
// feed ratio. Generating portrait (1024x1536) and cropping down loses far less
// of the frame than cropping a square would.
export async function generateImage(prompt: string): Promise<Buffer> {
    const key = OPENAI_KEY
    if (!key) throw new Error('OPENAI_API_KEY not set')
    const body = {
        model: 'gpt-image-1' as const,
        prompt,
        size: '1024x1536' as const,
        quality: 'high' as const,
        n: 1,
    }
    const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await r.json() as any
    if (!r.ok) {
        console.error(`OpenAI HTTP ${r.status}:`, JSON.stringify(data).slice(0, 1000))
        throw new Error('OpenAI request failed')
    }
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) throw new Error('No b64_json in response')
    return sharp(Buffer.from(b64, 'base64'))
        .resize(POST_W, POST_H, { fit: 'cover', position: 'centre' })
        .png().toBuffer()
}

// Contact strip for captions.
export function contactStrip(): string {
    return `\n\n📞 ${CONTACT.phone}\n🌐 ${CONTACT.website}\n📍 ${CONTACT.location}`
}

// Pick N random hashtags from the default pool.
export function pickHashtags(n: number, extras: string[] = []): string[] {
    const pool = [...CONTACT.defaultHashtags]
    const picked: string[] = []
    const used = new Set<string>()
    for (let i = 0; i < Math.min(n, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length)
        if (!used.has(pool[idx])) { picked.push(pool[idx]); used.add(pool[idx]) }
    }
    for (const e of extras) { if (!used.has(e)) { picked.push(e); used.add(e) } }
    return picked
}
