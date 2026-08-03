// Carousel template — prototype for Everest Motoring (first client the 5-pillar
// system supports). 5-slide viral-carousel formula: hook -> stakes -> value ->
// receipts -> cta, one-word comment to unlock a lead magnet.
//
// Copy-first discipline: slide copy is generated and self-QA'd BEFORE any image
// is rendered (mirrors the pattern the source video used, and the same
// generate-then-validate instinct as the ANTI-SLOP checks on the article
// generators). Slides are pure typography cards (brand background + logo,
// no AI image-gen) — keeps the prototype cheap and avoids AI-misspelled text,
// same reasoning as the studio/tip_card styles in campaignGenerator.ts.
//
// NOT wired into the scheduler/posting pipeline yet — RenderResult/posts assume
// a single image per post. Multi-image (carousel) posting needs a schema +
// composer + Instagram-carousel-upload change, scoped as follow-up work.

import { OpenAI } from 'openai'
import sharp from 'sharp'
import { CONTACT, LOGO_PATH, compositeLogo, escXml, pickHashtags, contactStrip, nextSlot } from './common'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const W = 1080
const H = 1440 // 3:4 — the aspect ratio the source video tested against square and found reach-penalised

export interface CarouselSlide {
    role: 'hook' | 'stakes' | 'value' | 'receipts' | 'cta'
    headline: string
    body?: string | null
}

export interface CarouselCopy {
    topic: string
    slides: CarouselSlide[] // exactly 5, in hook/stakes/value/receipts/cta order
    ctaWord: string // ONE word — the comment-to-unlock trigger
}

export interface CarouselResult {
    images: Buffer[] // 5 PNGs, 1080x1440, in slide order
    caption: string
    hashtags: string[]
    scheduledAt: Date
    pillar: 'carousel'
    topic: string
}

const BANNED_PHRASES = [
    /in conclusion/i, /unlock the secret/i, /game.?changer/i, /at the end of the day/i,
    /it'?s not just .*, it'?s/i, /whether you'?re/i,
]

// Content-level self-QA — the video's visual QA pass (overlapping text, dead space)
// needs a vision check on the rendered PNGs; that's a manual follow-up for the pilot
// run, not automated here. This catches what's checkable from the copy alone.
function qaCopy(copy: CarouselCopy): string[] {
    const issues: string[] = []
    const expectedRoles: CarouselSlide['role'][] = ['hook', 'stakes', 'value', 'receipts', 'cta']
    if (copy.slides.length !== 5) {
        issues.push(`expected 5 slides, got ${copy.slides.length}`)
    } else {
        copy.slides.forEach((s, i) => {
            if (s.role !== expectedRoles[i]) issues.push(`slide ${i + 1} role should be "${expectedRoles[i]}", got "${s.role}"`)
        })
    }
    if (!/^\S+$/.test(copy.ctaWord)) issues.push(`ctaWord must be a single word, got "${copy.ctaWord}"`)
    copy.slides.forEach((s, i) => {
        if (s.headline.length > 70) issues.push(`slide ${i + 1} headline too long (${s.headline.length} chars)`)
        if (s.body && s.body.length > 240) issues.push(`slide ${i + 1} body too long (${s.body.length} chars)`)
        const text = `${s.headline} ${s.body || ''}`
        for (const re of BANNED_PHRASES) {
            if (re.test(text)) issues.push(`slide ${i + 1} uses a banned AI-slop phrase (${re})`)
        }
    })
    return issues
}

async function generateCarouselCopy(topic: string): Promise<CarouselCopy> {
    const systemPrompt = `You are an expert Instagram carousel copywriter for a premium pre-owned vehicle dealership in South Africa (Everest Motoring, White River, Mpumalanga).

Write a 5-slide carousel using this exact structure:
1. HOOK — a bold claim including a real, specific number (not a made-up statistic — use plausible, defensible figures like time saved, rand amounts, or counts).
2. STAKES — why this matters to a South African car buyer/seller right now.
3. VALUE — the actual substance: one concrete, useful tip.
4. RECEIPTS — proof Everest Motoring practices what it preaches (workshop inspections, transparent pricing, real trade-in process — no fabricated claims or numbers not in this brief).
5. CTA — drives a one-word comment to unlock a lead magnet (e.g. a checklist or valuation).

RULES:
- Each headline is a short punchy line (under 70 characters). Body is optional, under 240 characters when present.
- South African English. Warm, confident, never salesy or generic.
- NEVER fabricate specific facts about Everest Motoring beyond: workshop-inspected pre-owned vehicles, free trade-in valuations, White River Mpumalanga location, finance available.
- ctaWord is ONE word only (e.g. "CHECKLIST", "VALUE", "TIPS") — no spaces, no punctuation.
- Do not use these tells: "in conclusion", "unlock the secret", "game-changer", "at the end of the day", "it's not just X, it's Y", "whether you're...".

Return JSON: { "slides": [{ "role": "hook"|"stakes"|"value"|"receipts"|"cta", "headline": string, "body": string|null }], "ctaWord": string }`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Carousel topic: ${topic}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    })

    const raw = JSON.parse(completion.choices[0].message.content || '{}')
    return {
        topic,
        slides: Array.isArray(raw.slides) ? raw.slides : [],
        ctaWord: String(raw.ctaWord || 'TIPS').toUpperCase(),
    }
}

function wrapText(text: string, maxChars: number): string[] {
    const words = text.split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let current = ''
    for (const word of words) {
        if (current.length === 0) current = word
        else if (current.length + 1 + word.length <= maxChars) current += ' ' + word
        else { lines.push(current); current = word }
    }
    if (current.length > 0) lines.push(current)
    return lines
}

const YELLOW = '#FFE600'
const WHITE = '#ffffff'
const BG = '#0a0a0a' // matches the showcase template's pure-black studio brand look

function buildSlideSvg(slide: CarouselSlide, index: number, total: number, ctaWord: string): string {
    const eyebrow = `${index + 1}/${total}`
    const headlineLines = wrapText(slide.headline, 22)
    const bodyLines = slide.body ? wrapText(slide.body, 34) : []

    const headFs = 64
    const headLineGap = 14
    const bodyFs = 34
    const bodyLineGap = 10

    let y = Math.round(H * 0.30)
    const headEls = headlineLines.map((line, i) => {
        const el = `<text x="80" y="${y}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${headFs}" fill="${WHITE}">${escXml(line)}</text>`
        y += headFs + headLineGap
        return el
    }).join('\n')

    y += 20
    const bodyEls = bodyLines.map((line) => {
        const el = `<text x="80" y="${y}" font-family="Arial, sans-serif" font-weight="400" font-size="${bodyFs}" fill="${WHITE}" opacity="0.85">${escXml(line)}</text>`
        y += bodyFs + bodyLineGap
        return el
    }).join('\n')

    const eyebrowEl = `<text x="80" y="${Math.round(H * 0.14)}" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="${YELLOW}" letter-spacing="2">${escXml(eyebrow)}</text>`

    const footer = slide.role === 'cta'
        ? `<text x="80" y="${H - 100}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="${YELLOW}">COMMENT "${escXml(ctaWord)}"</text>`
        : slide.role === 'hook'
            ? `<text x="80" y="${H - 100}" font-family="Arial, sans-serif" font-weight="600" font-size="28" fill="${WHITE}" opacity="0.6">SWIPE &#8594;</text>`
            : ''

    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        ${eyebrowEl}
        ${headEls}
        ${bodyEls}
        ${footer}
    </svg>`
}

async function renderSlide(slide: CarouselSlide, index: number, total: number, ctaWord: string): Promise<Buffer> {
    const bg = await sharp({ create: { width: W, height: H, channels: 4, background: BG } }).png().toBuffer()
    const logoOverlays = await compositeLogo(bg, LOGO_PATH)
    const svg = buildSlideSvg(slide, index, total, ctaWord)
    return sharp(bg).composite([...logoOverlays, { input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer()
}

function buildCarouselCaption(copy: CarouselCopy): string {
    const hook = copy.slides.find(s => s.role === 'hook')?.headline || copy.topic
    return `${hook}\n\nSwipe through for the full breakdown 👉\n\n👇 Comment "${copy.ctaWord}" and we'll send it straight to your DMs.${contactStrip()}`
}

export async function renderCarousel(topic: string, opts?: { targetDate?: Date }): Promise<CarouselResult> {
    let copy = await generateCarouselCopy(topic)
    let issues = qaCopy(copy)
    if (issues.length) {
        console.warn('Carousel self-QA flagged issues, retrying copy once:', issues)
        copy = await generateCarouselCopy(topic)
        issues = qaCopy(copy)
        if (issues.length) console.warn('Carousel self-QA still flags issues after retry — shipping anyway, review manually:', issues)
    }

    const images = await Promise.all(copy.slides.map((s, i) => renderSlide(s, i, copy.slides.length, copy.ctaWord)))

    return {
        images,
        caption: buildCarouselCaption(copy),
        hashtags: pickHashtags(3, ['#CarBuyingTips', ...CONTACT.defaultHashtags.slice(0, 1)]),
        scheduledAt: opts?.targetDate || nextSlot('thu'),
        pillar: 'carousel',
        topic,
    }
}
