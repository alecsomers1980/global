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

const W = 1280, H = 720, FPS = 24, YELLOW = '#FFE600'
const OUTRO = 3.0, XF = 0.5
const ff = (args) => execFileSync(ffmpegPath, ['-y', ...args], { stdio: 'inherit' })

// Probe source duration (ffmpeg-static has no ffprobe — parse -i stderr).
function durationOf(file) {
    try { execFileSync(ffmpegPath, ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] }) }
    catch (e) {
        const m = e.stderr.toString().match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
        if (m) return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3])
    }
    throw new Error('could not read duration')
}

// Build end-card PNG (matches the cinematic version's design, scaled to 720p).
async function buildEndCard() {
    const tagSegs = TAGLINE.split(/\s+/).map(w =>
        w.replace(/[.,!?]/g, '').toUpperCase() === ACCENT ? `<tspan fill="${YELLOW}">${w}</tspan>` : `<tspan> ${w}</tspan>`
    ).join(' ')
    const textSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle">
        <text x="${W / 2}" y="430" font-size="38" fill="#fff" xml:space="preserve">${tagSegs}</text>
        <text x="${W / 2}" y="500" font-size="44" fill="${YELLOW}">013 854 0600</text>
        <text x="${W / 2}" y="552" font-size="24" fill="#fff" font-weight="400" font-family="Arial, sans-serif">everestmotoring.co.za  ·  White River, Mpumalanga</text>
      </g>
    </svg>`
    const logoW = 280
    const logo = await sharp('public/images/logo.png').resize({ width: logoW, fit: 'inside' }).png().toBuffer()
    const out = join(TMP, 'endcard.png')
    await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
        .composite([
            { input: logo, top: 150, left: Math.round((W - logoW) / 2) },
            { input: Buffer.from(textSvg), top: 0, left: 0 },
        ]).png().toFile(out)
    return out
}

const dur = durationOf(SRC)
console.log(`Source duration: ${dur.toFixed(2)}s`)

const endcardPng = await buildEndCard()
const endClip = join(TMP, 'endcard.mp4')
console.log('Rendering end-card clip (silent, matched specs)...')
ff(['-loop', '1', '-i', endcardPng,
    '-f', 'lavfi', '-i', `anullsrc=channel_layout=stereo:sample_rate=32000`,
    '-t', String(OUTRO), '-r', String(FPS),
    '-vf', 'fade=t=in:st=0:d=0.4,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-ar', '32000', '-ac', '2', endClip])

const offset = (dur - XF).toFixed(2)
console.log('Crossfading reel into outro...')
ff(['-i', SRC, '-i', endClip,
    '-filter_complex',
    `[0:v][1:v]xfade=transition=fade:duration=${XF}:offset=${offset}[v];[0:a][1:a]acrossfade=d=${XF}[a]`,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-pix_fmt', 'yuv420p', OUT])

console.log(`\nDone → ${OUT}`)
