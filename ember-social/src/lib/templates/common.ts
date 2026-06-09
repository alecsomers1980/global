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
    pillar: 'showcase' | 'lifestyle' | 'maintenance' | 'seasonal' | 'sellYourCar'
}

export const OPENAI_KEY = process.env.OPENAI_API_KEY
export const LOGO_PATH = path.join(process.cwd(), 'public', 'images', 'logo.png')

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

export function buildHeadlineSvg(args: {
    W: number; H: number
    lines: string[]
    accentWord?: string | null
    position?: 'center' | 'top-right' | 'lower-center'
    subhead?: string | null
    subheadAccent?: string | null
}): string {
    const { W, H, lines, accentWord, position = 'center', subhead = null, subheadAccent = null } = args
    const YELLOW = '#FFE600', WHITE = '#ffffff'

    const MAX_CHARS_PER_LINE = 14
    const processedLines = lines.flatMap(l => wrapLine(l, MAX_CHARS_PER_LINE))

    // Auto-fit: scale the headline font down so the longest line never exceeds the
    // safe width (W - 100). Arial Black caps with letter-spacing -1 average
    // ~0.72× the font size per glyph. Clamp to a sensible min/max.
    const SAFE_W = W - 100
    const HEAD_GLYPH = 0.72
    const longestLineChars = Math.max(1, ...processedLines.map(l => l.length))
    const maxFs = Math.round(W * 0.070)
    const minFs = Math.round(W * 0.040)
    let fs = maxFs
    const estWidth = longestLineChars * fs * HEAD_GLYPH
    if (estWidth > SAFE_W) fs = Math.max(minFs, Math.floor(fs * (SAFE_W / estWidth)))
    const lineGap = Math.round(fs * 0.12)

    // Same idea for the subhead (regular weight ~0.52× per glyph).
    const SUB_GLYPH = 0.52
    const maxSubFs = Math.round(W * 0.030)
    const minSubFs = Math.round(W * 0.018)
    let subFs = maxSubFs
    if (subhead) {
        const estSub = subhead.length * subFs * SUB_GLYPH
        if (estSub > SAFE_W) subFs = Math.max(minSubFs, Math.floor(subFs * (SAFE_W / estSub)))
    }

    const totalHeight = processedLines.length * fs + (processedLines.length - 1) * lineGap + (subhead ? (subFs + 16) : 0)

    let cy: number
    if (position === 'top-right') cy = Math.round(H * 0.18) + fs
    else if (position === 'lower-center') cy = Math.round(H * 0.78) - totalHeight / 2 + fs
    else cy = Math.round(H * 0.50) - totalHeight / 2 + fs

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
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" letter-spacing="-1" xml:space="preserve">${segs}</text>`
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
        subEl = `<text x="${W / 2}" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${subFs}" xml:space="preserve">${subSegs}</text>`
    }

    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${lineEls}${subEl}</svg>`
}

// Generate the base image from OpenAI gpt-image-1.
export async function generateImage(prompt: string): Promise<Buffer> {
    const key = OPENAI_KEY
    if (!key) throw new Error('OPENAI_API_KEY not set')
    const body = {
        model: 'gpt-image-1' as const,
        prompt,
        size: '1024x1024' as const,
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
    return Buffer.from(b64, 'base64')
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
