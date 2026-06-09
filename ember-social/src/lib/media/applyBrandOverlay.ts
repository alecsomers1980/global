import '@/lib/fonts/init'
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

function wrapLine(line: string, maxChars: number): string[] {
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length === 0) return []
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
        if (currentLine.length + 1 + words[i].length <= maxChars) {
            currentLine += ' ' + words[i]
        } else {
            lines.push(currentLine)
            currentLine = words[i]
        }
    }
    lines.push(currentLine)
    return lines
}

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

    const MAX_CHARS_PER_LINE = 14
    const processedLines = raw.flatMap(line => wrapLine(line, MAX_CHARS_PER_LINE))

    const SAFE_W = width - 100
    const HEAD_GLYPH = 0.72
    const maxFs = Math.round(width * 0.070)
    const minFs = Math.round(width * 0.040)

    let fontSize = maxFs
    const longestLineChars = Math.max(1, ...processedLines.map(l => l.length))
    const estWidth = longestLineChars * fontSize * HEAD_GLYPH
    if (estWidth > SAFE_W) {
        fontSize = Math.max(minFs, Math.floor(fontSize * (SAFE_W / estWidth)))
    }

    const lineGap = Math.round(fontSize * 0.12)
    const startY = Math.round(height * 0.27) + fontSize

    const accentUpper = (accentWord || '').trim().toUpperCase()
    const accentRe = accentUpper
        ? new RegExp(`\\b(${escapeRegExp(accentUpper)})\\b`)
        : null

    const lineEls: string[] = []
    for (let i = 0; i < processedLines.length; i++) {
        const text = processedLines[i]
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

function formatPrice(p: number | string): string {
    const n = Number(p)
    if (!Number.isFinite(n) || n <= 0) return ''
    return 'R ' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')
}

function formatMileage(m: number | string): string {
    const n = Number(m)
    if (!Number.isFinite(n) || n <= 0) return ''
    return n.toLocaleString('en-ZA').replace(/,/g, ' ') + ' km'
}

/**
 * Composites a spec-card panel in the lower 35% of a vehicle image.
 * The AI prompt left this area clean for the text panel.
 * Logo goes top-left, specs + contact strip go in the bottom band.
 * On any failure returns the baseImage unchanged.
 */
export async function applySpecCardOverlay(args: {
    baseImage: Buffer
    logoUrl?: string | null
    vehicle: {
        year?: number | string
        make?: string
        model?: string
        price?: number | string
        mileage?: number | string
        transmission?: string
        fuel_type?: string
    }
    contact: {
        phone?: string | null
        websiteUrl?: string | null
        location?: string | null
    }
    accentColor?: string | null
}): Promise<Buffer> {
    try {
        const accent = args.accentColor || '#FFE600'
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
                // logo failed — continue without it
            }
        }

        const v = args.vehicle
        const headline = [v.year, v.make, v.model].filter(Boolean).join(' ')
        const priceFormatted = formatPrice(v.price || 0)
        const mileageFormatted = formatMileage(v.mileage || 0)
        const specsLine = [mileageFormatted, v.transmission, v.fuel_type].filter(Boolean).join(' | ')

        const phone = args.contact.phone || ''
        const website = args.contact.websiteUrl || ''
        const contactParts: string[] = []
        if (phone) contactParts.push(`\u{1F4DE} ${escapeXml(phone)}`)
        if (website) contactParts.push(`\u{1F310} ${escapeXml(website)}`)
        const contactLine = contactParts.join('  ')

        const panelY = Math.round(h * 0.65)
        const panelH = h - panelY
        const headlineY = panelY + Math.round(panelH * 0.14)
        const specsY = panelY + Math.round(panelH * 0.42)
        const contactY = panelY + Math.round(panelH * 0.70)
        const leftPad = Math.round(w * 0.05)

        const headlineFontSize = Math.max(22, Math.round(w * 0.05))
        const specsFontSize = Math.max(16, Math.round(w * 0.03))
        const contactFontSize = Math.max(14, Math.round(w * 0.025))
        const chipFontSize = Math.max(14, Math.round(w * 0.028))
        const chipH = Math.round(chipFontSize * 1.6)
        const chipW = priceFormatted ? Math.round(priceFormatted.length * chipFontSize * 0.62) + 20 : 0

        const panelSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.3"/>
    </linearGradient>
  </defs>
  <line x1="${leftPad}" y1="${panelY}" x2="${w - leftPad}" y2="${panelY}" stroke="white" stroke-opacity="0.30" stroke-width="2"/>
  <rect x="0" y="${panelY}" width="${w}" height="${panelH}" fill="url(#pg)" opacity="0.4"/>
  <text x="${leftPad}" y="${headlineY}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${headlineFontSize}" fill="white">${escapeXml(headline)}</text>
  ${priceFormatted ? `<rect x="${w - leftPad - chipW}" y="${headlineY - chipH + Math.round(chipFontSize * 0.25)}" width="${chipW}" height="${chipH}" rx="${Math.round(chipH / 2)}" fill="${escapeXml(accent)}"/>\n  <text x="${w - leftPad - Math.round(chipW / 2)}" y="${headlineY}" font-family="Arial, Arial Black, sans-serif" font-weight="700" font-size="${chipFontSize}" fill="#0a0a0f" text-anchor="middle">${escapeXml(priceFormatted)}</text>` : ''}
  ${specsLine ? `<text x="${leftPad}" y="${specsY}" font-family="Arial, sans-serif" font-size="${specsFontSize}" fill="white" opacity="0.9">${escapeXml(specsLine)}</text>` : ''}
  ${contactLine ? `<text x="${leftPad}" y="${contactY}" font-family="Arial, sans-serif" font-size="${contactFontSize}" fill="white" opacity="0.8">${escapeXml(contactLine)}</text>` : ''}
</svg>`

        const panelBuf = await sharp(Buffer.from(panelSvg)).png().toBuffer()
        overlays.push({ input: panelBuf, top: 0, left: 0 })

        return await base
            .composite(overlays)
            .jpeg({ quality: 88 })
            .toBuffer()
    } catch {
        return args.baseImage
    }
}

/**
 * Composites 3-4 vehicle photos in a 2x2 grid in the upper 65% of the base image.
 * "QUALITY PRE-OWNED VEHICLES" header at top, year/make/model + price labels
 * under each tile, contact strip at bottom. Logo top-left.
 */
export async function applyMultiCarOverlay(args: {
    baseImage: Buffer
    logoUrl?: string | null
    vehicles: {
        main_image_url?: string
        year?: number | string
        make?: string
        model?: string
        price?: number | string
    }[]
    contact: {
        phone?: string | null
        websiteUrl?: string | null
        location?: string | null
    }
    accentColor?: string | null
}): Promise<Buffer> {
    try {
        const accent = args.accentColor || '#FFE600'
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
                    const targetLogoW = Math.round(w * 0.25)
                    const logoSized = await sharp(logoBuf).resize({ width: targetLogoW, fit: 'inside' }).png().toBuffer()
                    const logoMeta = await sharp(logoSized).metadata()
                    const lw = logoMeta.width || targetLogoW
                    const lh = logoMeta.height || targetLogoW
                    const shadow = await sharp(logoSized)
                        .composite([{ input: Buffer.from(`<svg width="${lw}" height="${lh}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/></svg>`), blend: 'in' }])
                        .blur(8).png().toBuffer()
                    overlays.push({ input: shadow, top: inset + 3, left: inset + 3 })
                    overlays.push({ input: logoSized, top: inset, left: inset })
                }
            } catch { /* logo failed */ }
        }

        const gridTop = Math.round(h * 0.08)
        const gridH = Math.round(h * 0.57)
        const gridW = w - inset * 2
        const cols = 2
        const rows = Math.ceil(Math.min(args.vehicles.length, 4) / 2)
        const cellW = Math.round(gridW / cols)
        const cellH = Math.round(gridH / rows)
        const gap = Math.round(w * 0.015)

        for (let i = 0; i < Math.min(args.vehicles.length, 4); i++) {
            const v = args.vehicles[i]
            if (!v.main_image_url) continue
            try {
                const imgRes = await fetch(v.main_image_url)
                if (!imgRes.ok) continue
                const imgBuf = Buffer.from(await imgRes.arrayBuffer())
                const col = i % 2
                const row = Math.floor(i / 2)
                const x = inset + col * (cellW + gap)
                const y = gridTop + row * (cellH + gap)
                const sized = await sharp(imgBuf)
                    .resize({ width: cellW - gap, height: cellH - gap, fit: 'cover' })
                    .jpeg({ quality: 85 })
                    .toBuffer()
                overlays.push({ input: sized, top: y, left: x })
            } catch { /* skip this vehicle image */ }
        }

        const contactPhone = args.contact.phone || ''
        const contactWebsite = args.contact.websiteUrl || ''
        const contactParts: string[] = []
        if (contactPhone) contactParts.push(`\u{1F4DE} ${escapeXml(contactPhone)}`)
        if (contactWebsite) contactParts.push(`\u{1F310} ${escapeXml(contactWebsite)}`)
        const contactLine = contactParts.join('  ')

        const headerY = Math.round(h * 0.05)
        const headerFontSize = Math.max(18, Math.round(w * 0.042))
        const labelFontSize = Math.max(11, Math.round(w * 0.022))
        const contactFontSize = Math.max(14, Math.round(w * 0.025))
        const contactY = Math.round(h * 0.96)

        let labelEls = ''
        for (let i = 0; i < Math.min(args.vehicles.length, 4); i++) {
            const v = args.vehicles[i]
            const col = i % 2
            const row = Math.floor(i / 2)
            const lx = inset + col * (cellW + gap) + Math.round((cellW - gap) * 0.03)
            const ly = gridTop + row * (cellH + gap) + cellH - Math.round(cellH * 0.04)
            const name = [v.year, v.make, v.model].filter(Boolean).join(' ')
            const price = formatPrice(v.price || 0)
            const line = price ? `${name} — ${price}` : name
            labelEls += `<text x="${lx}" y="${ly}" font-family="Arial, sans-serif" font-weight="700" font-size="${labelFontSize}" fill="white">${escapeXml(line)}</text>\n`
        }

        const panelSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <text x="${w / 2}" y="${headerY}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${headerFontSize}" fill="${escapeXml(accent)}" text-anchor="middle">QUALITY PRE-OWNED VEHICLES</text>
  ${labelEls}
  ${contactLine ? `<text x="${w / 2}" y="${contactY}" font-family="Arial, sans-serif" font-size="${contactFontSize}" fill="white" opacity="0.8" text-anchor="middle">${escapeXml(contactLine)}</text>` : ''}
</svg>`
        overlays.push({ input: await sharp(Buffer.from(panelSvg)).png().toBuffer(), top: 0, left: 0 })

        return await base.composite(overlays).jpeg({ quality: 88 }).toBuffer()
    } catch {
        return args.baseImage
    }
}

/**
 * Composites a pure-typography card on top of the base image (which is a macro icon/texture).
 * Yellow header strip, big white headline, yellow subhead, contact strip at bottom.
 */
export async function applyTipCardOverlay(args: {
    baseImage: Buffer
    logoUrl?: string | null
    pillar: string
    headline: string
    subhead: string
    contact: {
        phone?: string | null
        websiteUrl?: string | null
        location?: string | null
    }
    accentColor?: string | null
}): Promise<Buffer> {
    try {
        const accent = args.accentColor || '#FFE600'
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
                    const targetLogoW = Math.round(w * 0.25)
                    const logoSized = await sharp(logoBuf).resize({ width: targetLogoW, fit: 'inside' }).png().toBuffer()
                    const logoMeta = await sharp(logoSized).metadata()
                    const lw = logoMeta.width || targetLogoW
                    const lh = logoMeta.height || targetLogoW
                    const shadow = await sharp(logoSized)
                        .composite([{ input: Buffer.from(`<svg width="${lw}" height="${lh}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/></svg>`), blend: 'in' }])
                        .blur(8).png().toBuffer()
                    overlays.push({ input: shadow, top: inset + 3, left: inset + 3 })
                    overlays.push({ input: logoSized, top: inset, left: inset })
                }
            } catch { /* logo failed */ }
        }

        const isMaintenance = /maintenance|fuel|tip/i.test(args.pillar)
        const headerText = isMaintenance ? 'WORTH KNOWING' : 'TIP OF THE WEEK'

        const contactPhone = args.contact.phone || ''
        const contactWebsite = args.contact.websiteUrl || ''
        const contactParts: string[] = []
        if (contactPhone) contactParts.push(`\u{1F4DE} ${escapeXml(contactPhone)}`)
        if (contactWebsite) contactParts.push(`\u{1F310} ${escapeXml(contactWebsite)}`)
        const contactLine = contactParts.join('  ')

        const headerFontSize = Math.max(16, Math.round(w * 0.035))
        const headlineFontSize = Math.max(28, Math.round(w * 0.065))
        const subheadFontSize = Math.max(16, Math.round(w * 0.035))
        const contactFontSize = Math.max(13, Math.round(w * 0.023))

        const headerY = Math.round(h * 0.38)
        const headlineY = Math.round(h * 0.52)
        const subheadY = Math.round(h * 0.60)
        const contactY = Math.round(h * 0.94)

        const headline = args.headline || 'DID YOU KNOW?'
        const subhead = args.subhead || ''

        const panelSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${Math.round(h * 0.30)}" width="${w}" height="${Math.round(h * 0.70)}" fill="url(#bg)"/>
  <text x="${w / 2}" y="${headerY}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${headerFontSize}" fill="${escapeXml(accent)}" text-anchor="middle">${escapeXml(headerText)}</text>
  <text x="${w / 2}" y="${headlineY}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${headlineFontSize}" fill="white" text-anchor="middle">${escapeXml(headline.toUpperCase())}</text>
  ${subhead ? `<text x="${w / 2}" y="${subheadY}" font-family="Arial, sans-serif" font-weight="400" font-size="${subheadFontSize}" fill="${escapeXml(accent)}" text-anchor="middle">${escapeXml(subhead)}</text>` : ''}
  ${contactLine ? `<text x="${w / 2}" y="${contactY}" font-family="Arial, sans-serif" font-size="${contactFontSize}" fill="white" opacity="0.7" text-anchor="middle">${escapeXml(contactLine)}</text>` : ''}
</svg>`
        overlays.push({ input: await sharp(Buffer.from(panelSvg)).png().toBuffer(), top: 0, left: 0 })

        return await base.composite(overlays).jpeg({ quality: 88 }).toBuffer()
    } catch {
        return args.baseImage
    }
}

/**
 * Composites "WE BUY YOUR CAR" typography card with CTA pill.
 * Base image is a car silhouette on glossy black — no people.
 */
export async function applySellYoursOverlay(args: {
    baseImage: Buffer
    logoUrl?: string | null
    sellYourCarUrl?: string | null
    contact: {
        phone?: string | null
        websiteUrl?: string | null
        location?: string | null
    }
    accentColor?: string | null
}): Promise<Buffer> {
    try {
        const accent = args.accentColor || '#FFE600'
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
                    const targetLogoW = Math.round(w * 0.25)
                    const logoSized = await sharp(logoBuf).resize({ width: targetLogoW, fit: 'inside' }).png().toBuffer()
                    const logoMeta = await sharp(logoSized).metadata()
                    const lw = logoMeta.width || targetLogoW
                    const lh = logoMeta.height || targetLogoW
                    const shadow = await sharp(logoSized)
                        .composite([{ input: Buffer.from(`<svg width="${lw}" height="${lh}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/></svg>`), blend: 'in' }])
                        .blur(8).png().toBuffer()
                    overlays.push({ input: shadow, top: inset + 3, left: inset + 3 })
                    overlays.push({ input: logoSized, top: inset, left: inset })
                }
            } catch { /* logo failed */ }
        }

        const contactPhone = args.contact.phone || ''
        const contactWebsite = args.contact.websiteUrl || ''
        const contactParts: string[] = []
        if (contactPhone) contactParts.push(`\u{1F4DE} ${escapeXml(contactPhone)}`)
        if (contactWebsite) contactParts.push(`\u{1F310} ${escapeXml(contactWebsite)}`)
        const contactLine = contactParts.join('  ')

        const ctaUrl = args.sellYourCarUrl || ''
        const headlineFontSize = Math.max(30, Math.round(w * 0.075))
        const subheadFontSize = Math.max(18, Math.round(w * 0.04))
        const ctaFontSize = Math.max(16, Math.round(w * 0.035))
        const contactFontSize = Math.max(13, Math.round(w * 0.023))

        const headlineY = Math.round(h * 0.35)
        const subheadY = Math.round(h * 0.45)
        const ctaY = Math.round(h * 0.58)
        const contactY = Math.round(h * 0.94)

        const ctaText = 'GET YOUR FREE VALUATION'
        const ctaW = ctaText.length * Math.round(ctaFontSize * 0.6) + 40
        const ctaH = Math.round(ctaFontSize * 2.2)
        const ctaX = Math.round((w - ctaW) / 2)
        const ctaTop = ctaY - Math.round(ctaH / 2)

        const panelSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${Math.round(h * 0.25)}" width="${w}" height="${Math.round(h * 0.75)}" fill="url(#bg)"/>
  <text x="${w / 2}" y="${headlineY}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${headlineFontSize}" fill="white" text-anchor="middle">WE BUY YOUR CAR</text>
  <text x="${w / 2}" y="${subheadY}" font-family="Arial, sans-serif" font-weight="700" font-size="${subheadFontSize}" fill="${escapeXml(accent)}" text-anchor="middle">FREE VALUATION IN 60 SECONDS</text>
  <rect x="${ctaX}" y="${ctaTop}" width="${ctaW}" height="${ctaH}" rx="${Math.round(ctaH / 2)}" fill="${escapeXml(accent)}"/>
  <text x="${w / 2}" y="${ctaY + Math.round(ctaFontSize * 0.35)}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${ctaFontSize}" fill="#0a0a0f" text-anchor="middle">${escapeXml(ctaText)}</text>
  ${contactLine ? `<text x="${w / 2}" y="${contactY}" font-family="Arial, sans-serif" font-size="${contactFontSize}" fill="white" opacity="0.7" text-anchor="middle">${escapeXml(contactLine)}</text>` : ''}
</svg>`
        overlays.push({ input: await sharp(Buffer.from(panelSvg)).png().toBuffer(), top: 0, left: 0 })

        return await base.composite(overlays).jpeg({ quality: 88 }).toBuffer()
    } catch {
        return args.baseImage
    }
}
