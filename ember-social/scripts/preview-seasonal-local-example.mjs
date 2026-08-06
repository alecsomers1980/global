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

const { renderSeasonalLocal } = await import('../src/lib/templates/seasonal-local.ts')

const testCar = {
    id: 'test-1', make: 'Toyota', model: 'Fortuner 3.0 TDi', year: 2022,
    colour: 'Silver', price: 449000, mileage: 68000, transmission: 'Automatic', fuel_type: 'Diesel',
}

const result = await renderSeasonalLocal(testCar)
writeFileSync(resolve('public/preview/seasonal-local-example.png'), result.image)
console.log('Saved public/preview/seasonal-local-example.png')
console.log('Caption:\n', result.caption)
