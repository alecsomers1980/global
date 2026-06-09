import { OpenAI } from 'openai'
import type { VehicleSummary } from '@/lib/inventory/fetchVehicles'

export type PostStyle = 'lifestyle_hero' | 'studio' | 'spec_card' | 'multi_car' | 'tip_card' | 'sell_yours'

export interface GeneratedPost {
    pillar: string
    rationale: string
    psychology_note?: string | null
    day_offset: number
    vehicle_id?: string | null
    vehicle_ids?: string[] | null
    image_prompt: string
    style?: PostStyle
    tagline?: string | null
    tagline_accent?: string | null
    cta_url?: string | null
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

type Archetype = 'product' | 'service' | 'hospitality' | 'education' | 'creator'

const PILLAR_POOLS: Record<Archetype, string[]> = {
    product: [
        'Vehicle/Product showcases',
        'Lifestyle & adventure',
        'Maintenance tips',
        'Fuel-saving tips',
        'Customer stories',
        'Educational/Expertise',
        'Behind-the-scenes',
        'Question/Engagement loop',
        'Seasonal SA content',
        'Sell your car (we buy your vehicle)',
    ],
    service: [
        'Authority & thought-leadership',
        'Educational/Explainer',
        'Case studies',
        'Q&A / Question',
        'Behind-the-scenes',
        'Industry commentary',
        'Customer wins',
        'Seasonal SA content',
    ],
    hospitality: [
        'Aspirational lifestyle',
        'Location showcase',
        'Guest stories',
        'Seasonal availability',
        'Behind-the-scenes',
        'Local events',
        'Question/Engagement',
        'Educational/Expertise',
    ],
    education: [
        'Community spotlights',
        'Student/parent achievements',
        'Calendar events',
        'Educational tips',
        'Behind-the-scenes',
        'Parent communication',
        'Question/Engagement',
    ],
    creator: [
        'Authority/Thought-leadership',
        'Personal story',
        'Hot take/opinion',
        'Question/Engagement',
        'Behind-the-scenes',
        'Educational',
        'Customer/audience wins',
    ],
}

// Pillar → default template mapping. The model may override with judgment
// but these are the expected defaults.
const PILLAR_STYLE_MAP: Record<string, PostStyle> = {
    'Maintenance tips': 'tip_card',
    'Fuel-saving tips': 'tip_card',
    'Educational/Expertise': 'tip_card',
    'Educational/Explainer': 'tip_card',
    'Educational tips': 'tip_card',
    'Sell your car (we buy your vehicle)': 'sell_yours',
    'Seasonal SA content': 'lifestyle_hero',
    'Customer stories': 'lifestyle_hero',
    'Guest stories': 'lifestyle_hero',
    'Student/parent achievements': 'lifestyle_hero',
    'Community spotlights': 'lifestyle_hero',
    'Vehicle/Product showcases': 'multi_car',
}

export async function generateCampaign(args: {
    workspaceId: string
    durationDays: number
    connectedPlatforms: string[]
    intel: any
    vehicles?: VehicleSummary[]
    siteBaseUrl?: string
    vehiclePathTemplate?: string
    archetype?: Archetype
    contact?: {
        phone?: string | null
        email?: string | null
        websiteUrl?: string | null
        location?: string | null
        defaultHashtags?: string[]
        sellYourCarUrl?: string | null
    }
}): Promise<CampaignResult> {
    const { durationDays, connectedPlatforms, intel, vehicles, siteBaseUrl, vehiclePathTemplate, archetype, contact } = args
    const arch: Archetype = archetype || 'product'
    const pillarPool = PILLAR_POOLS[arch]
    const pillarPoolList = pillarPool.map(p => `- ${p}`).join('\n')

    const postsPerWeek = clamp(round(intel?.posting_cadence_observed?.facebook ?? 6), 5, 6)
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

    // Contact block for contact strip, hashtags, cta_url
    const contactPhone = contact?.phone || null
    const contactWebsite = contact?.websiteUrl || null
    const contactLocation = contact?.location || null
    const contactHashtags = contact?.defaultHashtags || []
    const sellYourCarUrl = contact?.sellYourCarUrl || null

    let contactStripBlock = ''
    if (contactPhone || contactWebsite || contactLocation) {
        const lines: string[] = []
        if (contactPhone) lines.push(`📞 ${contactPhone}`)
        if (contactWebsite) lines.push(`🌐 ${contactWebsite}`)
        if (contactLocation) lines.push(`📍 ${contactLocation}`)
        contactStripBlock = lines.join('\n')
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
      "rationale": "one sentence on why this post fits the audience",
      "psychology_note": "single sentence (max 140 chars) explaining the psychological driver",${vehicleOutputShape}
      "vehicle_ids": ["uuid", "uuid"] or null (for multi_car: 3-4 vehicle uuids from inventory),
      "image_prompt": "string (REQUIRED — see per-style image_prompt rules below. End with the PHOTOREALISM tail.)",
      "style": "lifestyle_hero | studio | spec_card | multi_car | tip_card | sell_yours (REQUIRED)",
      "tagline": "string or null (REQUIRED for studio and tip_card, null for others)",
      "tagline_accent": "single word from tagline or null (REQUIRED for studio, null for others)",
      "cta_url": "string or null (REQUIRED for sell_yours, null for others)",
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

PILLAR POOL (this workspace is archetype: ${arch} — pick from these pillars, use at least 5 distinct pillars across the batch, no more than 2 consecutive posts on the same pillar):
${pillarPoolList}

PSYCHOLOGY NOTE (MANDATORY for every post):
Every post MUST include a "psychology_note" field — a SINGLE sentence (max 140 chars) explaining the psychological driver this post leverages. Examples: "Leverages aspiration and identity formation — viewers picture themselves on this road trip.", "Triggers loss-aversion — limited stock framing creates urgency.", "Open question taps the social need to be heard, driving comments and reach via algorithmic engagement signals." Use plain English; do not parrot terminology if it doesn't fit.

HOOK RULE (FACEBOOK — CRITICAL):
The first 1-2 lines of the FB variant content MUST be a HOOK — a curiosity gap, surprising fact, bold claim, sensory detail, or question. The first 90 characters before any line break is the hook surface. Never open with slow stems like "Today we are excited to share...", "At [Brand] we believe...", "Here at [Brand]...". Use active verbs, concrete imagery, or direct address.

SAFETY RULE:
Hooks may use curiosity, empathy, surprise, or aspiration. Do NOT use controversy, divisiveness, political topics, or shock tactics. Brand safety is non-negotiable.

SALES-DRIVEN CAPTION STRUCTURE (Facebook content body, BEFORE the contact strip):
Every FB content body MUST follow this 3-part structure:
1. HOOK (1-2 lines, first line break within 90 chars) — curiosity/sensory/question
2. BODY (2-4 short paragraphs) — benefits, sensory detail, social proof, or storytelling
3. CTA — one clear ask: "Book a test drive", "WhatsApp us today", "View it on our website: {link}", "Get your free trade-in offer", etc.
The CTA line is BEFORE the contact strip. Keep whole FB content under 1500 chars including strip + hashtags.

CONTACT STRIP (MANDATORY for every Facebook variant):
Every Facebook variant.content MUST end with a contact strip on its own paragraph (preceded by a blank line):
${contactStripBlock || '(contact details not set — omit the strip entirely)'}
If a field shows 'N/A', omit that line. Substitute literally — no smart quotes.

For Instagram variants, append only the phone and website lines (drop location to save chars).
For TikTok variants, NO contact strip (it's a script hook, not a caption).

HASHTAG STRATEGY:
- FB hashtags: pick 3-5 from the default brand hashtags, then add 1-2 post-specific tags.
- IG hashtags: pick 5-8 from defaults + 2-4 post-specific = total 7-12.
- TikTok hashtags: 3-5 trend-aware tags.
Default brand hashtags: ${contactHashtags.length > 0 ? contactHashtags.join(' ') : '(none — invent appropriate ones based on intel)'}

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

SIX-TEMPLATE SYSTEM — every post MUST use one of these six styles. Pick the style based on the pillar using this default map, but use judgment to ensure variety across the batch (aim for at least one post of each style):

PILLAR → DEFAULT STYLE MAP:
- "Maintenance tips", "Fuel-saving tips", "Educational/Expertise", "Educational/Explainer", "Educational tips" → "tip_card"
- "Sell your car (we buy your vehicle)" → "sell_yours"
- "Seasonal SA content", "Customer stories", "Guest stories", "Student/parent achievements", "Community spotlights" → "lifestyle_hero"
- "Vehicle/Product showcases" → "multi_car" (for 3-4 vehicle grid) or "studio" or "spec_card"
- All other pillars → use "studio" or "lifestyle_hero" based on subject matter

PHOTOREALISM TAIL (CRITICAL — every image_prompt MUST end with this exact string, do not paraphrase):
"shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos"

--- TEMPLATE 1: lifestyle_hero — ~20% of posts ---
Editorial photography on location in South Africa, natural lighting, real environments. Set "tagline": null, "tagline_accent": null. Example prompt: "A happy South African couple standing beside their new pre-owned SUV at a dealership handover bay in White River, Mpumalanga, warm golden hour sun, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos"

--- TEMPLATE 2: studio — ~20% of posts ---
Vehicle isolated on PURE BLACK with rim lighting. Vehicle in LOWER 60%, upper 40% empty for tagline. TAGLINE REQUIRED (2-4 words, optional " | " split, all caps). tagline_accent = one word from tagline. Example: "Studio automotive photography of a [YEAR] [COLOUR] [MAKE] [MODEL] isolated on a pure black background, vehicle positioned in the lower-centre of the frame leaving upper 40% as empty black space for a text overlay, dramatic side rim lighting with a subtle yellow gel highlighting the silhouette, polished concrete floor reflection, three-quarter front angle, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos"

--- TEMPLATE 3: spec_card — ~15% of posts ---
Clean studio shot, car in UPPER 65%, bottom 35% clean dark space for text panel. Set vehicle_id to inventory uuid, tagline: null, tagline_accent: null. Example: "Studio automotive photography of a [YEAR] [COLOUR] [MAKE] [MODEL] on a smooth dark-grey gradient background fading to pure black at the bottom, vehicle positioned in the UPPER 65% of the frame, three-quarter front angle, soft top-lit studio lighting with subtle yellow rim accent on body lines, polished concrete reflection, leave bottom 35% as clean empty dark space for a text panel, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos"

--- TEMPLATE 4: multi_car — ~15% of posts ---
Grid of 3-4 vehicles from inventory. Set "vehicle_ids" to an array of 3-4 inventory uuids. The AI image_prompt describes an EMPTY branded background (cars are composited by the pipeline). Example: "A clean dark-charcoal-to-black gradient background with subtle yellow geometric accent lines, professional product photography backdrop, empty composition designed to hold multiple car photos composited on top, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos, no people"

--- TEMPLATE 5: tip_card — ~15% of posts ---
Pure typography card — NO vehicle in the image. The image_prompt describes a macro icon/texture background. Set "tagline": the tip's hook (max 6 words). Set "psychology_note": the key insight/subhead (max 12 words). tagline_accent: null. Example: "A close-up macro photograph of a yellow magnifying-glass icon on a pure black textured background, dramatic studio rim-lighting, subtle Mpumalanga-inspired pattern barely visible in the dark texture, leave generous empty black space for a text overlay, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos"

--- TEMPLATE 6: sell_yours — ~10% of posts ---
Clean designed card — NO people, NO salesperson scenes. Set "cta_url" to "${sellYourCarUrl || ''}" (REQUIRED). The image_prompt describes a single car silhouette on glossy black floor. Example: "A clean side-profile silhouette of a single dark-grey hatchback parked on a glossy black floor, dramatic single-source studio rim-lighting outlining the car body, deep shadow background, vehicle in the lower 50% of the frame, upper 50% pure black empty space for headline text, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos"

SELL-YOURS FB CONTENT: open with a curiosity hook about selling/upgrading, mention "fast offer", "free valuation", "trade-in welcome", end body with "Get your free valuation: ${sellYourCarUrl || ''}" THEN the contact strip.

When picking the style for a given post, start from the PILLAR → DEFAULT STYLE MAP above and override with judgment for variety. Ensure at least one post of each style across the batch. The image must be photorealistic — NOT a cartoon, CGI, 3D render, or illustration.${vehicleRules}${linkRule}

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
            const ALL_STYLES: PostStyle[] = ['lifestyle_hero', 'studio', 'spec_card', 'multi_car', 'tip_card', 'sell_yours']
            const style: PostStyle = ALL_STYLES.includes(p.style) ? p.style : 'lifestyle_hero'
            // studio and tip_card require a tagline; others do not
            const tagline = (style === 'studio' || style === 'tip_card') && typeof p.tagline === 'string' && p.tagline.trim() ? p.tagline.trim() : null
            const tagline_accent = tagline && style === 'studio' && typeof p.tagline_accent === 'string' && p.tagline_accent.trim() ? p.tagline_accent.trim() : null
            const vehicle_ids = style === 'multi_car' && Array.isArray(p.vehicle_ids) && p.vehicle_ids.length >= 2
                ? p.vehicle_ids.slice(0, 4)
                : null
            return {
                pillar: p.pillar || '',
                rationale: p.rationale || '',
                psychology_note: typeof p.psychology_note === 'string' && p.psychology_note.trim() ? p.psychology_note.trim() : null,
                day_offset: typeof p.day_offset === 'number' ? p.day_offset : 0,
                vehicle_id: p.vehicle_id || null,
                vehicle_ids,
                image_prompt: p.image_prompt || `Professional editorial photography for ${intel?.industry || 'brand'} social media content, shot on a Sony A7R V, 50mm f/1.8, natural golden-hour lighting, RAW photograph, editorial commercial photography, photorealistic, sharp focus, no illustration, no CGI, no 3D render, no cartoon, no painting, 4:5 portrait, no text overlay, no logos`,
                style,
                tagline,
                tagline_accent,
                cta_url: typeof p.cta_url === 'string' && p.cta_url.trim() ? p.cta_url.trim() : null,
                variants: p.variants || {}
            }
        })
    }
}
