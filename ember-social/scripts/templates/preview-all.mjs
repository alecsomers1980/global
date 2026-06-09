// Batch runner — generates all 5 pillar templates for a vehicle from Everest Motoring.
//   cd ember-social
//   node scripts/templates/preview-all.mjs
//
// Output: public/preview/pillar-<name>.png + pillar-<name>.caption.txt

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderShowcase } from './showcase.mjs'
import { renderLifestyle } from './lifestyle.mjs'
import { renderMaintenance } from './maintenance.mjs'
import { renderSeasonal } from './seasonal.mjs'
import { renderSellYourCar } from './sell-your-car.mjs'
import { fetchCar, fetchClientWorkspace } from './common.mjs'

const runs = [
    { name: 'showcase',      fn: renderShowcase },
    { name: 'lifestyle',     fn: renderLifestyle },
    { name: 'maintenance',   fn: renderMaintenance },
    { name: 'seasonal',      fn: renderSeasonal },
    { name: 'sellYourCar',   fn: renderSellYourCar },
]

console.log('Fetching Everest workspace + vehicle...')
const ws = await fetchClientWorkspace()
const car = await fetchCar(ws)
console.log(`Vehicle: ${car.year} ${car.make} ${car.model}  ${car.colour}\n`)

for (const r of runs) {
    try {
        console.log(`[${r.name}] Generating...`)
        const result = await r.fn(car)
        const imgPath = resolve(`public/preview/pillar-${r.name}.png`)
        const capPath = resolve(`public/preview/pillar-${r.name}.caption.txt`)
        writeFileSync(imgPath, result.image)
        writeFileSync(capPath, result.caption)
        console.log(`  ✓ Saved ${imgPath}`)
        console.log(`  ✓ Saved ${capPath}`)
        if (result.scheduledAt) {
            console.log(`  → Scheduled: ${result.scheduledAt.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })} ${result.scheduledAt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`)
        }
        if (result.ctaUrl) {
            console.log(`  → CTA URL: ${result.ctaUrl}`)
        }
    } catch (e) {
        console.error(`  ✗ ${r.name} failed: ${e.message}`)
    }
}

console.log('\nAll done. Open:')
for (const r of runs) console.log(`  http://localhost:3000/preview/pillar-${r.name}.png`)
