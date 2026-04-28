import { runWithFallback } from "./aiProviderChain";

function pickFeaturedPair(features, pool) {
    if (!features || features.length === 0) return [];
    const matches = features.filter(f => pool.some(p => f.toLowerCase().includes(p.toLowerCase())));
    return matches.slice(0, 2);
}

// Deterministic variant picker — same car always gets the same line,
// different cars naturally diverge across the pool. Used so the
// fallback voiceover doesn't read identically across listings.
function hashSeed(s) {
    const str = String(s || '');
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
}
function pickVariant(seed, pool, salt = 0) {
    if (!pool || pool.length === 0) return '';
    return pool[(hashSeed(seed) + salt) % pool.length];
}

export async function generateVehicleScript(car) {
    try {
        // Determine car type category for adaptive scripting
        let carType = "Standard";
        const bodyTypeClean = (car.model + " " + (car.description || "")).toLowerCase();
        if (bodyTypeClean.includes("suv") || bodyTypeClean.includes("fortuner") || bodyTypeClean.includes("rover") || bodyTypeClean.includes("cruiser")) {
            carType = "SUV (Focus on adventure, safety, ground clearance, and family utility)";
        } else if (bodyTypeClean.includes("hatch") || bodyTypeClean.includes("polo") || bodyTypeClean.includes("swift")) {
            carType = "Economy/Hatchback (Focus on fuel efficiency, value, city driving, and practicality)";
        } else if (car.price > 800000 || bodyTypeClean.includes("sedan") || bodyTypeClean.includes("bmw") || bodyTypeClean.includes("mercedes")) {
            carType = "Luxury Sedan/Premium (Focus on status, smooth ride, premium materials, and executive comfort)";
        }

        const prompt = `
You are an expert cinematic Creative Director specializing in luxury automotive car commercials.
Write an intelligent, 4-scene visual prompt script for an AI Image-to-Video generator (like Sora 2) based on the following vehicle.

Vehicle Details:
Make: ${car.make}
Model: ${car.model}
Year: ${car.year}
Price: R ${new Intl.NumberFormat('en-ZA').format(car.price)}
Mileage: ${car.mileage} km
Transmission: ${car.transmission || 'Unknown'}
Fuel Type: ${car.fuel_type || 'Unknown'}
Features: ${car.features && car.features.length > 0 ? car.features.join(', ') : 'Standard features'}

Adaptive Scripting Context:
This vehicle falls under the category: ${carType}.
Please subtly weave these category-specific themes into the scene details and camera dynamics.

Strict Instructions for the script:
1. You must write exactly FOUR scene descriptions. Each scene represents a video clip prompt.
2. These are pre-owned vehicles. NEVER use the word "new" in the voiceover scripts. Use words like "striking", "exceptional", or just the make and model.
2b. NEVER use the phrase "test drive" anywhere in any voiceover, in any scene. The CTA should invite the viewer to "view", "see", or "experience" the vehicle, or to "contact" / "visit" / "enquire with" Everest Motoring — never to book a test drive.
2c. VOICEOVER VARIETY — STRICT: each voiceover must feel uniquely written for THIS specific ${car.year} ${car.make} ${car.model}, not a fill-in-the-blank template. Vary your sentence openers, structures, and word choices. Do NOT default to predictable patterns like every Scene 1 starting with "Introducing the…", every Scene 4 starting with "Contact Everest Motoring today…", or "Featuring X and Y" / "With X and Y" stock phrasing. Treat each voiceover line as bespoke copy for this vehicle: reference its specific character — sporty, family-focused, executive, rugged, economical — and write language that fits THAT vehicle's personality rather than a generic luxury template. Two different cars must never receive the same voiceover line.
3. Keep visual descriptions concise and positive. Avoid negative words like "don't", "no", or "without", as they confuse the video AI. Describe exactly what SHOULD be seen.
4. CRITICAL MOTION RULE — apply to every scene: motion must be CONTINUOUS from frame one to the final frame. The camera should already be in motion when the clip begins. The scene must NEVER start or end with a static, frozen, or held frame. There must be smooth, unbroken movement across the entire duration of every clip. Never produce a still photograph effect at any point.

Scene Breakdown:
Scene 1: The Hook (Exterior Hero Shot)
- THE FIRST FRAME OF THE VIDEO IS IDENTICAL TO THE SOURCE IMAGE — pixel-for-pixel the same composition, same vehicle position, same number plate, same background, same lighting, same colours. Treat the reference image as a still photograph that you will animate by zoom alone.
- USE THE SOURCE PHOTO AS-IS: the entire frame — vehicle, number plate, ground, buildings, sky, lighting, every detail — is preserved exactly as in the uploaded reference image. Do NOT add, remove, or modify anything. Do NOT change the number plate text or graphics; the existing plate is correct and must remain unchanged. Do NOT invent or insert walls, signs, posters, logos, or surroundings that are not already in the reference photo.
- The vehicle is parked, completely STATIONARY, motionless throughout the entire clip — no rolling, no rocking, no body movement. Wheels do not turn.
- CAMERA — STRICT 2D ZOOM ONLY (Ken Burns effect): there is NO 3D camera, NO virtual dolly, NO push-in through space. The motion is purely a digital scale of the source image — like zooming into or out of a photograph in an image viewer. The camera does NOT travel forward or backward through the scene, does NOT change angle, does NOT change perspective, does NOT orbit, does NOT pan, does NOT tilt. Parallax must NOT occur — foreground and background scale together as a flat image.
- The angle, perspective, and framing of the source photo are LOCKED. No new sides of the vehicle become visible. No new portions of the background become visible. If something was hidden in the source image, it remains hidden. The shot is exactly the source photo with a slow zoom-in OR slow zoom-out, nothing more.
- Lighting: keep the natural lighting of the source image exactly. Subtle, realistic lens behaviour only.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: Clean, studio-quality South African English Female Voiceover with absolutely NO background noise, static, hiss, interference, or ambient sound — voice only on a silent background: [Write a catchy 1-sentence hook introducing the make and model]"

Scene 2: The Technology (Dashboard/Cockpit)
- THE FIRST FRAME OF THE VIDEO IS IDENTICAL TO THE SOURCE IMAGE — same dashboard, same cockpit layout, same colours, same lighting. The reference image is the starting frame of the clip.
- Camera motion is a slow gentle zoom only on the source image — either a slow zoom-in or a slow zoom-out, already in motion on frame one. No 3D push-in, no angle change, no pan, no parallax. Treat it as a Ken Burns zoom on a photograph.
- The dashboard, steering wheel, displays, and surrounding interior are preserved exactly as in the reference image. The steering wheel is locked firmly on the RIGHT side. Do not invent additional buttons, screens, trim, or features that are not already visible in the source image.
- Soft ambient lighting matching the source image.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a 1-sentence voiceover explicitly mentioning 1 or 2 of its best technology features]"

Scene 3: The Comfort (Rear Cabin)
- THE FIRST FRAME OF THE VIDEO IS IDENTICAL TO THE SOURCE IMAGE — same rear cabin, same seats, same trim, same view through the windows, same lighting. The reference image is the starting frame of the clip.
- Camera motion is a slow gentle zoom only on the source image — either a slow zoom-in or a slow zoom-out, already in motion on frame one. No 3D push-in, no angle change, no pan, no parallax. Treat it as a Ken Burns zoom on a photograph.
- The rear cabin interior and the background environment visible through the windows are preserved exactly as in the source image. Do not invent additional features, accessories, or scenery.
- Natural light matching the source image.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a 1-sentence voiceover explicitly mentioning its comfort or powertrain features]"

Scene 4: The Closer (Human Presenter)
- A professional, attractive female sales presenter with shoulder-length blonde hair, wearing a plain tailored navy blue blazer over a plain white blouse. The blazer is completely plain — no logos, no embroidery, no badges, no text, no patches, no breast pocket emblems of any kind.
- She stands next to the exact same vehicle from Scene 1.
- BACKGROUND — STRICT: the background environment matches the reference image EXACTLY — same parking surface, same buildings, trees, sky, walls, and lighting as in the source photo from Scene 1. Do NOT invent a new environment, do NOT change the background geometry, do NOT insert different surroundings, do NOT add walls, signs, posters, or logos that are not already present in the reference image. The presenter is composited into the existing scene; nothing in the background changes.
- POSTURE — STRICT: she stands perfectly upright the entire clip, head held high, shoulders square, spine straight. Her body remains vertical at ALL times. She does NOT bend, lean forward, lean sideways, kneel, crouch, or shift her hip stance. Only her hands, head, and facial expression move — the torso stays still and vertical from frame one to the final frame.
- She looks directly into the camera with a warm, inviting smile. Subtle, natural hand gestures stay near her chest or waist height — never reaching down or sweeping outward in a way that bends the body.
- Camera motion is a slow gentle zoom only — either a slow zoom-in toward the presenter or a slow zoom-out away from her, already in motion on frame one. No 3D push-in, no angle change, no pan, no parallax. Treat it as a Ken Burns zoom on a photograph; the source image's framing and perspective are locked.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: Clean, studio-quality South African English Female Voiceover with absolutely NO background noise, static, hiss, interference, or ambient sound — voice only on a silent background: [Write a unique, premium 1-sentence Call to Action urging the viewer to contact, visit, or enquire with Everest Motoring regarding this specific make/model. Do NOT use the word 'new'. Do NOT use the phrase 'test drive']"

Format Requirement: Return ONLY a valid JSON array of objects with keys: \`scene\`, \`location\`, \`visual_prompt\`.
Do not include markdown formatting outside the JSON array. The \`visual_prompt\` should be a single, long paragraph containing all the visual imagery, camera instructions, lighting, and action for the AI video generator.

Example Output:
[
  { "scene": 1, "location": "exterior", "visual_prompt": "Cinematic 4K tracking shot of the vehicle... [highly detailed prompt]" },
  { "scene": 2, "location": "interior", "visual_prompt": "Interior cinematic POV shot... [highly detailed prompt]" },
  { "scene": 3, "location": "interior", "visual_prompt": "Slow push-in to the back seat... [highly detailed prompt]" },
  { "scene": 4, "location": "exterior", "visual_prompt": "A professional white female presenter with shoulder-length blonde hair... [highly detailed prompt]" }
]
`;

        const { text, providerUsed } = await runWithFallback({
            prompt,
            label: "script",
            maxOutputTokens: 3000,
        });
        console.log(`[Script] Generated via ${providerUsed}`);

        // Extract the first JSON array from the response; tolerate stray prose/markdown.
        const match = text.match(/\[[\s\S]*\]/);
        const jsonText = match ? match[0] : text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating script via both providers — using feature-aware fallback:", error.message);

        // Feature-aware fallback: weave the actual car features into the voiceovers so
        // the video still sounds specific even when Gemini is unavailable.
        const presenterDesc = "A professional, attractive white female presenter with shoulder-length blonde hair, wearing a plain tailored navy blue blazer over a plain white blouse — the blazer is completely plain with no logos, no embroidery, no badges, no text, and no breast pocket emblems";

        const techPool = ["Apple CarPlay", "Android Auto", "Touchscreen", "Navigation", "Premium Audio", "Bluetooth", "Rear Camera", "Parking Sensors", "Lane Assist", "Blind Spot Monitor", "Cruise Control"];
        const comfortPool = ["Leather Seats", "Climate Control", "Air Conditioning", "Sunroof", "Keyless Entry", "Power Windows", "4WD/AWD", "Alloy Wheels"];

        const tech = pickFeaturedPair(car.features, techPool);
        const comfort = pickFeaturedPair(car.features, comfortPool);

        // Per-car deterministic seed — id when available, otherwise make+model+year.
        const seed = car.id || `${car.make}-${car.model}-${car.year}`;
        const transmissionFuel = [car.transmission, car.fuel_type].filter(Boolean).join(' ');
        const yMM = `${car.year} ${car.make} ${car.model}`;
        const mM = `${car.make} ${car.model}`;
        const techList = tech.join(' and ');
        const comfortList = comfort.join(' and ');

        // ===== Scene 1 hook variants =====
        const hookPoolWithDrive = [
            `Introducing the striking ${yMM}, a ${transmissionFuel} masterpiece.`,
            `Meet the ${yMM} — refined ${transmissionFuel} engineering, ready for the road.`,
            `This is the ${yMM}: ${transmissionFuel} confidence with unmistakable presence.`,
            `Step into the ${yMM} — a ${transmissionFuel} drive built for those who notice the details.`,
            `The ${yMM}, a ${transmissionFuel} expression of quiet capability.`,
            `Discover the ${yMM} — ${transmissionFuel}, refined, and quietly assured.`,
        ];
        const hookPoolNoDrive = [
            `Introducing the striking ${yMM}.`,
            `Meet the ${yMM} — refined, capable, and ready for the road.`,
            `Step into the ${yMM}, where presence meets purpose.`,
            `Discover the ${yMM} — exceptional engineering, unmistakable character.`,
            `The ${yMM}: quiet confidence, made for the long road.`,
            `Say hello to the ${yMM}, a vehicle that earns every glance.`,
        ];
        const hookLine = pickVariant(seed, transmissionFuel ? hookPoolWithDrive : hookPoolNoDrive);

        // ===== Scene 2 tech-feature variants =====
        const techPoolWith = [
            `Featuring ${techList}, technology that puts you in complete control.`,
            `${techList} keep you connected, informed, and effortlessly in command.`,
            `Equipped with ${techList}, the cabin is built around the way you actually drive.`,
            `From ${techList}, every detail is engineered to keep the driver in charge.`,
            `Technology like ${techList} brings the cockpit to life on every journey.`,
            `With ${techList}, the driver's world stays focused and connected.`,
        ];
        const techPoolWithout = [
            `Technology that puts you in complete control, right at your fingertips.`,
            `Inside, smart technology keeps every drive considered and connected.`,
            `A driver-focused cockpit built around clarity and control.`,
            `Tech designed to make every drive feel quietly intuitive.`,
            `Where smart engineering meets a genuinely driver-friendly cabin.`,
            `A cabin where useful technology stays exactly where you need it.`,
        ];
        const techLine = pickVariant(seed, tech.length > 0 ? techPoolWith : techPoolWithout, 7);

        // ===== Scene 3 comfort variants =====
        const comfortPoolWith = [
            `With ${comfortList}, every journey becomes exceptional.`,
            `${comfortList} turn the everyday commute into something quietly enjoyable.`,
            `Backed by ${comfortList}, the cabin invites you to slow down and settle in.`,
            `Inside, ${comfortList} make every kilometre genuinely comfortable.`,
            `${comfortList} elevate the rear cabin into a space built for the long haul.`,
            `With ${comfortList}, comfort is the quiet headline of every trip.`,
        ];
        const comfortPoolWithout = [
            `Designed for exceptional comfort on every journey.`,
            `A rear cabin built for unhurried, all-day comfort.`,
            `Space, light, and refinement make every backseat trip feel premium.`,
            `Where space and refinement meet — purpose-built for life on the road.`,
            `A cabin that turns long drives into something genuinely restful.`,
            `Comfort and space designed around the people in the back.`,
        ];
        const comfortLine = pickVariant(seed, comfort.length > 0 ? comfortPoolWith : comfortPoolWithout, 13);

        // ===== Scene 4 CTA variants (no 'test drive' phrasing) =====
        const ctaPool = [
            `Contact Everest Motoring today to view this exceptional ${mM} in person.`,
            `Visit Everest Motoring in White River and experience this ${mM} for yourself.`,
            `Get in touch with Everest Motoring — this ${mM} is ready to be seen.`,
            `Reach out to Everest Motoring today and arrange a viewing of this ${mM}.`,
            `Speak to the team at Everest Motoring about this striking ${mM}.`,
            `Enquire with Everest Motoring — this ${mM} won't be on the floor for long.`,
        ];
        const ctaLine = pickVariant(seed, ctaPool, 23);

        const motionRule = "Camera motion is a slow Ken-Burns-style 2D zoom only — either a slow zoom-in or a slow zoom-out on the source image. There is NO 3D camera, NO push-in through space, NO angle change, NO pan, NO parallax. The first frame is identical to the source image; the clip animates only via this digital zoom. The motion is already in progress on frame one and continues smoothly to the last frame.";
        const cleanAudio = "Clean, studio-quality South African English Female Voiceover with absolutely no background noise, static, hiss, interference, or ambient sound — voice only on a silent background";

        return [
            { scene: 1, location: "exterior", visual_prompt: `The ${car.year} ${car.make} ${car.model} is parked completely stationary and motionless — wheels do not turn, body does not move. Use the source photo AS-IS: the entire frame — vehicle, number plate, ground, buildings, sky, lighting, every detail — is preserved exactly as in the uploaded reference image. Do not add, remove, or modify anything. Do not change the number plate text or graphics; the existing plate is correct as-is. Do not invent or insert walls, signs, posters, logos, or surroundings not already in the reference photo. Camera angle is LOCKED — same position, same perspective, same framing as the source image throughout. Do not orbit, pan, or change angle. Camera motion is a slow gentle zoom only — either a slow zoom-in toward the car or a slow zoom-out away from the car on the same optical axis, already in motion on frame one. ${motionRule} Preserve the lighting of the source image. AUDIO: ${cleanAudio}: '${hookLine}'` },
            { scene: 2, location: "interior", visual_prompt: `Interior dashboard view of the ${car.make} ${car.model}. The first frame of the video is identical to the source image — same dashboard, same cockpit layout, same colours, same lighting. ${motionRule} The physical steering wheel is locked firmly on the RIGHT side. The dashboard, displays, and surrounding interior are preserved exactly as in the reference image; do not invent additional buttons, screens, trim, or features. Soft ambient lighting matching the source image. AUDIO: ${cleanAudio}: '${techLine}'` },
            { scene: 3, location: "interior", visual_prompt: `Rear cabin view of the ${car.make} ${car.model}. The first frame of the video is identical to the source image — same seats, same trim, same view through the windows, same lighting. ${motionRule} The cabin interior and the background environment visible through the windows are preserved exactly as in the source image; do not invent additional features, accessories, or scenery. AUDIO: ${cleanAudio}: '${comfortLine}'` },
            { scene: 4, location: "exterior", visual_prompt: `${presenterDesc} stands perfectly upright the entire clip — head held high, shoulders square, spine straight, body vertical at all times. She does not bend, lean, kneel, or crouch. Only her hands, head, and facial expression move; the torso stays still and vertical. She stands next to the exact same ${car.make} ${car.model} from the exterior hero shot. The background environment matches the reference image EXACTLY — same parking surface, same buildings, trees, sky, walls, and lighting as in the source photo. Do not invent a new environment, do not change the background geometry, do not insert different surroundings, do not add walls, signs, posters, or logos that are not already present in the reference image. The presenter is composited into the existing scene; nothing in the background changes. ${motionRule} She looks directly into the camera with a warm inviting smile, with subtle natural hand gestures kept near her chest or waist. AUDIO: ${cleanAudio}: '${ctaLine}'` }
        ];
    }
}

export function buildFallbackDescription(car, manualDescription) {
    const priceFormatted = car.price ? new Intl.NumberFormat('en-ZA').format(car.price) : null;
    const allFeatures = car.features || [];
    const mileageFormatted = car.mileage ? new Intl.NumberFormat('en-ZA').format(car.mileage) : null;

    // Bucket features into themes so the prose feels interpreted, not listed.
    const safetyTerms = ["abs", "airbag", "esp", "stability", "traction", "lane", "blind spot", "parking sensor", "rear camera", "isofix"];
    const techTerms = ["carplay", "android auto", "touchscreen", "navigation", "bluetooth", "premium audio", "cruise control", "keyless"];
    const comfortTerms = ["leather", "climate", "air conditioning", "sunroof", "heated seat", "power", "electric"];
    const exteriorTerms = ["alloy", "led", "xenon", "tow bar", "roof rail", "fog", "running light", "4wd", "awd"];

    const bucket = (pool) => allFeatures.filter(f => pool.some(p => f.toLowerCase().includes(p)));
    const safety = bucket(safetyTerms);
    const tech = bucket(techTerms);
    const comfort = bucket(comfortTerms);
    const exterior = bucket(exteriorTerms);

    // === Paragraph 1: The Hook ===
    const transmissionFuel = [car.transmission, car.fuel_type].filter(Boolean).join(' ');
    const driveLine = transmissionFuel ? ` This ${transmissionFuel.toLowerCase()} ${car.model}` : ` This ${car.model}`;
    const para1 = `Discover this exceptional ${car.year} ${car.make} ${car.model} — now available at Everest Motoring in White River, Mpumalanga. A standout in the pre-owned ${car.make} ${car.model} for sale market, this vehicle blends presence, refinement, and everyday capability in a way that's increasingly hard to find at this price point.${driveLine} has been carefully prepared to dealer-ready standard and is ready to be driven home today.`;

    // === Paragraph 2: Performance & Driving Experience ===
    const mileagePhrase = mileageFormatted ? `With ${mileageFormatted} km on the clock, this ${car.make} ${car.model} ${car.year} has been looked after and shows the maturity of a vehicle that has been driven well, not driven hard.` : `This ${car.make} ${car.model} ${car.year} has been carefully maintained and is ready for its next chapter.`;
    const transmissionPhrase = car.transmission ? `The ${car.transmission.toLowerCase()} transmission delivers smooth, confident shifts whether you're navigating Nelspruit traffic or stretching its legs out to Hazyview, Sabie, or White River's quieter back roads.` : `The drivetrain delivers smooth, confident performance across Mpumalanga's varied terrain.`;
    const fuelPhrase = car.fuel_type ? `Running on ${car.fuel_type.toLowerCase()}, it's well-suited to the long-distance realities of life in the Lowveld and the wider Mpumalanga region.` : `It's well-suited to the long-distance realities of life in the Lowveld and the wider Mpumalanga region.`;
    const para2 = `${mileagePhrase} ${transmissionPhrase} ${fuelPhrase}`;

    // === Paragraph 3: Features & Comfort ===
    const featureSentences = [];
    if (safety.length > 0) featureSentences.push(`On the safety side, you'll find ${safety.slice(0, 4).join(', ')} — the kind of equipment that earns its keep on long family trips.`);
    if (tech.length > 0) featureSentences.push(`Technology is well covered with ${tech.slice(0, 4).join(', ')}, keeping you connected and in control without distraction.`);
    if (comfort.length > 0) featureSentences.push(`Inside, ${comfort.slice(0, 4).join(', ')} make every journey feel a little more considered.`);
    if (exterior.length > 0) featureSentences.push(`Exterior touches include ${exterior.slice(0, 4).join(', ')}, lifting the kerb appeal beyond what you'd expect at this price.`);
    if (featureSentences.length === 0 && allFeatures.length > 0) {
        featureSentences.push(`Notable equipment includes ${allFeatures.slice(0, 6).join(', ')} — features that make the daily drive measurably better.`);
    }
    if (manualDescription) featureSentences.push(manualDescription.trim());
    const para3 = featureSentences.length > 0
        ? featureSentences.join(' ')
        : `This ${car.make} is well equipped with the kind of comfort, safety, and convenience features that make the daily drive measurably better.`;

    // === Paragraph 4: Value + Dual CTA ===
    const pricePhrase = priceFormatted
        ? `Priced at ${priceFormatted} South African Rand, this ${car.year} ${car.make} ${car.model} represents genuine value in the second-hand ${car.make} near Nelspruit market — and vehicles of this calibre move quickly through our showroom.`
        : `This ${car.year} ${car.make} ${car.model} represents genuine value in the second-hand ${car.make} near Nelspruit market — and vehicles of this calibre move quickly through our showroom.`;
    const para4 = `${pricePhrase} Everest Motoring has built its reputation in White River, Mpumalanga as a trusted ${car.make} dealer in White River and across the Lowveld, with transparent pricing, honest condition reports, and a friendly, no-pressure approach. Ready to take the next step? Arrange a viewing at Everest Motoring in White River to experience this ${car.model} in person, or enquire about pre-approved vehicle asset finance through our accredited banking partners — we'll structure a tailored finance package that fits your budget. Contact Everest Motoring today on our website or by phone, and let's get you behind the wheel.`;

    return [para1, para2, para3, para4].join('\n\n').replace(/\s+\n/g, '\n').trim();
}

export async function optimizeVehicleDescription(car, manualDescription) {
    try {
        console.log(`[SEO Content] Starting description optimization for ${car.year} ${car.make} ${car.model}...`);

        const promptText = `
You are an expert South African automotive copywriter specializing in high-converting SEO and local-search (GEO) optimized sales copy for Everest Motoring — a premium pre-owned vehicle dealership based in White River, Mpumalanga, serving customers across the Lowveld, Nelspruit, Hazyview, Sabie, Witbank, and the wider Mpumalanga region.

Your goal is to write a description that ranks on Google for South African buyers AND converts visitors into showroom viewings or finance enquiries.

Vehicle Details:
Make: ${car.make}
Model: ${car.model}
Year: ${car.year}
Price: ${car.price}
Mileage: ${car.mileage} km
Transmission: ${car.transmission || 'Unknown'}
Fuel Type: ${car.fuel_type || 'Unknown'}
Features: ${car.features && car.features.length > 0 ? car.features.join(', ') : 'Standard features'}
User's Extra/Unique Features: ${manualDescription || 'None provided'}

Strict Instructions:

LENGTH & STRUCTURE — NON-NEGOTIABLE:
1. Write EXACTLY FOUR paragraphs separated by a blank line. Each paragraph must be 5–8 full sentences. The total word count MUST be between 380 and 500 words. Anything under 350 words will be rejected. This is a premium listing — depth, specificity, and texture matter.
2. Paragraph 1 — The Hook (~90–110 words): open with a vivid scene-setter that names the year, make, model, and (if visible in the image) the colour and stance. Establish desirability and specificity immediately. Mention Everest Motoring and White River, Mpumalanga in this paragraph.
3. Paragraph 2 — Performance & Driving Experience (~90–120 words): describe the powertrain (engine where inferable, transmission, fuel type), driving feel, refinement, ride quality, and how it handles the realities of Mpumalanga / Lowveld driving (long-distance N4 trips, town traffic, gravel roads, family duties — pick what fits). Reference the actual mileage figure and explain why the kilometre count is reassuring rather than concerning.
4. Paragraph 3 — Features & Comfort (~100–130 words): GROUP the supplied features into THEMES — safety, driver-assistance technology, infotainment, comfort, exterior. For each theme, name 2–4 specific features from the list and explain WHY each matters to a Lowveld buyer. Do not just list — interpret. If the user supplied "Extra/Unique Features", weave that text in naturally somewhere in this paragraph.
5. Paragraph 4 — Value, Trust & Dual Call to Action (~90–120 words): justify the price as fair value relative to the local pre-owned market; reinforce Everest Motoring's reputation in White River; close with TWO concrete actions the buyer can take RIGHT NOW (arrange a viewing of this specific vehicle AND enquire about pre-approved asset finance). Add gentle urgency but no clichés.

SEO & GEO REQUIREMENTS — MUST APPEAR:
6. Naturally weave in 5–7 of these South African search phrases (verbatim or near-verbatim, but never as a comma-list): "used ${car.make} ${car.model} for sale", "pre-owned ${car.make} ${car.model} in South Africa", "${car.year} ${car.make} ${car.model}", "buy ${car.make} ${car.model} in Mpumalanga", "${car.make} dealer in White River", "pre-owned cars in the Lowveld", "second-hand ${car.make} near Nelspruit", "${car.make} ${car.model} for sale Mpumalanga". Spread them across paragraphs 1, 3, and 4.
7. Mention "Everest Motoring" by name AT LEAST THREE times across the description.
8. Mention "White River" at least twice and "Mpumalanga" at least twice. Mention at least one of: Nelspruit, Hazyview, Sabie, the Lowveld.
9. Reference at least one buyer scenario tied to the region (school runs in White River, weekend trips into the Kruger, commuting on the N4 to Witbank or Pretoria, etc.) — this signals genuine local relevance to Google.

PRICE & CURRENCY:
10. CRITICAL: When stating the price, write it exactly as "${car.price} South African Rand" (spelled out, NOT "R", NOT "ZAR", NOT "rand"). This improves voice-search and accessibility.

IMAGE CONTEXT:
11. If a vehicle image is provided, identify the exact colour and any visible condition cues (clean panels, alloy wheels, interior trim, badging) and weave them into paragraph 1 or 2 naturally.

CALL TO ACTION:
12. The final paragraph MUST end with two clear, persuasive actions written as full sentences:
    a) Arrange a viewing of this ${car.model} at Everest Motoring in White River — frame it as the way to experience this specific vehicle in person. NEVER use the phrase "test drive".
    b) Enquire about pre-approved vehicle asset finance through Everest Motoring's accredited banking partners — frame it as a path to a tailored, affordable monthly package.
12b. CRITICAL: The phrase "test drive" must NOT appear anywhere in the description. Use "view", "see", "arrange a viewing", "experience in person", or "visit our showroom" instead.
13. Add gentle urgency without being pushy: phrases like "vehicles of this calibre move quickly" or "stock at this spec is limited" are fine; avoid clichés like "act now", "don't miss out", "while stocks last".

FORMATTING:
14. Plain prose only. Paragraphs separated by a single blank line. NO markdown headers (#, *), NO bullet lists, NO bold/italic markers. Return clean text ready to drop into a website paragraph block.
15. Write in a confident, premium, trustworthy tone — never gimmicky or aggressive. Think "luxury dealer with friendly staff" not "used-car salesman".
16. Do NOT preface the output with anything like "Here is your description:" — return ONLY the four paragraphs.
`;

        const { text, providerUsed } = await runWithFallback({
            prompt: promptText,
            imageUrl: car.main_image_url || null,
            label: "description",
            maxOutputTokens: 2048,
        });
        console.log(`[SEO Content] Description generated via ${providerUsed}.`);

        // Length guard — if the AI returned a thin response, fall back to the
        // substantial template instead of shipping a 50-word listing.
        const wordCount = String(text || '').trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 250) {
            console.warn(`[SEO Content] AI returned only ${wordCount} words — using full fallback for quality.`);
            return buildFallbackDescription(car, manualDescription);
        }

        return text;
    } catch (error) {
        console.error("[SEO Content] Both providers failed — using features-based fallback:", error.message);
        return buildFallbackDescription(car, manualDescription);
    }
}

