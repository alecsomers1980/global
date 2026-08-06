// Ports scripts/append-outro.mjs into a route-callable function operating on
// Buffers instead of named files, writing to /tmp (Vercel's writable scratch
// space) instead of a fixed local path. Same ffmpeg-static approach — no
// system ffmpeg binary required, works in a Vercel serverless function.

// MUST be first: points fontconfig at public/fonts before sharp loads. Vercel's
// Linux container has no Arial, so without this the end card's text renders as
// tofu boxes — and the job still reports success, because ffmpeg has no idea
// the PNG it was handed contains unreadable glyphs.
import '@/lib/fonts/init'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import ffmpegStaticPath from 'ffmpeg-static'

const FPS = 24
const YELLOW = '#FFE600'
const OUTRO = 3.0
const XF = 0.5

const escXml = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ffmpeg-static exports a path built from its own __dirname. Bundlers rewrite
// __dirname, so in a built serverless function that path can point somewhere
// that doesn't exist even though next.config's outputFileTracingIncludes did
// ship the binary. Fall back to locating it under the function's own cwd, and
// re-assert the exec bit — file tracing does not always preserve it.
let resolvedFfmpeg: string | null = null
function ffmpegBin(): string {
    if (resolvedFfmpeg) return resolvedFfmpeg

    const name = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
    const candidates = [
        ffmpegStaticPath as string | null,
        join(process.cwd(), 'node_modules', 'ffmpeg-static', name),
    ].filter(Boolean) as string[]

    const found = candidates.find(p => existsSync(p))
    if (!found) {
        throw new Error(`ffmpeg binary not found. Tried: ${candidates.join(', ')} (cwd=${process.cwd()})`)
    }
    if (process.platform !== 'win32') {
        try { chmodSync(found, 0o755) } catch { /* read-only FS is fine if it's already executable */ }
    }
    resolvedFfmpeg = found
    return found
}

function ff(args: string[]) {
    execFileSync(ffmpegBin(), ['-y', ...args], { stdio: 'inherit' })
}

function probe(file: string): { duration: number; width: number; height: number } {
    let err = ''
    try {
        execFileSync(ffmpegBin(), ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] })
    } catch (e: any) {
        // A bare `-i` probe always exits non-zero and writes stream info to
        // stderr, so landing here is the NORMAL path. A genuine spawn failure
        // (missing or non-executable binary) also lands here but with no
        // stderr — report that instead of dereferencing undefined, which
        // otherwise surfaces as an opaque "cannot read properties of undefined".
        if (!e.stderr) {
            throw new Error(`ffmpeg failed to run (${ffmpegBin()}): ${e.code || ''} ${e.message}`)
        }
        err = e.stderr.toString()
    }
    const d = err.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
    const r = err.match(/, (\d{2,5})x(\d{2,5})[ ,]/)
    if (!d || !r) throw new Error('could not probe source video')
    return {
        duration: (+d[1]) * 3600 + (+d[2]) * 60 + parseFloat(d[3]),
        width: +r[1],
        height: +r[2],
    }
}

// Mirrors scripts/append-outro.mjs's card (the one the July reels used): Everest
// logo centred above the tagline, then phone, then site/location. Landscape keeps
// that script's absolute 1280x720 numbers; portrait scales with the frame.
async function buildEndCard(W: number, H: number, tagline: string, accent: string): Promise<Buffer> {
    const tagSegs = tagline.split(/\s+/).map(w =>
        w.replace(/[.,!?]/g, '').toUpperCase() === accent.toUpperCase()
            ? `<tspan fill="${YELLOW}">${escXml(w)}</tspan>` : `<tspan> ${escXml(w)}</tspan>`
    ).join(' ')

    const vertical = H > W
    const L = vertical
        ? { logoW: Math.round(W * 0.42), logoTop: Math.round(H * 0.26), tagY: Math.round(H * 0.56), tagF: Math.round(W * 0.062), phoneY: Math.round(H * 0.62), phoneF: Math.round(W * 0.075), urlY: Math.round(H * 0.655), urlF: Math.round(W * 0.030) }
        : { logoW: 280, logoTop: 150, tagY: 430, tagF: 38, phoneY: 500, phoneF: 44, urlY: 552, urlF: 24 }

    // Shrink the tagline so Arial Black never crosses the frame (≈0.70 px/char/pt).
    let tagF = L.tagF
    while (tagF > 16 && tagline.length * tagF * 0.70 > W * 0.90) tagF -= 1

    const textSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <g font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle">
        <text x="${W / 2}" y="${L.tagY}" font-size="${tagF}" fill="#ffffff" xml:space="preserve">${tagSegs}</text>
        <text x="${W / 2}" y="${L.phoneY}" font-size="${L.phoneF}" fill="${YELLOW}">013 854 0600</text>
        <text x="${W / 2}" y="${L.urlY}" font-size="${L.urlF}" fill="#ffffff" font-weight="400" font-family="Arial, sans-serif">everestmotoring.co.za  ·  White River, Mpumalanga</text>
      </g>
    </svg>`

    const overlays: sharp.OverlayOptions[] = []
    // The logo lives in public/, which ships with the function — but never let a
    // missing asset abort a render that is otherwise fine.
    const logoPath = join(process.cwd(), 'public', 'images', 'logo.png')
    if (existsSync(logoPath)) {
        const logo = await sharp(logoPath).resize({ width: L.logoW, fit: 'inside' }).png().toBuffer()
        overlays.push({ input: logo, top: L.logoTop, left: Math.round((W - L.logoW) / 2) })
    } else {
        console.warn(`[appendOutro] logo not found at ${logoPath} — end card will be text-only`)
    }
    overlays.push({ input: Buffer.from(textSvg), top: 0, left: 0 })

    return sharp({ create: { width: W, height: H, channels: 4, background: '#0a0a0a' } })
        .composite(overlays)
        .png().toBuffer()
}

export async function appendOutro(sourceBuf: Buffer, tagline: string, accent: string): Promise<Buffer> {
    const tmp = process.env.TEMP || process.env.TMPDIR || '/tmp'
    const workDir = join(tmp, `outro-${Date.now()}`)
    mkdirSync(workDir, { recursive: true })

    try {
        const srcPath = join(workDir, 'src.mp4')
        writeFileSync(srcPath, sourceBuf)

        const { width: W, height: H, duration: srcDuration } = probe(srcPath)
        const endCardPng = await buildEndCard(W, H, tagline, accent)
        const endCardPath = join(workDir, 'endcard.png')
        writeFileSync(endCardPath, endCardPng)

        const endCardVideoPath = join(workDir, 'endcard.mp4')
        ff(['-loop', '1', '-i', endCardPath, '-t', String(OUTRO), '-r', String(FPS), '-pix_fmt', 'yuv420p', endCardVideoPath])

        // Crossfade offset = where in the source the outro should start overlapping,
        // i.e. (source duration - crossfade duration).
        const outPath = join(workDir, 'out.mp4')
        const offset = Math.max(0, srcDuration - XF)
        ff([
            '-i', srcPath, '-i', endCardVideoPath,
            '-filter_complex', `[0:v][1:v]xfade=transition=fade:duration=${XF}:offset=${offset}[v]`,
            '-map', '[v]', '-map', '0:a?',
            '-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p',
            outPath,
        ])

        return readFileSync(outPath)
    } finally {
        // Cron warm containers can reuse this process across ticks — clean up the
        // per-call scratch dir so /tmp doesn't accumulate render artifacts, on
        // both success and failure (probe()/ff() can throw before we get here).
        try { rmSync(workDir, { recursive: true, force: true }) } catch {}
    }
}
