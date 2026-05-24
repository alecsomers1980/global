// Image generation via OpenAI gpt-image-1. We had this on Gemini originally
// but the user's free-tier key 429s on every call (image gen needs a paid
// tier billing-attached project). OpenAI is already configured with a paid
// key, so swap providers to ship.

const OPENAI_SIZE_BY_ASPECT: Record<string, '1024x1024' | '1024x1536' | '1536x1024'> = {
    '1:1': '1024x1024',
    '4:5': '1024x1536',   // 2:3, the closest portrait OpenAI offers
    '9:16': '1024x1536',
}

export async function generateLifestyleImage(args: {
    prompt: string
    aspectRatio?: '1:1' | '4:5' | '9:16'
}): Promise<{ ok: true; bytes: Buffer; mimeType: string } | { ok: false; error: string }> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
        return { ok: false, error: 'OPENAI_API_KEY not set' }
    }

    const ratio = args.aspectRatio || '4:5'
    const size = OPENAI_SIZE_BY_ASPECT[ratio] || '1024x1536'

    try {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-image-1',
                prompt: args.prompt,
                n: 1,
                size,
                quality: 'medium',     // 'low' | 'medium' | 'high'; medium is the sweet spot for social
                output_format: 'jpeg',
            }),
        })

        if (!res.ok) {
            const errText = await res.text()
            return { ok: false, error: `OpenAI Images ${res.status}: ${errText.slice(0, 240)}` }
        }

        const data = await res.json()
        const b64 = data?.data?.[0]?.b64_json
        if (!b64) {
            return { ok: false, error: 'No b64_json in OpenAI response' }
        }

        return {
            ok: true,
            bytes: Buffer.from(b64, 'base64'),
            mimeType: 'image/jpeg',
        }
    } catch (e: any) {
        return { ok: false, error: e.message || 'OpenAI image generation failed' }
    }
}
