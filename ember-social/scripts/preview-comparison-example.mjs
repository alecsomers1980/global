import { writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(file) {
    for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
        const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
        if (!m) continue
        let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
        process.env[m[1]] = v
    }
}
loadEnv('.env.local')

const { renderComparison } = await import('../src/lib/templates/comparison.ts')

const carA = { id: 'a', make: 'Hyundai', model: 'Tucson', year: 2020, colour: 'Maroon' }
const carB = { id: 'b', make: 'Renault', model: 'Kiger', year: 2022, colour: 'White' }

const result = await renderComparison(carA, carB, 'Family', 'Fun')
writeFileSync(resolve('public/preview/comparison-example.png'), result.image)
console.log('Saved public/preview/comparison-example.png')
console.log('Caption:\n', result.caption)
