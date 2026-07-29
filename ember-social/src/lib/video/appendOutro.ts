// Ports scripts/append-outro.mjs into a route-callable function operating on
// Buffers instead of named files, writing to /tmp (Vercel's writable scratch
// space) instead of a fixed local path. Same ffmpeg-static approach — no
// system ffmpeg binary required, works in a Vercel serverless function.

import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import ffmpegPath from 'ffmpeg-static'

const FPS = 24
const YELLOW = '#FFE600'
const OUTRO = 3.0
const XF = 0.5

const escXml = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function ff(args: string[]) {
    execFileSync(ffmpegPath as string, ['-y', ...args], { stdio: 'inherit' })
}

function probe(file: string): { duration: number; width: number; height: number } {
    let err = ''
    try {
        execFileSync(ffmpegPath as string, ['-i', file], { stdio: ['ignore', 'ignore', 'pipe'] })
    } catch (e: any) {
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

async function buildEndCard(W: number, H: number, tagline: string, accent: string): Promise<Buffer> {
    const tagSegs = tagline.split(/\s+/).map(w =>
        w.replace(/[.,!?]/g, '').toUpperCase() === accent.toUpperCase()
            ? `<tspan fill="${YELLOW}">${escXml(w)}</tspan>` : `<tspan> ${escXml(w)}</tspan>`
    ).join(' ')
    const vertical = H > W
    const fs = vertical ? Math.round(W * 0.09) : 56
    const y = vertical ? Math.round(H * 0.55) : Math.round(H * 0.55)
    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${W}" height="${H}" fill="#0a0a0a" />
        <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${fs}" fill="#ffffff" xml:space="preserve">${tagSegs}</text>
        <text x="${W / 2}" y="${y + fs + 40}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="28" fill="${YELLOW}">013 854 0600</text>
    </svg>`
    return sharp({ create: { width: W, height: H, channels: 4, background: '#0a0a0a' } })
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
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
