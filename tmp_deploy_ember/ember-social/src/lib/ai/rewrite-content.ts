import { OpenAI } from 'openai'
import { createServerSupabaseClient } from '@/lib/supabase/client'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function detectPostType(content: string): 'feed' | 'reel' | 'video' {
    if (content.includes('🔥')) return 'reel'
    if (content.includes('Full Walkthrough')) return 'video'
    return 'feed'
}

export async function rewriteSocialContent(
    originalContent: string,
    platforms: string[],
    workspaceId: string
): Promise<string> {
    const supabase = await createServerSupabaseClient()

    const { data: intelArray } = await supabase
        .from('client_intelligence')
        .select('*')
        .eq('workspace_id', workspaceId)

    const intel = intelArray?.[0] as any
    if (!intel) return originalContent

    const postType = detectPostType(originalContent)

    const doNotPostRules = intel.do_not_post?.length
        ? `\nSTRICT DO NOT POST RULES:\n${intel.do_not_post.map((r: string) => `- ${r}`).join('\n')}`
        : ''

    const keyMessages = intel.key_messages?.length
        ? `\nKey messages to naturally weave in (1-2 max):\n${intel.key_messages.map((m: string) => `- ${m}`).join('\n')}`
        : ''

    const typeGuidance: Record<string, string> = {
        feed: 'This is a FEED post for Facebook/Instagram feed. Use the 🚗 emoji header format. Rewrite the description into 2-4 short conversational sentences (roughly 60-120 words) — engaging, like a knowledgeable friend sharing a great find, not stiff car-dealer language. If the original description is long, condense it; if it is short, keep it tight. Keep the ✅ feature bullets. Keep the 🔗, 📞, 📧, 📍 footer and hashtags.',
        reel: 'This is a REEL post for Reels/TikTok/Shorts — short, energetic, scroll-stopping. Keep the 🔥 header format. Description must be 1-2 punchy sentences MAX (under 200 characters). If the source description is long, aggressively shorten it — pick the most exciting hook only. Keep 👉 CTA, 📞, 🔗, and hashtags.',
        video: 'This is a FULL WALKTHROUGH / long-form video post. Keep the "| Full Walkthrough" header and the full price/mileage/transmission/fuel specs. Rewrite the descriptive paragraphs into confident, warm narration — not a classified ad. Length can stay roughly similar to the source for this type. Keep all Features bullets, the ━━━ separator, the full contact block, and hashtags.',
    }

    const systemPrompt = `You are an expert social media copywriter for a premium pre-owned vehicle dealership in South Africa.

CLIENT PROFILE:
Brand Voice: ${intel.brand_voice || 'Professional, confident, transparent. Warm but never salesy.'}
Target Audience: ${intel.target_audience || 'South African car buyers'}
${doNotPostRules}
${keyMessages}

POST TYPE: ${typeGuidance[postType] || typeGuidance.feed}
Target Platforms: ${platforms.join(', ')}

RULES (MANDATORY):
1. Keep ALL factual data exactly as in the original: price, mileage, year, make, model, transmission, fuel type, features list, phone number, email, location, URL
2. Keep the emoji headers (🚗, 🔥), separator lines (━━━), and structural elements
3. Rewrite the descriptive paragraphs to be WARM, ENGAGING, and CONVERSATIONAL — match the brand voice
4. Adjust the description length to suit the post type (see POST TYPE guidance above) — feed and reel posts should be condensed even if the source description is long; video posts can stay longer
5. NEVER leave a literal "..." or other truncation artefact in the output — rewrite into a complete sentence instead
6. Vary sentence structure; avoid repetitive patterns from the original
7. Naturally weave in 1-2 key messages IF they fit naturally
8. NEVER violate any DO NOT POST rule
9. Keep South African English spelling
10. Hashtags at the end can be slightly refined but keep the core ones (#EverestMotoring, #PreOwned, #UsedCars, #Mpumalanga, #WhiteRiver)
11. NEVER add information not in the original — no fake specs, prices, features, or claims
12. NEVER add phrases like "Here's a rewritten version" or any meta-commentary

Return ONLY the rewritten post content, nothing else.`

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: originalContent },
            ],
            temperature: 0.7,
        })

        const rewritten = completion.choices[0].message.content
        return rewritten || originalContent
    } catch (err) {
        console.error('AI rewrite failed, using original content:', err)
        return originalContent
    }
}
