import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'

export async function POST(req: Request) {
    try {
        const { url } = await req.json()
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Fetch website HTML — same pattern as analyze-website
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch website: ${response.statusText}` },
                { status: 502 }
            )
        }

        const html = await response.text()

        // Extract CSS-relevant content (style tags, inline styles, meta tags)
        const cssChunks: string[] = []

        // Style tag contents
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
        let m
        while ((m = styleRegex.exec(html)) !== null) {
            if (m[1].trim()) cssChunks.push(m[1].trim())
        }

        // Google Fonts links
        const fontsRegex = /fonts\.googleapis\.com\/css2?\?[^"'\s>]+/gi
        while ((m = fontsRegex.exec(html)) !== null) {
            cssChunks.push(`Google Font: ${m[0]}`)
        }

        // Theme color meta
        const themeRegex = /meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/gi
        while ((m = themeRegex.exec(html)) !== null) {
            cssChunks.push(`theme-color: ${m[1]}`)
        }

        // og:image
        const ogRegex = /meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi
        while ((m = ogRegex.exec(html)) !== null) {
            cssChunks.push(`og:image: ${m[1]}`)
        }

        // apple-touch-icon / favicon
        const iconRegex = /link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)[^"']*["'][^>]+href=["']([^"']+)["']/gi
        while ((m = iconRegex.exec(html)) !== null) {
            cssChunks.push(`icon: ${m[1]}`)
        }

        // Also extract visible text for brand context
        const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 3000)

        const cssContent = cssChunks.join('\n').slice(0, 5000)

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert brand identity analyst. Extract the visual brand identity from the provided website CSS and content.

Return a JSON object with exactly these fields:
- primary_color: hex string (e.g. "#FF5733") — the dominant brand color
- secondary_color: hex string — supporting/background brand color
- accent_color: hex string — call-to-action or highlight color
- font_preference: string — closest match from ONLY these options: Inter, Montserrat, Playfair Display, Roboto, Poppins, Open Sans, Space Grotesk, DM Sans
- logo_url: string or null — best logo/icon URL found (og:image, apple-touch-icon, favicon). Use absolute URL. Set null if none found.

If colors can't be determined exactly, make your best educated guess based on the industry and brand style. Always return valid hex codes.

RESPONSE FORMAT: JSON ONLY.`
                },
                {
                    role: 'user',
                    content: `Website: ${url}\n\n=== CSS & META ===\n${cssContent}\n\n=== PAGE TEXT ===\n${textContent}`
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Brand analysis error:', error)
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 })
    }
}
