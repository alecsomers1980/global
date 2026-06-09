// Shared config, helpers, and scheduling for the 5-pillar template batch system.
// Each template module imports CONTACT, nextSlot, and Sharp utilities.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

export function loadEnv(file) {
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

export const OPENAI_KEY = process.env.OPENAI_API_KEY
export const ES_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const ES_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
export const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'
export const LOGO_PATH = 'public/images/logo.png'

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

// PILLAR_SCHEDULE maps template names to preferred weekday slots.
// 'showcase' posts on Mondays, 'lifestyle' on Wednesdays, etc.
// 'sellYourCar' is null — it slots into the next available day.
export const PILLAR_SCHEDULE = {
    showcase: 'mon',
    lifestyle: 'wed',
    maintenance: 'fri',
    seasonal: 'sat',
    sellYourCar: null,
}

const DAY_MAP = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }
const SAST_UTC_HOURS = { mon: 7, tue: 9, wed: 11, thu: 11, fri: 13, sat: 8, sun: 0 }

export function nextSlot(dayName) {
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

export const fmtPrice = p => {
    const n = Number(p)
    return Number.isFinite(n) && n > 0
        ? 'R ' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')
        : ''
}
export const fmtMileage = m => {
    const n = Number(m)
    return Number.isFinite(n) && n > 0
        ? n.toLocaleString('en-ZA').replace(/,/g, ' ') + ' km'
        : ''
}
export const escXml = s => String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export async function jget(url, key) {
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    return r.json()
}

export async function fetchCar(clientWs) {
    const car = (await jget(
        `${clientWs.client_supabase_url}/rest/v1/cars?select=id,make,model,year,colour,price,mileage,transmission,fuel_type,features,main_image_url&limit=1&order=year.desc`,
        clientWs.client_supabase_service_key
    ))[0]
    if (!car) throw new Error('No vehicles found in client database')
    return car
}

export async function fetchClientWorkspace() {
    const ws = (await jget(
        `${ES_URL}/rest/v1/workspaces?select=client_supabase_url,client_supabase_service_key&id=eq.${WORKSPACE_ID}`,
        ES_KEY
    ))[0]
    if (!ws) throw new Error('Workspace not found')
    return ws
}

export function vehicleSlug(car) {
    const slug = `${car.year}-${car.make}-${car.model}`.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `${slug}-${String(car.id).slice(0, 8)}`
}

export function vehicleUrl(car) {
    const base = CONTACT.website.replace(/\/$/, '')
    return `${base}/inventory/${vehicleSlug(car)}`
}

// Composite the Everest logo at top-left of any image buffer.
export async function compositeLogo(baseBuf, logoPath) {
    const meta = await sharp(baseBuf).metadata()
    const W = meta.width, H = meta.height
    const logoTargetW = Math.round(W * 0.16)
    const logoSized = await sharp(logoPath).resize({ width: logoTargetW, fit: 'inside' }).png().toBuffer()
    const inset = Math.round(W * 0.028)
    return [{ input: logoSized, top: inset, left: inset }]
}

/**
 * Composites a bold headline onto the base image at the specified position.
 * One word can be rendered in accent yellow; the rest is white.
 * Sharp draws this AFTER the AI image, so spelling is always exact.
 *
 * lines: array of 1-2 strings, all uppercase
 * accentWord: one word from any of the lines to colour yellow (case-insensitive match)
 * position: 'center' | 'top-right' | 'lower-center'
 */
export function buildHeadlineSvg({ W, H, lines, accentWord, position = 'center', subhead = null, subheadAccent = null }) {
    const YELLOW = '#FFE600', WHITE = '#ffffff'
    const fs = Math.round(W * 0.085)
    const lineGap = Math.round(fs * 0.12)
    const subFs = Math.round(W * 0.030)
    const totalHeight = lines.length * fs + (lines.length - 1) * lineGap + (subhead ? (subFs + 16) : 0)

    let cy
    if (position === 'top-right')      cy = Math.round(H * 0.18) + fs
    else if (position === 'lower-center') cy = Math.round(H * 0.78) - totalHeight / 2 + fs
    else                                cy = Math.round(H * 0.50) - totalHeight / 2 + fs

    // librsvg collapses whitespace inside tspan tags, so wrap word-gaps in a
    // tspan that uses an explicit non-breaking space character. This keeps the
    // gaps from being stripped at render time.
    const SPACE = ' '
    const accent = (accentWord || '').toUpperCase()
    const renderLine = (text, y) => {
        const parts = text.split(/\s+/).filter(Boolean)
        const segs = parts.map((p, idx) => {
            const colour = (accent && p.toUpperCase().replace(/[.,!?]/g,'') === accent) ? YELLOW : WHITE
            const word = `<tspan fill="${colour}">${escXml(p)}</tspan>`
            const gap = idx < parts.length - 1 ? `<tspan>${SPACE}</tspan>` : ''
            return word + gap
        }).join('')
        return `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" letter-spacing="-1" xml:space="preserve">${segs}</text>`
    }
    const lineEls = lines.map((l, i) => renderLine(l, cy + i * (fs + lineGap))).join('\n')

    let subEl = ''
    if (subhead) {
        const subY = cy + (lines.length - 1) * (fs + lineGap) + subFs + 18
        const subAccent = (subheadAccent || '').toLowerCase()
        const subParts = subhead.split(/\s+/).filter(Boolean)
        const subSegs = subParts.map((p, idx) => {
            const norm = p.toLowerCase().replace(/[.,!?]/g, '')
            const colour = (subAccent && norm === subAccent) ? YELLOW : WHITE
            const word = `<tspan fill="${colour}">${escXml(p)}</tspan>`
            const gap = idx < subParts.length - 1 ? `<tspan>${SPACE}</tspan>` : ''
            return word + gap
        }).join('')
        subEl = `<text x="${W/2}" y="${subY}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${subFs}" xml:space="preserve">${subSegs}</text>`
    }

    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${lineEls}${subEl}</svg>`
}

// Composite the yellow CTA banner at the bottom of the image.
export function compositeCtaBanner(W, H) {
    const ctaH = Math.round(H * 0.08)
    const ctaY = H - ctaH
    const ctaFs = Math.round(ctaH * 0.36)
    const ctaSvg = `<svg width="${W}" height="${ctaH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${W}" height="${ctaH}" fill="#FFE600"/>
        <text x="${W / 2}" y="${ctaH / 2 + ctaFs * 0.36}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${ctaFs}" fill="#000000" letter-spacing="4">CONTACT EVEREST MOTORING TODAY</text>
    </svg>`
    return { input: Buffer.from(ctaSvg), top: ctaY, left: 0 }
}

// Generate the base image from an OpenAI prompt.
export async function generateImage(prompt) {
    const body = {
        model: 'gpt-image-1',
        prompt,
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

// Contact strip for captions.
export function contactStrip() {
    return `\n\n📞 ${CONTACT.phone}\n🌐 ${CONTACT.website}\n📍 ${CONTACT.location}`
}

// Pick N random hashtags from the default pool.
export function pickHashtags(n, extras = []) {
    const pool = [...CONTACT.defaultHashtags]
    const picked = []
    const used = new Set()
    for (let i = 0; i < Math.min(n, pool.length); i++) {
        const idx = Math.floor(Math.random() * pool.length)
        if (!used.has(pool[idx])) { picked.push(pool[idx]); used.add(pool[idx]) }
    }
    for (const e of extras) { if (!used.has(e)) { picked.push(e); used.add(e) } }
    return picked
}

// South African landscape options for lifestyle/seasonal templates.
export const SA_LANDSCAPES = [
    'Drakensberg viewpoint at sunset, golden mountains, dramatic clouds',
    'Panorama Route Mpumalanga, winding mountain road, lush greenery',
    'Garden Route coastal drive, ocean views, dramatic cliffs',
    'Kruger lowveld at dusk, acacia trees silhouetted, orange sky',
    'Hazyview macadamia plantation, rolling green hills, misty morning',
    'Karoo road at sunrise, endless plains, dramatic wide sky',
    'Magaliesburg mountain pass, rocky terrain, golden light',
]
