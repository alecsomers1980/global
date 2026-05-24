import { OpenAI } from 'openai'
import type { VehicleSummary } from '@/lib/inventory/fetchVehicles'

export interface GeneratedPost {
    pillar: string
    rationale: string
    day_offset: number
    vehicle_id?: string | null
    image_prompt: string
    style?: 'lifestyle' | 'studio'
    tagline?: string | null
    tagline_accent?: string | null
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
    vehicles?: VehicleSummary[]
    siteBaseUrl?: string
    vehiclePathTemplate?: string
}): Promise<CampaignResult> {
    const { durationDays, connectedPlatforms, intel, vehicles, siteBaseUrl, vehiclePathTemplate } = args

    const postsPerWeek = clamp(round(intel?.posting_cadence_observed?.facebook ?? 4), 3, 5)
    const postCount = round(postsPerWeek * durationDays / 7)

    // Compute Sunday offsets so GPT can skip them
    const tomorrow = new Date()
    tomorrow.setUTCHours(0, 0, 0, 0)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const sundayOffsets: number[] = []
    for (let d = 0; d < durationDays; d++) {
        const d2 = new Date(tomorrow)
        d2.setUTCDate(d2.getUTCDate() + d)
        if (d2.getUTCDay() === 0) sundayOffsets.push(d)
    }

    const hasInventory = !!(vehicles && vehicles.length > 0)

    // Inventory context block — reframed as segment context, not a product list.
    // Per-vehicle sales posts are handled by the Everest trigger, not this generator.
    let inventoryBlock = ''
    let vehicleOutputShape = ''
    let vehicleRules = ''
    let linkRule = ''

    if (hasInventory && vehicles) {
        const lines = vehicles.map(v => {
            const parts = [`${v.year} ${v.make} ${v.model}`]
            if (v.colour) parts.push(v.colour)
            if (v.transmission) parts.push(v.transmission)
            if (v.fuel_type) parts.push(v.fuel_type)
            if (Array.isArray(v.features) && v.features.length > 0) {
                parts.push(`features: ${v.features.slice(0, 3).join('/')}`)
            }
            return `- id: ${v.id} | ${parts.join(' | ')}${v.description ? ` | ${v.description.slice(0, 70)}` : ''}`
        })

        const linkTemplate = siteBaseUrl && vehiclePathTemplate
            ? `${siteBaseUrl}${vehiclePathTemplate}`
            : ''

        inventoryBlock = `
LIVE INVENTORY (use these for image_prompt vehicle references — same make/model/colour/year as listed):
${lines.join('\n')}

When a post is about a vehicle category, pick a SPECIFIC vehicle from this list and write the image_prompt to depict THAT EXACT vehicle: same year, make, model, colour. The background may be anywhere appropriate (typically a South African landscape — see SCENE RULES below).`

        vehicleOutputShape = '\n      "vehicle_id": "uuid from inventory or null. Set for any post that features a specific vehicle.",'
        vehicleRules = `
- About 60-70% of posts SHOULD feature a real vehicle from the LIVE INVENTORY — set "vehicle_id" to the matching uuid AND write the image_prompt to depict that exact car (same year, make, model, colour).
- The remaining 30-40% are tips/education/lifestyle without a specific vehicle — set "vehicle_id" to null. For these, the image_prompt may show a generic South African scene (e.g. a fuel station, a workshop, a family on a road trip).${linkTemplate ? `\n- For vehicle-bound FB posts, end the FB content with the link ${linkTemplate} — keep the literal "{slug}" token in the URL; the orchestrator resolves it.` : ''}`
        linkRule = linkTemplate ? ` For vehicle-bound FB posts, end with ${linkTemplate} using the literal "{slug}" token.` : ''
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
${inventoryBlock}
OUTPUT JSON SHAPE — RETURN EXACTLY THIS STRUCTURE:
{
  "strategy_rationale": "2-3 sentences explaining cadence and timing, citing the observed data${hasInventory ? ' and available inventory segments' : ''}",
  "pillars": ["string", "string", ...],
  "posts": [
    {
      "pillar": "string (one of the pillars)",
      "rationale": "one sentence on why this post fits the audience",${vehicleOutputShape}
      "image_prompt": "string (REQUIRED — 1-2 sentence visual brief for AI image generation, describing the scene to photograph. End with 'no text overlay, no logos'. Default 4:5 portrait.)",
      "style": "lifestyle | studio (REQUIRED)",
      "tagline": "string or null (REQUIRED for studio, null for lifestyle)",
      "tagline_accent": "single word from tagline or null (REQUIRED for studio, null for lifestyle)",
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

PILLAR MIX (rotate across these themes — aim for variety, no more than 2 consecutive posts on the same pillar):
- Vehicle showcases (a specific car from the inventory + lifestyle/aspiration angle)
- Adventure & exploration (4×4s, road trips, weekends away)
- Urban practicality (hatchbacks, sedans, daily-driver scenes)
- Fuel-saving tips (driving habits, route planning, vehicle setup that improves consumption — petrol AND diesel)
- Maintenance tips (service intervals, tyre care, oil checks, brake checks, when to visit a workshop)
- Safety tips (load distribution, child seats, night driving, winter prep)
- Financing & ownership (instalment basics, trade-in advice, total cost of ownership)
- Customer experience (handover scenes, satisfied owners — generic, not testimonial)
- Quality assurance (inspection, condition, why pre-owned can win)
- Seasonal South African content (rainy season tips, festive road safety, school holidays, lekker weekends)

SCENE RULES (apply to EVERY image_prompt):
- Set EVERY scene in South Africa. Use SA-specific landscapes and contexts: Mpumalanga lowveld, Drakensberg mountains, Lowveld, White River, Hazyview, Mbombela, Kruger area, Highveld, Garden Route, Cape Town's mountains and coastline, Joburg or Pretoria skylines, Karoo plains, KZN coast, Mpumalanga Panorama Route. AVOID North American / European scenery.
- For vehicle-bound posts, the image_prompt MUST name the vehicle's exact year, make, model, AND colour from the LIVE INVENTORY. Example: "A 2021 White Volkswagen T-Roc 1.4 TSI parked at a viewpoint along the Panorama Route in Mpumalanga at golden hour, mountains in the background, professional automotive photography, 4:5 portrait, no text overlay, no logos".

SOUTH AFRICAN CULTURAL DETAILS (CRITICAL — get these right or the post looks tone-deaf):
- Petrol stations: South African forecourts use UNIFORMED PETROL ATTENDANTS who fill the car for the customer. Drivers and owners do NOT fill their own cars — that is a North American convention and is wrong for SA. Petrol/diesel scenes should show an attendant (uniform, usually branded overalls — Engen, Shell, Sasol, Caltex, Astron Energy, Total) holding the pump nozzle and refuelling the vehicle while the customer stays in or near the car.
- Realistic seating — IMPORTANT: when depicting people inside or near a vehicle, show NO MORE THAN TWO PEOPLE TOTAL (typically a driver and one passenger, or two adults outside the car). Never depict back-seat passengers, large family groups inside the cabin, children in the front, people sitting on laps, or more occupants than the front-row seating allows. Two-people compositions read cleanly at social-media thumbnail size — bigger groups become AI-hallucinated noise.
- People: depict an authentic mix of South African ethnicities (Black, White, Coloured, Indian). Avoid all-white or all-one-ethnicity casting unless the specific scene calls for it.
- Number plates: leave plates blank/unreadable. Do NOT depict any text or numbers on plates.

- For tips/lifestyle posts (no vehicle), still use SA settings. Example: "A uniformed petrol attendant in branded overalls refuelling a small white hatchback at a South African Engen forecourt in Mbombela at dusk, the customer relaxed inside the car, warm lighting, editorial photography, 4:5 portrait, no text overlay, no logos".
- Every image_prompt MUST end with "no text overlay, no logos".

IMAGE STYLE MIX (vary the visual treatment across the batch — DO NOT use the same style for every post). EVERY post MUST include a "style" field set to either "lifestyle" or "studio":
- About 60% LIFESTYLE (set "style": "lifestyle"): editorial photography on location in South Africa, natural lighting, real environments (mountains, forecourts, dealerships, urban streets). The examples above are lifestyle. For these, set "tagline": null and "tagline_accent": null.
- About 40% STUDIO / BRAND (set "style": "studio"): dramatic studio automotive photography of the vehicle on a PURE BLACK BACKGROUND, hard rim lighting picking out body lines, deep shadows, a thin yellow accent or rim-light catching the side of the car (Everest brand colours are yellow #FFE600 and black). No people, no environment — just the vehicle isolated on black. Used for high-impact "hero" posts. The vehicle MUST be positioned in the LOWER 60% of the frame so the upper 40% is mostly empty black space available for a tagline overlay. Example studio prompt: "Studio automotive photography of a 2021 White Volkswagen T-Roc 1.4 TSI isolated on a pure black background, vehicle positioned in the lower-centre of the frame leaving upper 40% as empty black space for a text overlay, dramatic side rim lighting with a subtle yellow gel highlighting the silhouette, polished concrete floor reflection, three-quarter front angle, professional automotive catalogue lighting, 4:5 portrait, no people, no text overlay, no logos".

STUDIO POSTS ALSO REQUIRE A TAGLINE — emit these two fields for every studio post:
- "tagline": 2–4 short words, optionally split across two lines using ' | ' as the line break, all caps recommended. Examples: "LESS TALK | MORE TORQUE", "BUILT FOR | THE LOWVELD", "ADVENTURE | AWAITS", "DRIVE BOLD", "WHEELS UP".
- "tagline_accent": ONE single word that appears in the tagline, which we'll render in brand-yellow. Example: if tagline is "LESS TALK | MORE TORQUE", tagline_accent could be "MORE". The accent must match a word in the tagline exactly (case-insensitive).
Lifestyle posts MUST set both tagline and tagline_accent to null.

When picking the style for a given post:
- Vehicle showcases + premium/aspirational pillars → favour STUDIO.
- Adventure & exploration, urban practicality, tips, family/customer scenes → LIFESTYLE.
- The image should be either editorial lifestyle photography OR studio automotive photography — NOT a generic catalogue product shot.${vehicleRules}${linkRule}

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
        posts: (raw.posts || []).map((p: any) => {
            const style: 'lifestyle' | 'studio' = p.style === 'studio' ? 'studio' : 'lifestyle'
            // Studio posts MUST carry a tagline; lifestyle posts MUST NOT
            const tagline = style === 'studio' && typeof p.tagline === 'string' && p.tagline.trim() ? p.tagline.trim() : null
            const tagline_accent = tagline && typeof p.tagline_accent === 'string' && p.tagline_accent.trim() ? p.tagline_accent.trim() : null
            return {
                pillar: p.pillar || '',
                rationale: p.rationale || '',
                day_offset: typeof p.day_offset === 'number' ? p.day_offset : 0,
                vehicle_id: p.vehicle_id || null,
                image_prompt: p.image_prompt || `Professional lifestyle photography for ${intel?.industry || 'brand'} social media content, warm natural lighting, 4:5 portrait, no text overlay, no logos`,
                style,
                tagline,
                tagline_accent,
                variants: p.variants || {}
            }
        })
    }
}
