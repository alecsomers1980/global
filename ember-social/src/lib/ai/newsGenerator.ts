import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type NewsCategory = 'buying-guide' | 'local' | 'model-review'

export interface NewsGenInput {
    category: NewsCategory
    recentTitles?: string[]
    featuredCar?: {
        id?: string
        year?: number
        make?: string
        model?: string
        main_image_url?: string
        description?: string
    } | null
    brand?: {
        businessName?: string
        industry?: string
        audience?: string
        voice?: string
        location?: string
    }
}

export interface GeneratedArticle {
    title: string
    slug: string
    excerpt: string
    meta_title: string
    meta_description: string
    body_md: string
    hero_image_url?: string
    category: NewsCategory
    featured_vehicle_id?: string | null
}

const HERO_DEFAULTS: Record<NewsCategory, string> = {
    'buying-guide': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80',
    'local': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80',
    'model-review': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1600&q=80',
}

export function slugify(input: string): string {
    return (input || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 90)
}

function pickHero(category: NewsCategory, car?: NewsGenInput['featuredCar']): string {
    if (category === 'model-review' && car?.main_image_url) return car.main_image_url
    return HERO_DEFAULTS[category]
}

export function pickNextCategory(recent: NewsCategory[] = []): NewsCategory {
    const pool: NewsCategory[] = ['buying-guide', 'local', 'model-review']
    const last3 = recent.slice(0, 3)
    const counts: Record<NewsCategory, number> = { 'buying-guide': 0, 'local': 0, 'model-review': 0 }
    for (const c of last3) counts[c] = (counts[c] || 0) + 1
    const min = Math.min(...pool.map(c => counts[c]))
    const candidates = pool.filter(c => counts[c] === min)
    return candidates[Math.floor(Math.random() * candidates.length)]
}

function buildPrompt(input: NewsGenInput): string {
    const brand = input.brand || {}
    const businessName = brand.businessName || 'the dealership'
    const location = brand.location || ''
    const voice = brand.voice || 'trustworthy, friendly, knowledgeable'
    const audience = brand.audience || 'local vehicle buyers'

    const recent = (input.recentTitles || []).slice(0, 6).map(t => `- ${t}`).join('\n') || '(none)'

    const categoryBrief =
        input.category === 'buying-guide'
            ? `Write a practical vehicle BUYING GUIDE (e.g. "How to check a used bakkie before buying", "Diesel vs petrol for long-distance commuting", "Financing a used vehicle in SA"). Actionable, specific, ~800-1100 words.`
            : input.category === 'local'
                ? `Write a LOCAL/AREA-FOCUSED article tying vehicles to ${location || 'the local area'} (e.g. best vehicles for Lowveld roads, trip ideas, local servicing tips). ~800-1100 words.`
                : `Write a MODEL-SPECIFIC review${input.featuredCar ? ` focused on the ${input.featuredCar.year} ${input.featuredCar.make} ${input.featuredCar.model}` : ''}. Cover strengths, common issues to check, who it suits, running costs. ~800-1100 words.`

    return `You are an expert automotive content writer for ${businessName}${location ? ` in ${location}` : ''}.
Voice: ${voice}. Audience: ${audience}.

${categoryBrief}

Avoid repeating these recent titles:
${recent}

Return STRICT JSON (no markdown fences, no code blocks) with these exact keys:
{
  "title": "Compelling title, 50-70 chars",
  "slug": "kebab-case-slug",
  "excerpt": "1-2 sentence summary, ~140-180 chars",
  "meta_title": "SEO title, 50-60 chars",
  "meta_description": "SEO description, 140-155 chars",
  "body_md": "Full article body in GitHub-flavored markdown, with ## subheadings, short paragraphs, bullet lists where helpful. Do NOT include the H1 title again inside the body."
}

CRITICAL JSON RULES:
- All string values MUST have internal double-quotes escaped as \\"
- Newlines inside strings MUST be escaped as \\n
- No trailing commas
- No comments
- No preamble, no explanation — valid JSON only.`
}

function extractJson(text: string): any {
    // Strip markdown fences if the model wrapped the output
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

    // Attempt 1: direct parse
    try { return JSON.parse(cleaned) } catch { /* fall through */ }

    // Attempt 2: extract the outermost { … }
    const first = cleaned.indexOf('{')
    const last = cleaned.lastIndexOf('}')
    if (first >= 0 && last > first) {
        const slice = cleaned.slice(first, last + 1)
        try { return JSON.parse(slice) } catch { /* fall through */ }

        // Attempt 3: fix unescaped control characters inside string values
        // This targets the common failure: literal newlines inside body_md
        const sanitized = slice.replace(
            /"body_md"\s*:\s*"/,
            (match) => match // keep the key as-is
        ).replace(
            /([^\\])\n/g,    // un-escaped real newlines
            '$1\\n'
        ).replace(
            /([^\\])\t/g,    // un-escaped tabs
            '$1\\t'
        )
        try { return JSON.parse(sanitized) } catch { /* fall through */ }
    }

    throw new Error('Failed to parse generator JSON — raw output: ' + cleaned.slice(0, 200))
}

export async function generateNewsArticle(input: NewsGenInput): Promise<GeneratedArticle> {
    const prompt = buildPrompt(input)

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: 'You write long-form SEO-ready articles for car dealerships. Always return strict, valid JSON. Never include markdown code fences around the JSON.' },
            { role: 'user', content: prompt },
        ],
    })

    const raw = completion.choices[0]?.message?.content || ''
    const parsed = extractJson(raw)

    const title: string = parsed.title?.trim() || 'Untitled'
    const slug: string = slugify(parsed.slug || title)
    const hero = pickHero(input.category, input.featuredCar || undefined)

    return {
        title,
        slug,
        excerpt: parsed.excerpt?.trim() || '',
        meta_title: parsed.meta_title?.trim() || title,
        meta_description: parsed.meta_description?.trim() || '',
        body_md: parsed.body_md || '',
        hero_image_url: hero,
        category: input.category,
        featured_vehicle_id: input.featuredCar?.id || null,
    }
}
