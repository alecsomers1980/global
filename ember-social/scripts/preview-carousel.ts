/**
 * Carousel-generator prototype preview — Everest Motoring.
 *
 *   cd ember-social
 *   npx tsx scripts/preview-carousel.ts
 *
 * Output: public/preview/carousel/slide-1.png .. slide-5.png
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file: string) {
    const text = readFileSync(resolve(file), 'utf8')
    for (const rawLine of text.split('\n')) {
        const line = rawLine.replace(/\r$/, '')
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

async function main() {
    const { renderCarousel } = await import('../src/lib/templates/carousel')
    const topic = process.argv[2] || '5 signs it might be time to trade in your car'

    const result = await renderCarousel(topic)

    console.log('Topic:', result.topic)
    console.log('Slides:', result.images.length)
    console.log('\nCaption:\n' + result.caption)
    console.log('\nHashtags:', result.hashtags.join(' '))
    console.log('Scheduled at:', result.scheduledAt.toISOString())

    const outDir = resolve('public/preview/carousel')
    mkdirSync(outDir, { recursive: true })
    result.images.forEach((buf, i) => {
        const p = resolve(outDir, `slide-${i + 1}.png`)
        writeFileSync(p, buf)
        console.log('Wrote', p)
    })
}

main()
