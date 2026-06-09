/**
 * Vehicle Post Template generator — HTML/CSS + Puppeteer
 *
 *   cd ember-social
 *   node scripts/vehicle-template/generate.js
 *
 * Pulls one real Everest inventory car, fills the HTML template, renders via
 * headless Chrome, saves PNG. Default size: 1080x1080 FB feed.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = __dirname

function loadEnv(file) {
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

const ES_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ES_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const WORKSPACE_ID = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3'

async function jget(url, key) {
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    return r.json()
}

const fmtPrice = p => {
    const n = Number(p)
    return Number.isFinite(n) && n > 0
        ? 'R ' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')
        : ''
}
const fmtMileage = m => {
    const n = Number(m)
    return Number.isFinite(n) && n > 0
        ? n.toLocaleString('en-ZA').replace(/,/g, ' ') + ' KM'
        : ''
}

// Per-spec SVG icons (stroked, ~22x22 viewBox)
const FEATURE_ICONS = {
    engine:   `<svg viewBox="0 0 24 24"><path d="M4 9h2V7h12v2h2v6h-2v2H6v-2H4z M9 11v2 M15 11v2"/></svg>`,
    gearbox:  `<svg viewBox="0 0 24 24"><path d="M6 6v12 M12 6v12 M18 6v12 M6 12h12"/></svg>`,
    drive:    `<svg viewBox="0 0 24 24"><path d="M3 18 L9 8 L13 14 L17 6 L21 18 Z"/></svg>`,
    interior: `<svg viewBox="0 0 24 24"><path d="M7 7v8a3 3 0 003 3h4 M14 7h3v8"/></svg>`,
    seats:    `<svg viewBox="0 0 24 24"><path d="M8 9a2 2 0 100-4 2 2 0 000 4z M16 9a2 2 0 100-4 2 2 0 000 4z M5 19v-2a4 4 0 014-4h0 M15 13a4 4 0 014 4v2"/></svg>`,
}

function buildFeatures(car) {
    const items = [
        { icon: FEATURE_ICONS.engine,   label: `${car.fuel_type || 'PETROL'}`.toUpperCase() },
        { icon: FEATURE_ICONS.gearbox,  label: `${car.transmission || 'MANUAL'}`.toUpperCase() },
        { icon: FEATURE_ICONS.drive,    label: fmtMileage(car.mileage) || 'LOW KMS' },
        { icon: FEATURE_ICONS.interior, label: `${(car.colour || '').toUpperCase()}` },
        { icon: FEATURE_ICONS.seats,    label: `${car.year}` },
    ]
    return items.map(it => `
        <div class="feature-item">
            <span class="icon">${it.icon}</span>
            <span class="label">${escHtml(it.label)}</span>
        </div>
    `).join('')
}

function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function modelParts(make, model) {
    const cleaned = String(model || '').replace(new RegExp(`^${make}\\s+`, 'i'), '').trim()
    const parts = cleaned.split(/\s+/)
    return { main: parts[0] || cleaned, trim: parts.slice(1).join(' ') }
}

async function main() {
    // 1) Fetch workspace + car
    const ws = (await jget(
        `${ES_URL}/rest/v1/workspaces?select=client_supabase_url,client_supabase_service_key&id=eq.${WORKSPACE_ID}`,
        ES_KEY
    ))[0]
    const car = (await jget(
        `${ws.client_supabase_url}/rest/v1/cars?select=id,make,model,year,colour,price,mileage,transmission,fuel_type,main_image_url&limit=1&order=year.desc`,
        ws.client_supabase_service_key
    ))[0]
    console.log(`Vehicle: ${car.year} ${car.make} ${car.model}  ${fmtPrice(car.price)}`)

    const { main: modelMain, trim: modelTrim } = modelParts(car.make, car.model)

    // 2) Read template files
    const htmlTemplate = readFileSync(resolve(ROOT, 'templates', 'facebook-post.html'), 'utf8')

    // Real contact info from everestmotoring.co.za
    const CONTACT = {
        phone: '013 854 0600',
        email: 'info@everestmotoring.co.za',
        website: 'www.everestmotoring.co.za',
    }

    const html = htmlTemplate
        .replace(/\{\{YEAR\}\}/g,         escHtml(car.year))
        .replace(/\{\{MAKE\}\}/g,         escHtml(String(car.make).toUpperCase()))
        .replace(/\{\{MODEL_MAIN\}\}/g,   escHtml(modelMain.toUpperCase()))
        .replace(/\{\{MODEL_TRIM\}\}/g,   escHtml(modelTrim.toUpperCase()))
        .replace(/\{\{SUBTITLE\}\}/g,     'POWER • RELIABILITY • VALUE')
        .replace(/\{\{PRICE\}\}/g,        escHtml(fmtPrice(car.price)))
        .replace(/\{\{VEHICLE_IMAGE\}\}/g, escHtml(car.main_image_url))
        .replace(/\{\{PHONE\}\}/g,        escHtml(CONTACT.phone))
        .replace(/\{\{EMAIL\}\}/g,        escHtml(CONTACT.email))
        .replace(/\{\{WEBSITE\}\}/g,      escHtml(CONTACT.website))
        .replace(/\{\{FEATURES\}\}/g,     buildFeatures(car))

    // 3) Write the rendered HTML to disk so styles.css resolves via relative path
    const renderedHtmlPath = resolve(ROOT, 'templates', 'rendered.html')
    writeFileSync(renderedHtmlPath, html)

    // 4) Launch headless Chrome and screenshot the .post-container at 1080x1080
    console.log('Launching Chrome...')
    // Prefer the system Chrome — the puppeteer-bundled Chromium failed to launch
    // on this Windows host (exit 0x80000003 / antivirus or DLL block).
    const systemChrome = process.env.CHROME_PATH
        || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: systemChrome,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 })
    await page.goto('file://' + renderedHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 })

    const outPath = resolve('public/preview/vehicle-showcase.png')
    const el = await page.$('.post-container')
    if (!el) throw new Error('.post-container not found')
    await el.screenshot({ path: outPath, type: 'png', omitBackground: false })
    await browser.close()

    console.log(`Saved ${outPath}`)
    console.log('Open: http://localhost:3000/preview/vehicle-showcase.png')
}

main().catch(e => { console.error(e); process.exit(1) })
