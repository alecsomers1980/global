// Per-pillar caption generators + hashtag packs.
// Each export returns { caption, hashtags }.
// Captions follow the sales-driven structure: HOOK → BODY → CTA → contact strip.

import { CONTACT, vehicleUrl, vehicleSlug, contactStrip, pickHashtags } from './common.mjs'

function modelTrim(car) {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr
}

// --- SHOWCASE ---
export function showcaseCaption(car) {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const price = car.price ? `R ${Math.round(Number(car.price)).toLocaleString('en-ZA').replace(/,/g, ' ')}` : ''
    const url = vehicleUrl(car)
    const hook = `Your next adventure starts right here in White River.`
    const body = `We've just listed this immaculate ${name} — and it's priced to move at ${price}.\n\n${car.transmission || ''} • ${car.fuel_type || ''} • ${Number(car.mileage).toLocaleString('en-ZA').replace(/,/g, ' ')} km • ${car.colour || ''}\n\nFinance available. Trade-ins welcome. View it today on our website or WhatsApp us for a walk-around video.`
    const cta = `Secure this deal: ${url}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function showcaseHashtags(car) {
    return pickHashtags(4, [
        `#${car.make}${car.model}`.replace(/[^a-zA-Z0-9#]/g, ''),
        '#PreOwned',
    ])
}

// --- LIFESTYLE ---
const LIFESTYLE_TAGLINES = [
    { line1: 'BUILT FOR', line2: 'THE LOWVELD', accent: 'LOWVELD' },
    { line1: 'MILES', line2: 'TO EXPLORE', accent: 'MILES' },
    { line1: 'OWN', line2: 'THE ROAD', accent: 'OWN' },
    { line1: 'ADVENTURE', line2: 'AWAITS', accent: 'ADVENTURE' },
    { line1: 'DRIVE', line2: 'BEYOND', accent: 'BEYOND' },
]

export function lifestyleTagline(car) {
    const idx = Math.abs(hashCode(car.id)) % LIFESTYLE_TAGLINES.length
    return LIFESTYLE_TAGLINES[idx]
}

function hashCode(s) {
    let h = 0
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
    return Math.abs(h)
}

export function lifestyleCaption(car) {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const url = vehicleUrl(car)
    const hook = `Some cars are made for city streets. This one was made for the open road.`
    const body = `Picture yourself behind the wheel of this ${car.colour?.toLowerCase() || 'stunning'} ${name}, winding through the Mpumalanga lowveld at golden hour.\n\n${car.transmission || ''} • ${car.fuel_type || ''} • ${Number(car.mileage).toLocaleString('en-ZA').replace(/,/g, ' ')} km\n\nThis isn't just a car — it's your ticket to adventure.`
    const cta = `See the full gallery: ${url}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function lifestyleHashtags(car) {
    return pickHashtags(4, ['#AdventureAwaits', '#WeekendEscape'])
}

// --- MAINTENANCE ---
export function maintenanceCaption(car) {
    const hook = `A small habit that saves you thousands down the road.`
    const body = `Regular maintenance is the secret to keeping your vehicle running strong for years — and preserving its resale value.\n\nAt Everest Motoring, every pre-owned vehicle is workshop-inspected before it reaches our floor. Here's a quick tip: check your oil every two weeks and your tyre pressure monthly. It takes two minutes and can prevent major repairs.\n\nLooking for a well-maintained, quality pre-owned vehicle?`
    const cta = `Browse our inventory: ${CONTACT.website}/inventory`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function maintenanceHashtags() {
    return pickHashtags(3, ['#CarCare', '#MaintenanceTips', '#ServiceAdvice'])
}

// --- SEASONAL ---
export function seasonalCaption() {
    const month = new Date().toLocaleDateString('en-ZA', { month: 'long' })
    const hook = `${month} in Mpumalanga — the roads are calling.`
    const body = `Whether it's a weekend escape to the Drakensberg, a family trip to the Kruger, or just cruising the Panorama Route — the right vehicle makes all the difference.\n\nEverest Motoring has a showroom full of quality pre-owned vehicles ready for your next road trip. From fuel-efficient hatchbacks to rugged 4x4s, we've got you covered.\n\nPop in at White River or browse online:`
    const cta = `${CONTACT.website}/inventory`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function seasonalHashtags() {
    const sa = ['#RoadTripSA', '#MpumalangaWeekend', '#ExploreSA', '#SchoolHolidays', '#SummerDrives']
    return pickHashtags(3, sa.slice(0, 3))
}

// --- SELL YOUR CAR ---
export function sellYourCarCaption() {
    const hook = `Thinking of upgrading? We'll buy your car — fast, fair offer in 60 seconds.`
    const body = `No hassle. No endless listings. No tyre-kickers.\n\nBring your car to Everest Motoring in White River and get a free, no-obligation valuation. We buy all makes and models — settle your finance and walk away with cash, or trade it in against any vehicle on our floor.\n\nIt's quick, it's simple, and it could be the easiest money you make this month.`
    const cta = `Get your free valuation: ${CONTACT.sellYourCarUrl}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function sellYourCarHashtags() {
    return pickHashtags(3, ['#SellYourCar', '#TradeInSA', '#WeBuyCars'])
}
