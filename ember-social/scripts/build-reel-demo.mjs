/**
 * Cinematic 16:9 lifestyle brand reel ("The long way round") from the landscape
 * video stills, using strong varied ffmpeg camera motion + film grade + grain +
 * vignette + 2.40:1 scope bars + dynamic crossfades. NO paid video API.
 * (The per-car walkaround pipeline is separate and untouched.)
 *
 *   cd ember-social
 *   node scripts/build-reel-demo.mjs
 *
 * Output: public/preview/everest-reel-demo.mp4  (1920x1080, ~18s, silent — add music in CapCut)
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import sharp from 'sharp'
import ffmpegPath from 'ffmpeg-static'

const PREVIEW = resolve('public/preview')
const TMP = join(process.env.TEMP || '/tmp', 'everest-reel-build')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })

const W = 1920, H = 1080, FPS = 30, XF = 0.6, YELLOW = '#FFE600'
const ff = (args) => execFileSync(ffmpegPath, ['-y', ...args], { stdio: 'inherit' })

// Montage — rugged in-stock 4x4s, building to a reveal. move + duration per shot.
const SHOTS = [
    { src: 'video-shot-1.jpg', move: 'in',    dur: 3.4, tx: true },  // Land Cruiser dust approach
    { src: 'video-shot-4.jpg', move: 'right', dur: 3.2 },            // Hilux tree-line tracking
    { src: 'video-shot-2.jpg', move: 'fast',  dur: 2.2 },            // tyre detail (punch)
    { src: 'video-shot-5.jpg', move: 'left',  dur: 3.2 },            // T-Roc mountain pass
    { src: 'video-shot-3.jpg', move: 'out',   dur: 3.8 },            // Discovery clifftop reveal
    { src: 'video-shot-6.jpg', move: 'in',    dur: 3.0 },            // Discovery hero flare
]
const TRANSITIONS = ['fade', 'fade', 'fadeblack', 'fade', 'fade', 'fade'] // last = into end-card

function move(type, dur) {
    const f = Math.round(dur * FPS)
    const big = `scale=3840:2160:flags=lanczos,`
    const cx = `'iw/2-(iw/zoom/2)'`, cy = `'ih/2-(ih/zoom/2)'`
    const ymid = `'(ih-ih/zoom)/2'`
    let z, x, y
    if (type === 'in')        { z = `'min(zoom+${(0.20 / f).toFixed(6)},1.20)'`; x = cx; y = cy }
    else if (type === 'fast') { z = `'min(zoom+${(0.30 / f).toFixed(6)},1.32)'`; x = cx; y = cy }
    else if (type === 'out')  { z = `'if(eq(on,0),1.20,max(zoom-${(0.20 / f).toFixed(6)},1.0))'`; x = cx; y = cy }
    else if (type === 'right'){ z = `'1.14'`; x = `'(iw-iw/zoom)*on/${f - 1}'`; y = ymid }
    else                      { z = `'1.14'`; x = `'(iw-iw/zoom)*(1-on/${f - 1})'`; y = ymid } // left
    return `${big}zoompan=z=${z}:d=${f}:x=${x}:y=${y}:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p`
}

async function prepStill(name) {
    const out = join(TMP, name.replace(/\.\w+$/, '') + '-169.png')
    await sharp(join(PREVIEW, name)).resize(W, H, { fit: 'cover', position: 'centre' }).png().toFile(out)
    return out
}

// Opening text (left-aligned lower third, inside the 2.40:1 safe band).
async function buildOpeningText() {
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g font-family="Arial Black, Arial, sans-serif" font-weight="900">
        <text x="123" y="803" font-size="44" fill="#000" opacity="0.5">NO TRAFFIC. NO RUSH.</text>
        <text x="123" y="879" font-size="66" fill="#000" opacity="0.5">JUST THE ROAD.</text>
        <text x="120" y="800" font-size="44" fill="#fff">NO TRAFFIC. NO RUSH.</text>
        <text x="120" y="876" font-size="66" fill="#fff">JUST <tspan fill="${YELLOW}">THE ROAD.</tspan></text>
      </g>
    </svg>`
    const out = join(TMP, 'opening-169.png')
    await sharp(Buffer.from(svg)).png().toFile(out)
    return out
}

async function buildEndCard() {
    const textSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle">
        <text x="${W / 2}" y="640" font-size="52" fill="#fff">BUILT FOR THE <tspan fill="${YELLOW}">ROAD</tspan> AHEAD.</text>
        <text x="${W / 2}" y="740" font-size="58" fill="${YELLOW}">013 854 0600</text>
        <text x="${W / 2}" y="800" font-size="32" fill="#fff" font-weight="400" font-family="Arial, sans-serif">everestmotoring.co.za  ·  White River, Mpumalanga</text>
      </g>
    </svg>`
    const logoW = 380
    const logo = await sharp('public/images/logo.png').resize({ width: logoW, fit: 'inside' }).png().toBuffer()
    const out = join(TMP, 'endcard-169.png')
    await sharp({ create: { width: W, height: H, channels: 4, background: '#000000' } })
        .composite([
            { input: logo, top: 250, left: Math.round((W - logoW) / 2) },
            { input: Buffer.from(textSvg), top: 0, left: 0 },
        ]).png().toFile(out)
    return out
}

// ── Render per-shot motion clips ──
const opening = await buildOpeningText()
const endcard = await buildEndCard()
const segFiles = []
for (let i = 0; i < SHOTS.length; i++) {
    const s = SHOTS[i]
    const still = await prepStill(s.src)
    const out = join(TMP, `seg${i}.mp4`)
    console.log(`Segment ${i + 1}/${SHOTS.length}: ${s.src} (${s.move})`)
    if (s.tx) {
        ff(['-loop', '1', '-i', still, '-loop', '1', '-i', opening, '-t', String(s.dur), '-r', String(FPS),
            '-filter_complex',
            `[0:v]${move(s.move, s.dur)}[bg];[1:v]format=rgba,fade=t=in:st=0.4:d=0.7:alpha=1,fade=t=out:st=${(s.dur - 0.9).toFixed(2)}:d=0.6:alpha=1[txt];[bg][txt]overlay=0:0,format=yuv420p[v]`,
            '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', out])
    } else {
        ff(['-loop', '1', '-i', still, '-t', String(s.dur), '-r', String(FPS),
            '-filter_complex', `[0:v]${move(s.move, s.dur)}[v]`,
            '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', out])
    }
    segFiles.push(out)
}

// End-card clip (3s).
const endDur = 3.0
const endClip = join(TMP, 'endcard.mp4')
console.log('End-card')
ff(['-loop', '1', '-i', endcard, '-t', String(endDur), '-r', String(FPS),
    '-vf', 'fade=t=in:st=0:d=0.5,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', endClip])

// ── Crossfade chain + cinematic grade + scope bars ──
const clips = [...segFiles, endClip]
const durs = [...SHOTS.map(s => s.dur), endDur]
const inputs = clips.flatMap(c => ['-i', c])
let chain = '', prev = '[0:v]', offset = 0
for (let i = 1; i < clips.length; i++) {
    offset += durs[i - 1] - XF
    const tag = `[x${i}]`
    const trans = TRANSITIONS[i - 1] || 'fade'
    chain += `${prev}[${i}:v]xfade=transition=${trans}:duration=${XF}:offset=${offset.toFixed(2)}${tag};`
    prev = tag
}
const total = durs.reduce((a, b) => a + b, 0) - (clips.length - 1) * XF
// Film grade → grain → vignette → 2.40:1 scope crop+bars → fade in/out.
const grade = `eq=contrast=1.06:saturation=1.12:gamma=0.98,colorbalance=rs=0.02:bs=-0.03:rh=0.04:bh=-0.04,vignette=PI/4.5,noise=alls=5:allf=t,crop=${W}:800,pad=${W}:${H}:0:140:black,fade=t=in:st=0:d=0.6,fade=t=out:st=${(total - 0.8).toFixed(2)}:d=0.8,format=yuv420p`
const filter = `${chain}${prev}${grade}[v]`

const finalOut = join(PREVIEW, 'everest-reel-demo.mp4')
console.log('Final cinematic grade + scope')
ff([...inputs, '-filter_complex', filter, '-map', '[v]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', finalOut])
console.log(`\nDone → ${finalOut}  (${total.toFixed(1)}s, 1920x1080)`)
