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
        feed: 'This is a FEED post. Keep it medium-length, warm but punchy. Use the 🚗 emoji header format. The description paragraph should be engaging and conversational — rewrite the stiff car-dealer language into something that feels like a knowledgeable friend sharing a great find. Keep the ✅ feature bullets. Keep the 🔗, 📞, 📧, 📍 footer and hashtags.',
        reel: 'This is a REEL post — short, energetic, designed for video-first platforms (Reels/TikTok/Shorts). Keep the 🔥 header format. Make the text punchy and scroll-stopping. Very short description (1-2 sentences max). Keep 👉 CTA, 📞, 🔗, and hashtags.',
        video: 'This is a FULL WALKTHROUGH / long-form video post. Keep the "| Full Walkthrough" header and the full price/mileage/transmission/fuel specs. The descriptive paragraphs should be rewritten to sound more like a confident, warm narration — not a classified ad. Keep all Features bullets, the ━━━ separator, the full contact block, and hashtags.',
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
4. Keep roughly the same length — do not dramatically shorten or lengthen
5. Vary sentence structure; avoid repetitive patterns from the original
6. Naturally weave in 1-2 key messages IF they fit naturally
7. NEVER violate any DO NOT POST rule
8. Keep South African English spelling
9. Hashtags at the end can be slightly refined but keep the core ones (#EverestMotoring, #PreOwned, #UsedCars, #Mpumalanga, #WhiteRiver)
10. NEVER add information not in the original — no fake specs, prices, features, or claims
11. NEVER add phrases like "Here's a rewritten version" or any meta-commentary

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
