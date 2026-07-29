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

const { renderFinance } = await import('../src/lib/templates/finance.ts')

const testCar = {
    id: 'test-1', make: 'Suzuki', model: 'Swift 1.5 GLX', year: 2023,
    colour: 'White', price: 259000, mileage: 42000, transmission: 'Manual', fuel_type: 'Petrol',
}

const result = await renderFinance(testCar)
writeFileSync(resolve('public/preview/finance-example.png'), result.image)
console.log('Saved public/preview/finance-example.png')
console.log('Caption:\n', result.caption)
