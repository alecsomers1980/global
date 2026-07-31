// AI headline + tip generator — produces FRESH text overlays for each batch so
// nothing repeats month-to-month. One gpt-4o-mini call returns premium, on-brand
// headlines for each pillar. Falls back to null (callers use curated pools) on any error.

import { HeadlineSpec } from './common'

export interface FreshHeadlines {
    showcase: HeadlineSpec[]
    lifestyle: HeadlineSpec[]
    maintenance: HeadlineSpec[]
    seasonal: HeadlineSpec[]
}

const SYSTEM_PROMPT = `You write premium, minimal social-media text overlays for "Everest Motoring", a South African pre-owned car dealership.

BRAND VOICE (study these real examples):
- "NEW KEYS, WHO'S THIS?"
- "LESS TALK. MORE TORQUE."
- "EVERY CAR. CHECKED."
- "BUILT FOR THE WEEKENDS that turn into something more"

RULES for every headline:
- 1 to 2 short lines, ALL CAPS, max ~5 words total and each line max ~14 characters so it fits the image. Punchy, confident, premium — never cheesy or salesy.
- Pick exactly ONE word from the headline as the "accent" word (it will be coloured yellow). Choose the word with the most punch.
- A headline may optionally have a lowercase "subhead" (a short supporting line, max ~30 characters) and a "subheadAccent" (one word from the subhead) — use sparingly.
- South African English. No clichés like "drive your dreams". No emojis. No hashtags. No contact details.

EVERY item also needs a "caption" — the post's body text (what goes under the image):
- 2 to 3 short sentences. FRESH and DIFFERENT every time — never reuse wording across items or months.
- Always lead-generation / sale focused: spark interest and drive an enquiry, a website visit, or a sale.
- South African English, warm and confident. May reference White River / Mpumalanga.
- Do NOT include any URL, phone number, address, or hashtags in the caption — those are appended automatically. End with a light call-to-action phrase (e.g. "Enquire today", "Book your viewing", "Message us").

PILLAR-SPECIFIC GUIDANCE:
- showcase: bold statement about owning / driving a quality used car (studio hero shot). Do NOT mention the season.
- lifestyle: adventure / freedom / the open road / weekends (car in a scenic SA landscape). Do NOT mention the season or weather — this pillar is about the destination and the drive, not the time of year.
- maintenance: a USEFUL car-care TIP. lines = the punchy tip title; subhead = one factual sentence explaining it. Every tip must be DIFFERENT and genuinely useful (tyres, brakes, oil, service history, fuel, battery, aircon, wipers, suspension, cooling, cambelt, etc.). Do NOT reuse the same topic twice. Only mention the season if that specific tip is genuinely season-dependent (e.g. battery cold-starts) — most tips (tyres, oil, service history) apply year-round and should say nothing about the season.
  Maintenance items ALSO need an "imageSubject": a short description of the single MACRO photograph that illustrates THAT tip (e.g. "an extreme close-up of a car battery terminal with a clean clamp"). It must show the actual part the tip is about — one object, close up, workshop lighting, no whole car, no people, no text.
- seasonal: the ONLY pillar that should lean into the current South African season. Even so, vary the ANGLE each time (the activity, the light, the mood, a place, the school-holiday calendar) rather than repeating the season's name — at most one seasonal item in the whole batch may contain the literal season word in its headline or caption; the rest should evoke the season without naming it.

Never repeat the same word, phrase, or angle across different pillars in one batch — if "winter" (or any season word) shows up in one item, the rest must find a different way in.

Return STRICT JSON only.`

function coerceSpec(x: any): HeadlineSpec | null {
    if (!x || !Array.isArray(x.lines) || x.lines.length === 0) return null
    return {
        lines: x.lines.slice(0, 2).map((l: any) => String(l).toUpperCase()),
        accent: String(x.accent || '').toUpperCase(),
        subhead: typeof x.subhead === 'string' && x.subhead.trim() ? x.subhead.trim() : null,
        subheadAccent: typeof x.subheadAccent === 'string' && x.subheadAccent.trim() ? x.subheadAccent.trim() : null,
        caption: typeof x.caption === 'string' && x.caption.trim() ? x.caption.trim() : null,
        imageSubject: typeof x.imageSubject === 'string' && x.imageSubject.trim() ? x.imageSubject.trim() : null,
    }
}

function coerceList(arr: any, n: number): HeadlineSpec[] {
    const out: HeadlineSpec[] = []
    if (Array.isArray(arr)) {
        for (const item of arr) {
            const s = coerceSpec(item)
            if (s) out.push(s)
        }
    }
    return out.slice(0, n)
}

/**
 * Generates `count` fresh headlines per pillar. Returns null on any failure so
 * the templates fall back to their curated pools (the batch still succeeds).
 */
export async function generateFreshHeadlines(args: {
    count: number
    season: string
}): Promise<FreshHeadlines | null> {
    const key = process.env.OPENAI_API_KEY
    if (!key) return null

    const { count, season } = args
    const userPrompt = `Current South African season: ${season}.
Generate ${count} DISTINCT headlines for EACH pillar (showcase, lifestyle, maintenance, seasonal). All ${count * 4} must be unique — no repeated wording or topics.

Return JSON exactly like (every item MUST include a fresh "caption"):
{
  "showcase":    [{ "lines": ["...","..."], "accent": "WORD", "caption": "2-3 fresh sentences ending in a CTA." }, ...${count} total],
  "lifestyle":   [{ "lines": ["...","..."], "accent": "WORD", "subhead": "lower case line", "subheadAccent": "word", "caption": "..." }, ...],
  "maintenance": [{ "lines": ["TIP TITLE"], "accent": "WORD", "subhead": "one factual sentence.", "subheadAccent": "word", "imageSubject": "macro photo description for THIS tip", "caption": "..." }, ...],
  "seasonal":    [{ "lines": ["...","..."], "accent": "WORD", "caption": "..." }, ...]
}`

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 1.0,  // high temperature for variety across months
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
            }),
        })
        if (!res.ok) {
            console.error('[headlineGenerator] HTTP', res.status, (await res.text()).slice(0, 300))
            return null
        }
        const data = await res.json()
        const raw = JSON.parse(data?.choices?.[0]?.message?.content || '{}')

        const result: FreshHeadlines = {
            showcase: coerceList(raw.showcase, count),
            lifestyle: coerceList(raw.lifestyle, count),
            maintenance: coerceList(raw.maintenance, count),
            seasonal: coerceList(raw.seasonal, count),
        }

        // If any pillar came back short, signal failure so callers use the full curated pool.
        if (result.showcase.length < count || result.lifestyle.length < count ||
            result.maintenance.length < count || result.seasonal.length < count) {
            console.warn('[headlineGenerator] incomplete result, falling back to pools')
            return null
        }
        return result
    } catch (e: any) {
        console.error('[headlineGenerator] failed:', e?.message || e)
        return null
    }
}
