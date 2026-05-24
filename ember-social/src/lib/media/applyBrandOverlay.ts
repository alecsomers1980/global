import sharp from 'sharp'

function escapeXml(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Renders an optional bold tagline in the upper area of the image. The
 * tagline may use ` | ` as a line break to render two lines; an accent
 * word (if present and matched in the tagline) is coloured in `accent`.
 * Returns a full-image-sized SVG overlay buffer, or null when nothing to draw.
 */
async function renderTaglineOverlay(args: {
    width: number
    height: number
    tagline: string
    accentWord?: string | null
    accent: string
}): Promise<Buffer | null> {
    const { width, height, tagline, accentWord, accent } = args
    const raw = tagline
        .split(/\s*\|\s*|\n+/)
        .map(s => s.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 2)
    if (raw.length === 0) return null

    // Font size scales with image width; tight letter-spacing for that designed look.
    const fontSize = Math.max(40, Math.round(width * 0.095))
    const lineGap = Math.round(fontSize * 0.12)
    const startY = Math.round(height * 0.27) + fontSize

    const accentUpper = (accentWord || '').trim().toUpperCase()
    const accentRe = accentUpper
        ? new RegExp(`\\b(${escapeRegExp(accentUpper)})\\b`)
        : null

    const lineEls: string[] = []
    for (let i = 0; i < raw.length; i++) {
        const text = raw[i]
        const y = startY + i * (fontSize + lineGap)
        let inner: string
        if (accentRe && accentRe.test(text)) {
            const parts = text.split(accentRe)
            inner = parts
                .filter(p => p !== '')
                .map(p =>
                    p.toUpperCase() === accentUpper
                        ? `<tspan fill="${escapeXml(accent)}">${escapeXml(p)}</tspan>`
                        : `<tspan fill="white">${escapeXml(p)}</tspan>`
                )
                .join('')
        } else {
            inner = `<tspan fill="white">${escapeXml(text)}</tspan>`
        }
        // Subtle drop shadow for legibility on lifestyle backgrounds (filter via
        // a duplicate text element underneath rather than SVG filter, since librsvg's
        // filter support is patchy).
        lineEls.push(
            `<text x="50%" y="${y + 4}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fontSize}" letter-spacing="3" fill="rgba(0,0,0,0.55)">${escapeXml(text)}</text>` +
            `<text x="50%" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fontSize}" letter-spacing="3">${inner}</text>`
        )
    }

    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${lineEls.join('')}</svg>`
    return sharp(Buffer.from(svg)).png().toBuffer()
}

/**
 * Composites the workspace logo top-left + an optional tagline in the upper
 * area of the image. The logo has a subtle drop shadow so it stays readable
 * on light image backgrounds. If sharp throws anywhere, returns the original
 * baseImage unchanged — a plain lifestyle image is better than a missing post.
 *
 * `workspaceName` is accepted for back-compat but unused.
 */
export async function applyBrandOverlay(args: {
    baseImage: Buffer
    logoUrl?: string | null
    workspaceName: string
    tagline?: string | null
    taglineAccent?: string | null
    accentColor?: string | null
}): Promise<Buffer> {
    void args.workspaceName
    try {
        const base = sharp(args.baseImage)
        const meta = await base.metadata()
        const w = meta.width ?? 1080
        const h = meta.height ?? 1350
        const inset = Math.round(w * 0.035)
        const overlays: sharp.OverlayOptions[] = []

        if (args.logoUrl) {
            try {
                const logoRes = await fetch(args.logoUrl)
                if (logoRes.ok) {
                    const logoBuf = Buffer.from(await logoRes.arrayBuffer())
                    const targetLogoW = Math.round(w * 0.30)
                    const logoSized = await sharp(logoBuf)
                        .resize({ width: targetLogoW, fit: 'inside' })
                        .png()
                        .toBuffer()
                    const logoMeta = await sharp(logoSized).metadata()
                    const lw = logoMeta.width || targetLogoW
                    const lh = logoMeta.height || targetLogoW

                    const shadow = await sharp(logoSized)
                        .composite([{
                            input: Buffer.from(`<svg width="${lw}" height="${lh}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/></svg>`),
                            blend: 'in',
                        }])
                        .blur(8)
                        .png()
                        .toBuffer()
                    const shadowOffset = Math.max(3, Math.round(lw * 0.02))

                    overlays.push({ input: shadow, top: inset + shadowOffset, left: inset + shadowOffset })
                    overlays.push({ input: logoSized, top: inset, left: inset })
                }
            } catch {
                // logo fetch / shadow compose failed — ship the bare image
            }
        }

        if (args.tagline && args.tagline.trim()) {
            try {
                const tagOverlay = await renderTaglineOverlay({
                    width: w,
                    height: h,
                    tagline: args.tagline,
                    accentWord: args.taglineAccent,
                    accent: args.accentColor || '#FFE600',
                })
                if (tagOverlay) overlays.push({ input: tagOverlay, top: 0, left: 0 })
            } catch {
                // tagline render failed — ship without it
            }
        }

        return await base
            .composite(overlays)
            .jpeg({ quality: 88 })
            .toBuffer()
    } catch {
        return args.baseImage
    }
}
