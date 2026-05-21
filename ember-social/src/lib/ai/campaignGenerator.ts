import { OpenAI } from 'openai'

export interface GeneratedPost {
    pillar: string
    rationale: string
    day_offset: number
    variants: Partial<Record<'facebook' | 'instagram' | 'tiktok', { content: string; hashtags: string[] }>>
}

export interface CampaignResult {
    strategy_rationale: string
    pillars: string[]
    posts: GeneratedPost[]
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val))
}

function round(val: number): number {
    return Math.round(val)
}

export async function generateCampaign(args: {
    workspaceId: string
    durationDays: number
    connectedPlatforms: string[]
    intel: any
}): Promise<CampaignResult> {
    const { durationDays, connectedPlatforms, intel } = args

    const postsPerWeek = clamp(round(intel?.posting_cadence_observed?.facebook ?? 4), 3, 5)
    const postCount = round(postsPerWeek * durationDays / 7)
    const defaultHour = intel?.best_performing_hours?.facebook?.[0] ?? 9

    // Compute which day-of-week offsets are Sundays so GPT can skip them.
    // day_offset 0 = tomorrow. Build a list of Sunday offsets within the range.
    const tomorrow = new Date()
    tomorrow.setUTCHours(0, 0, 0, 0)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const sundayOffsets: number[] = []
    for (let d = 0; d < durationDays; d++) {
        const d2 = new Date(tomorrow)
        d2.setUTCDate(d2.getUTCDate() + d)
        if (d2.getUTCDay() === 0) sundayOffsets.push(d)
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const systemPrompt = `You are a senior social media strategist generating a ${durationDays}-day plan.

CLIENT PROFILE:
- Industry: ${intel?.industry || 'unknown'}
- Audience: ${intel?.target_audience || 'unknown'}
- Stated voice: ${intel?.brand_voice || 'unknown'}
- Observed voice (from real posts): ${intel?.historical_voice || 'unknown'}
- Top-performing themes: ${intel?.top_performing_themes?.join(', ') || 'unknown'}
- Goals: ${intel?.goals || 'unknown'}
- Do not post: ${intel?.do_not_post?.join(', ') || 'none'}
- Connected platforms: ${connectedPlatforms.join(', ')}

OUTPUT JSON SHAPE — RETURN EXACTLY THIS STRUCTURE:
{
  "strategy_rationale": "2-3 sentences explaining cadence and timing, citing the observed data",
  "pillars": ["string", "string", ...],
  "posts": [
    {
      "pillar": "string (one of the pillars)",
      "rationale": "one sentence on why this post fits the audience",
      "day_offset": 0,
      "variants": {
        "facebook":  { "content": "string", "hashtags": ["string"] },
        "instagram": { "content": "string", "hashtags": ["string"] },
        "tiktok":    { "content": "string (script hook)", "hashtags": ["string"] }
      }
    }
  ]
}

RULES:
- Generate EXACTLY ${postCount} posts.
- day_offset is 0-indexed days from tomorrow, spread evenly across the ${durationDays} duration, no Sundays. Sunday offsets to skip: ${sundayOffsets.join(', ') || 'none'}.
- Per-platform variants: FB longer (max 600 chars), IG punchier with emojis (max 220 chars), TikTok = a script hook (max 150 chars).
- Only emit variants for platforms in: ${connectedPlatforms.join(', ')}. ALWAYS emit a facebook variant (fallback for the content column).
- Hashtags: FB 2-4, IG 5-10, TikTok 3-6.
- Voice must match observed voice, not just stated voice.

RESPONSE FORMAT: JSON ONLY.`

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a ${durationDays}-day social media campaign plan with ${postCount} posts.` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
    })

    const raw = JSON.parse(completion.choices[0].message.content || '{}')

    return {
        strategy_rationale: raw.strategy_rationale || '',
        pillars: raw.pillars || [],
        posts: (raw.posts || []).map((p: any) => ({
            pillar: p.pillar || '',
            rationale: p.rationale || '',
            day_offset: typeof p.day_offset === 'number' ? p.day_offset : 0,
            variants: p.variants || {}
        }))
    }
}
