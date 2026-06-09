import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = path.join(__dirname, '..', '.env.local')

function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {}
    const content = fs.readFileSync(filePath, 'utf-8')
    const env = {}
    content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const index = trimmed.indexOf('=')
        if (index > 0) {
            env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim()
        }
    })
    return env
}

const env = loadEnv(envFile)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

function detectPostType(content) {
    if (content.includes('🔥')) return 'reel'
    if (content.includes('Full Walkthrough')) return 'video'
    return 'feed'
}

async function rewriteContent(originalContent, platforms, workspaceId) {
    const { data: intelArray } = await supabase
        .from('client_intelligence')
        .select('*')
        .eq('workspace_id', workspaceId)

    const intel = intelArray?.[0]
    if (!intel) return originalContent

    const postType = detectPostType(originalContent)

    const doNotPostRules = intel.do_not_post?.length
        ? `\nSTRICT DO NOT POST RULES:\n${intel.do_not_post.map(r => `- ${r}`).join('\n')}`
        : ''

    const keyMessages = intel.key_messages?.length
        ? `\nKey messages to naturally weave in (1-2 max):\n${intel.key_messages.map(m => `- ${m}`).join('\n')}`
        : ''

    const typeGuidance = {
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
        return completion.choices[0].message.content || originalContent
    } catch (err) {
        console.error('AI rewrite failed:', err.message)
        return originalContent
    }
}

async function main() {
    // Get Everest workspace
    const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('slug', 'everest-motoring')

    if (!workspaces || workspaces.length === 0) {
        console.log('No workspace found for everest-motoring')
        return
    }

    const workspaceId = workspaces[0].id
    console.log(`Workspace: ${workspaces[0].name} (${workspaceId})\n`)

    // 1. Get pending_approval posts
    const { data: pendingPosts } = await supabase
        .from('posts')
        .select('id, content, platforms, status, created_at')
        .eq('workspace_id', workspaceId)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

    console.log(`Found ${pendingPosts?.length || 0} pending_approval posts`)

    // 2. Get the published post from today (May 6) to recreate
    const { data: publishedPosts } = await supabase
        .from('posts')
        .select('id, content, platforms, status, created_at, media_urls, scheduled_at, vehicle_id')
        .eq('workspace_id', workspaceId)
        .eq('status', 'published')
        .gte('created_at', '2026-05-06')
        .order('created_at', { ascending: false })

    console.log(`Found ${publishedPosts?.length || 0} published posts from May 6\n`)

    // 3. Rewrite pending posts
    for (const post of (pendingPosts || [])) {
        const postType = detectPostType(post.content)
        console.log(`Rewriting pending post ${post.id} (${postType})...`)
        const rewritten = await rewriteContent(post.content, post.platforms, workspaceId)
        const { error } = await supabase
            .from('posts')
            .update({ content: rewritten })
            .eq('id', post.id)
        if (error) {
            console.error(`  ❌ Update failed:`, error.message)
        } else {
            console.log(`  ✅ Updated`)
        }
    }

    // 4. Recreate published posts
    for (const post of (publishedPosts || [])) {
        const postType = detectPostType(post.content)
        console.log(`Recreating published post ${post.id} (${postType})...`)
        const rewritten = await rewriteContent(post.content, post.platforms, workspaceId)
        const { data: newPost, error } = await supabase
            .from('posts')
            .insert({
                workspace_id: workspaceId,
                content: rewritten,
                platforms: post.platforms,
                media_urls: post.media_urls,
                scheduled_at: post.scheduled_at,
                vehicle_id: post.vehicle_id,
                status: 'pending_approval',
            })
            .select('id')
            .single()
        if (error) {
            console.error(`  ❌ Insert failed:`, error.message)
        } else {
            console.log(`  ✅ Created new post ${newPost.id} (pending_approval)`)
        }
    }

    console.log('\nDone!')
}

main()
