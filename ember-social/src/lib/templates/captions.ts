// Per-pillar caption generators + hashtag packs.
// Captions follow the sales-driven structure: HOOK → BODY → CTA → contact strip.

import { CONTACT, vehicleUrl, contactStrip, pickHashtags, VehicleInput } from './common'

function modelTrim(car: VehicleInput): string {
    const modelStr = String(car.model || '').replace(new RegExp(`^${car.make}\\s+`, 'i'), '').trim()
    return modelStr
}

// --- SHOWCASE ---
export function showcaseCaption(car: VehicleInput, freshBody?: string | null): string {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const price = car.price ? `R ${Math.round(Number(car.price)).toLocaleString('en-ZA').replace(/,/g, ' ')}` : ''
    const url = vehicleUrl(car)
    if (freshBody) {
        const specs = `${car.transmission || ''} • ${car.fuel_type || ''} • ${Number(car.mileage).toLocaleString('en-ZA').replace(/,/g, ' ')} km • ${car.colour || ''}`
        return `${freshBody}\n\n${name}${price ? ` — ${price}` : ''}\n${specs}\n\nView it today: ${url}${contactStrip()}`
    }
    const hook = `Your next adventure starts right here in White River.`
    const body = `We've just listed this immaculate ${name} — and it's priced to move at ${price}.\n\n${car.transmission || ''} • ${car.fuel_type || ''} • ${Number(car.mileage).toLocaleString('en-ZA').replace(/,/g, ' ')} km • ${car.colour || ''}\n\nFinance available. Trade-ins welcome. View it today on our website or WhatsApp us for a walk-around video.`
    const cta = `Secure this deal: ${url}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function showcaseHashtags(car: VehicleInput): string[] {
    return pickHashtags(4, [
        `#${car.make}${car.model}`.replace(/[^a-zA-Z0-9#]/g, ''),
        '#PreOwned',
    ])
}

// --- LIFESTYLE ---
export function lifestyleCaption(car: VehicleInput, freshBody?: string | null): string {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const url = vehicleUrl(car)
    if (freshBody) {
        return `${freshBody}\n\n${name}\n\nSee the full gallery: ${url}${contactStrip()}`
    }
    const hook = `Some cars are made for city streets. This one was made for the open road.`
    const body = `Picture yourself behind the wheel of this ${car.colour?.toLowerCase() || 'stunning'} ${name}, winding through the Mpumalanga lowveld at golden hour.\n\n${car.transmission || ''} • ${car.fuel_type || ''} • ${Number(car.mileage).toLocaleString('en-ZA').replace(/,/g, ' ')} km\n\nThis isn't just a car — it's your ticket to adventure.`
    const cta = `See the full gallery: ${url}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function lifestyleHashtags(car: VehicleInput): string[] {
    return pickHashtags(4, ['#AdventureAwaits', '#WeekendEscape'])
}

// --- MAINTENANCE ---
export function maintenanceCaption(car: VehicleInput, freshBody?: string | null): string {
    if (freshBody) {
        return `${freshBody}\n\nBrowse our quality pre-owned range: ${CONTACT.website}/inventory${contactStrip()}`
    }
    const hook = `A small habit that saves you thousands down the road.`
    const body = `Regular maintenance is the secret to keeping your vehicle running strong for years — and preserving its resale value.\n\nAt Everest Motoring, every pre-owned vehicle is workshop-inspected before it reaches our floor. Here's a quick tip: check your oil every two weeks and your tyre pressure monthly. It takes two minutes and can prevent major repairs.\n\nLooking for a well-maintained, quality pre-owned vehicle?`
    const cta = `Browse our inventory: ${CONTACT.website}/inventory`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function maintenanceHashtags(): string[] {
    return pickHashtags(3, ['#CarCare', '#MaintenanceTips', '#ServiceAdvice'])
}

// --- SEASONAL ---
export function seasonalCaption(freshBody?: string | null): string {
    if (freshBody) {
        return `${freshBody}\n\nBrowse our inventory: ${CONTACT.website}/inventory${contactStrip()}`
    }
    const month = new Date().toLocaleDateString('en-ZA', { month: 'long' })
    const hook = `${month} in Mpumalanga — the roads are calling.`
    const body = `Whether it's a weekend escape to the Drakensberg, a family trip to the Kruger, or just cruising the Panorama Route — the right vehicle makes all the difference.\n\nEverest Motoring has a showroom full of quality pre-owned vehicles ready for your next road trip. From fuel-efficient hatchbacks to rugged 4x4s, we've got you covered.\n\nPop in at White River or browse online:`
    const cta = `${CONTACT.website}/inventory`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function seasonalHashtags(): string[] {
    const sa = ['#RoadTripSA', '#MpumalangaWeekend', '#ExploreSA', '#SchoolHolidays', '#SummerDrives']
    return pickHashtags(3, sa.slice(0, 3))
}

// --- SELL YOUR CAR ---
export function sellYourCarCaption(freshBody?: string | null): string {
    if (freshBody) {
        return `${freshBody}\n\nGet your free valuation: ${CONTACT.sellYourCarUrl}${contactStrip()}`
    }
    const hook = `Thinking of upgrading? We'll buy your car — fast, fair offer in 60 seconds.`
    const body = `No hassle. No endless listings. No tyre-kickers.\n\nBring your car to Everest Motoring in White River and get a free, no-obligation valuation. We buy all makes and models — settle your finance and walk away with cash, or trade it in against any vehicle on our floor.\n\nIt's quick, it's simple, and it could be the easiest money you make this month.`
    const cta = `Get your free valuation: ${CONTACT.sellYourCarUrl}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function sellYourCarHashtags(): string[] {
    return pickHashtags(3, ['#SellYourCar', '#TradeInSA', '#WeBuyCars'])
}

// --- FINANCE ---
export function financeCaption(car: VehicleInput, monthly: number, freshBody?: string | null): string {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const url = vehicleUrl(car)
    const amount = `R${monthly.toLocaleString('en-ZA').replace(/,/g, ' ')}`
    if (freshBody) {
        return `${freshBody}\n\n${name} — estimated ${amount}/month*\n\n*Est: no deposit, no balloon, 72 months @ 12.5% p.a. On approved credit. T&Cs apply.\n\nView it today: ${url}${contactStrip()}`
    }
    const hook = `Getting into something you love shouldn't mean waiting years.`
    const body = `The ${name} works out to an estimated ${amount} a month.* Come talk numbers — you might be closer than you think.`
    const disclaimer = `*Est: no deposit, no balloon, 72 months @ 12.5% p.a. On approved credit. T&Cs apply.`
    const cta = `View it today: ${url}`
    return `${hook}\n\n${body}\n\n${disclaimer}\n\n${cta}${contactStrip()}`
}

export function financeHashtags(): string[] {
    return pickHashtags(3, ['#CarFinance', '#DriveNow', '#PreOwned'])
}

// --- COMPARISON ---
export function comparisonCaption(carA: VehicleInput, carB: VehicleInput, labelA: string, labelB: string, freshBody?: string | null): string {
    const nameA = `${carA.year} ${carA.make} ${modelTrim(carA)}`
    const nameB = `${carB.year} ${carB.make} ${modelTrim(carB)}`
    if (freshBody) {
        return `${freshBody}\n\nLeft: the ${nameA} ("${labelA}"). Right: the ${nameB} ("${labelB}").\n\nWhich one is you? Tell us in the comments.${contactStrip()}`
    }
    const hook = `Two very different kinds of Saturday. 👇`
    const body = `Left: the ${nameA} — ${labelA.toLowerCase()}. Right: the ${nameB} — ${labelB.toLowerCase()}.`
    const cta = `Which one is you? Tell us in the comments — we'll help you find it in stock.`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function comparisonHashtags(): string[] {
    return pickHashtags(3, ['#WhichOneAreYou', '#PreOwned'])
}

// --- SEASONAL LOCAL ---
export function seasonalLocalCaption(freshBody?: string | null): string {
    if (freshBody) {
        return `${freshBody}\n\nBrowse our inventory: ${CONTACT.website}/inventory${contactStrip()}`
    }
    const hook = `Long weekend ahead — where are you headed?`
    const body = `The Panorama Route, a Kruger day trip, or just a quiet escape into the lowveld — whatever the plan, the right vehicle makes the drive part of the getaway.\n\nTell us where you're headed this weekend, and let's find the car that gets you there.`
    const cta = `Browse our inventory: ${CONTACT.website}/inventory`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function seasonalLocalHashtags(): string[] {
    return pickHashtags(3, ['#LongWeekend', '#PanoramaRoute', '#WhereAreYouHeaded'])
}

// --- VIDEO ---
export function videoCaption(conceptTitle: string, car: VehicleInput): string {
    const name = `${car.year} ${car.make} ${modelTrim(car)}`
    const url = vehicleUrl(car)
    const hook = `${conceptTitle} 🎬`
    const body = `Watch the ${name} in motion. Hit play and see why this one won't be sitting on our floor for long.`
    const cta = `See the full listing: ${url}`
    return `${hook}\n\n${body}\n\n${cta}${contactStrip()}`
}

export function videoHashtags(): string[] {
    return pickHashtags(3, ['#WatchThis', '#ReelDrive', '#PreOwned'])
}
