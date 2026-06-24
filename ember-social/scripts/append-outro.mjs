/**
 * Append the branded "BUILT FOR THE ROAD AHEAD" end-card to the Seedance reel,
 * WITHOUT re-rendering the video. Crossfades video + audio into a 3s outro.
 *
 *   cd ember-social
 *   node scripts/append-outro.mjs
 *
 * Output: public/preview/everest-reel-seedance-outro.mp4
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import sharp from 'sharp'
import ffmpegPath from 'ffmpeg-static'

// Usage: node append-outro.mjs [input.mp4] [TAGLINE] [ACCENT_WORD]
const SRC = resolve(process.argv[2] || 'public/preview/everest-reel-seedance.mp4')
const OUT = SRC.replace(/\.mp4$/i, '-outro.mp4')
const TAGLINE = process.argv[3] || 'BUILT FOR THE ROAD AHEAD.'
const ACCENT = (process.argv[4] || 'ROAD').toUpperCase()
const TMP = join(process.env.TEMP || '/tmp', 'everest-outro')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })

const FPS = 24, YELLOW = '#FFE600'
const OUTRO = 3.0, XF = 0.5
const ff = (args) => execFileSync(ffmpegPath, ['-y', ...args], { stdio: 'inherit' })

// Probe source via -i stderr (ffmpeg-static has no ffprobe).
function probe(file) {
    let err = ''
    try { execFileSync(ffmpegPath, ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] }) }
    catch (e) { err = e.stderr.toString() }
    const d = err.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
    const r = err.match(/, (\d{2,5})x(\d{2,5})[ ,]/)
    if (!d || !r) throw new Error('could not probe source')
    return {
        duration: (+d[1]) * 3600 + (+d[2]) * 60 + parseFloat(d[3]),
        width: +r[1], height: +r[2],
    }
}

// Build end-card PNG matching the source resolution. Landscape keeps the original
// 720p layout; portrait (9:16) centres the block vertically with larger type.
async function buildEndCard(W, H) {
    const tagSegs = TAGLINE.split(/\s+/).map(w =>
        w.replace(/[.,!?]/g, '').toUpperCase() === ACCENT ? `<tspan fill="${YELLOW}">${w}</tspan>` : `<tspan> ${w}</tspan>`
    ).join(' ')
    const vertical = H > W
    // Landscape keeps the original absolute 1280x720 card. Vertical scales with the
    // frame (works at 720x1280 or 1080x1920) and centres a tighter block below the logo.
    const L = vertical
        ? { logoW: Math.round(W * 0.42), logoTop: Math.round(H * 0.26), tagY: Math.round(H * 0.56), tagF: Math.round(W * 0.062), phoneY: Math.round(H * 0.62), phoneF: Math.round(W * 0.075), urlY: Math.round(H * 0.655), urlF: Math.round(W * 0.030) }
        : { logoW: 280, logoTop: 150, tagY: 430, tagF: 38, phoneY: 500, phoneF: 44, urlY: 552, urlF: 24 }
    // Shrink the tagline so Arial Black never crosses the frame (≈0.70 px/char/pt).
    let tagF = L.tagF
    while (tagF > 16 && TAGLINE.length * tagF * 0.70 > W * 0.90) tagF -= 1
    const textSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle">
        <text x="${W / 2}" y="${L.tagY}" font-size="${tagF}" fill="#fff" xml:space="preserve">${tagSegs}</text>
        <text x="${W / 2}" y="${L.phoneY}" font-size="${L.phoneF}" fill="${YELLOW}">013 854 0600</text>
        <text x="${W / 2}" y="${L.urlY}" font-size="${L.urlF}" fill="#fff" font-weight="400" font-family="Arial, sans-serif">everestmotoring.co.za  ·  White River, Mpumalanga</text>
      </g>
    </svg>`
    const logo = await sharp('public/images/logo.png').resize({ width: L.logoW, fit: 'inside' }).png().toBuffer()
    const out = join(TMP, 'endcard.png')
    await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
        .composite([
            { input: logo, top: L.logoTop, left: Math.round((W - L.logoW) / 2) },
            { input: Buffer.from(textSvg), top: 0, left: 0 },
        ]).png().toFile(out)
    return out
}

const { duration: dur, width: W, height: H } = probe(SRC)
console.log(`Source: ${W}x${H}, ${dur.toFixed(2)}s`)

const endcardPng = await buildEndCard(W, H)
const endClip = join(TMP, 'endcard.mp4')
console.log('Rendering end-card clip (silent, matched specs)...')
ff(['-loop', '1', '-i', endcardPng,
    '-f', 'lavfi', '-i', `anullsrc=channel_layout=stereo:sample_rate=32000`,
    '-t', String(OUTRO), '-r', String(FPS),
    '-vf', 'fade=t=in:st=0:d=0.4,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-ar', '32000', '-ac', '2', endClip])

const offset = (dur - XF).toFixed(2)
console.log('Crossfading reel into outro...')
// Web-streaming friendly: 720p, capped bitrate, faststart (moov atom up front) so
// the clip starts playing in the client review link without a full download.
ff(['-i', SRC, '-i', endClip,
    '-filter_complex',
    `[0:v][1:v]xfade=transition=fade:duration=${XF}:offset=${offset}[v];[0:a][1:a]acrossfade=d=${XF}[a]`,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-profile:v', 'main', '-level', '4.0', '-preset', 'medium',
    '-crf', '23', '-maxrate', '2500k', '-bufsize', '5000k',
    '-c:a', 'aac', '-b:a', '128k', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT])

console.log(`\nDone → ${OUT}`)
