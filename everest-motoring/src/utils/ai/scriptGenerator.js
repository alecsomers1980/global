import { runWithFallback } from "./aiProviderChain";

function pickFeaturedPair(features, pool) {
    if (!features || features.length === 0) return [];
    const matches = features.filter(f => pool.some(p => f.toLowerCase().includes(p.toLowerCase())));
    return matches.slice(0, 2);
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
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: Clean, studio-quality South African English Female Voiceover with absolutely NO background noise, static, hiss, interference, or ambient sound — voice only on a silent background: [Write a unique, premium 1-sentence Call to Action urging the viewer to contact Everest Motoring regarding this specific make/model. Do NOT use the word 'new']"

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

        const techLine = tech.length > 0
            ? `Featuring ${tech.join(' and ')}, technology that puts you in complete control.`
            : `Technology that puts you in complete control, right at your fingertips.`;

        const comfortLine = comfort.length > 0
            ? `With ${comfort.join(' and ')}, every journey becomes exceptional.`
            : `Designed for exceptional comfort on every journey.`;

        const transmissionFuel = [car.transmission, car.fuel_type].filter(Boolean).join(' ');
        const hookLine = transmissionFuel
            ? `Introducing the striking ${car.year} ${car.make} ${car.model}, a ${transmissionFuel} masterpiece.`
            : `Introducing the striking ${car.year} ${car.make} ${car.model}.`;

        const motionRule = "Camera motion is a slow Ken-Burns-style 2D zoom only — either a slow zoom-in or a slow zoom-out on the source image. There is NO 3D camera, NO push-in through space, NO angle change, NO pan, NO parallax. The first frame is identical to the source image; the clip animates only via this digital zoom. The motion is already in progress on frame one and continues smoothly to the last frame.";
        const cleanAudio = "Clean, studio-quality South African English Female Voiceover with absolutely no background noise, static, hiss, interference, or ambient sound — voice only on a silent background";

        return [
            { scene: 1, location: "exterior", visual_prompt: `The ${car.year} ${car.make} ${car.model} is parked completely stationary and motionless — wheels do not turn, body does not move. Use the source photo AS-IS: the entire frame — vehicle, number plate, ground, buildings, sky, lighting, every detail — is preserved exactly as in the uploaded reference image. Do not add, remove, or modify anything. Do not change the number plate text or graphics; the existing plate is correct as-is. Do not invent or insert walls, signs, posters, logos, or surroundings not already in the reference photo. Camera angle is LOCKED — same position, same perspective, same framing as the source image throughout. Do not orbit, pan, or change angle. Camera motion is a slow gentle zoom only — either a slow zoom-in toward the car or a slow zoom-out away from the car on the same optical axis, already in motion on frame one. ${motionRule} Preserve the lighting of the source image. AUDIO: ${cleanAudio}: '${hookLine}'` },
            { scene: 2, location: "interior", visual_prompt: `Interior dashboard view of the ${car.make} ${car.model}. The first frame of the video is identical to the source image — same dashboard, same cockpit layout, same colours, same lighting. ${motionRule} The physical steering wheel is locked firmly on the RIGHT side. The dashboard, displays, and surrounding interior are preserved exactly as in the reference image; do not invent additional buttons, screens, trim, or features. Soft ambient lighting matching the source image. AUDIO: ${cleanAudio}: '${techLine}'` },
            { scene: 3, location: "interior", visual_prompt: `Rear cabin view of the ${car.make} ${car.model}. The first frame of the video is identical to the source image — same seats, same trim, same view through the windows, same lighting. ${motionRule} The cabin interior and the background environment visible through the windows are preserved exactly as in the source image; do not invent additional features, accessories, or scenery. AUDIO: ${cleanAudio}: '${comfortLine}'` },
            { scene: 4, location: "exterior", visual_prompt: `${presenterDesc} stands perfectly upright the entire clip — head held high, shoulders square, spine straight, body vertical at all times. She does not bend, lean, kneel, or crouch. Only her hands, head, and facial expression move; the torso stays still and vertical. She stands next to the exact same ${car.make} ${car.model} from the exterior hero shot. The background environment matches the reference image EXACTLY — same parking surface, same buildings, trees, sky, walls, and lighting as in the source photo. Do not invent a new environment, do not change the background geometry, do not insert different surroundings, do not add walls, signs, posters, or logos that are not already present in the reference image. The presenter is composited into the existing scene; nothing in the background changes. ${motionRule} She looks directly into the camera with a warm inviting smile, with subtle natural hand gestures kept near her chest or waist. AUDIO: ${cleanAudio}: 'Contact Everest Motoring today to book your test drive in this exceptional ${car.make} ${car.model}.'` }
        ];
    }
}

export function buildFallbackDescription(car, manualDescription) {
    const priceFormatted = car.price ? new Intl.NumberFormat('en-ZA').format(car.price) : null;
    const features = (car.features || []).slice(0, 8);
    const specs = [];
    if (car.mileage) specs.push(`${new Intl.NumberFormat('en-ZA').format(car.mileage)} km on the clock`);
    if (car.transmission) specs.push(car.transmission.toLowerCase());
    if (car.fuel_type) specs.push(car.fuel_type.toLowerCase());

    const specLine = specs.length > 0 ? `Presented with ${specs.join(', ')}.` : '';
    const featureLine = features.length > 0
        ? `Key features include ${features.join(', ')}.`
        : '';
    const priceLine = priceFormatted ? ` Priced at ${priceFormatted} South African Rand.` : '';
    const manualLine = manualDescription ? ` ${manualDescription}` : '';

    return `Discover this exceptional ${car.year} ${car.make} ${car.model} at Everest Motoring in White River. ${specLine} ${featureLine}${manualLine}${priceLine} Contact Everest Motoring today to book your test drive or inquire about our tailored finance options.`.replace(/\s+/g, ' ').trim();
}

export async function optimizeVehicleDescription(car, manualDescription) {
    try {
        console.log(`[SEO Content] Starting description optimization for ${car.year} ${car.make} ${car.model}...`);

        const promptText = `
You are an expert South African automotive copywriter specializing in high-converting SEO and local-search (GEO) optimized sales copy for Everest Motoring — a premium pre-owned vehicle dealership based in White River, Mpumalanga, serving customers across the Lowveld, Nelspruit, Hazyview, Sabie, Witbank, and the wider Mpumalanga region.

Your goal is to write a description that ranks on Google for South African buyers AND converts visitors into test-drive bookings or finance enquiries.

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

LENGTH & STRUCTURE:
1. Write FOUR distinct paragraphs (roughly 4-6 sentences each), totalling 250-400 words. This is a premium listing — depth and detail matter.
2. Paragraph 1 — The Hook: open with a vivid scene-setter that mentions the year, make, model, and (if visible in the image) colour. Establish desirability immediately.
3. Paragraph 2 — Performance & Driving Experience: describe the engine, transmission, fuel type, and how the car feels to drive. Reference specs from the data above.
4. Paragraph 3 — Features & Comfort: weave in the specific features list naturally — group them into themes (safety, technology, comfort, exterior). Don't just list; interpret why each matters to the buyer.
5. Paragraph 4 — Value Proposition + Call to Action: address pricing, condition, the dealership's reputation, and close with a strong dual CTA (book a test drive AND/OR enquire about tailored vehicle finance).

SEO & GEO REQUIREMENTS:
6. Naturally include phrases that match real South African search queries: "used ${car.make} ${car.model} for sale", "pre-owned ${car.make} ${car.model} in South Africa", "${car.make} ${car.model} ${car.year}", "buy ${car.make} ${car.model} in Mpumalanga", "${car.make} dealer in White River", "pre-owned cars in Lowveld", "second-hand ${car.make} near Nelspruit". Use 4-6 of these phrases naturally — never as a keyword stuff list.
7. Mention "Everest Motoring" by name at least twice — once mid-copy, once in the CTA.
8. Mention the dealership's location (White River, Mpumalanga) at least once.

PRICE & CURRENCY:
9. CRITICAL: When mentioning the price, write it exactly as "${car.price} South African Rand" (spelled out, not "R" or "ZAR"). This improves voice-search and accessibility.

IMAGE CONTEXT:
10. If a vehicle image is provided, identify the exact colour and any visible condition cues (clean panels, alloy wheels, interior trim) and weave them into paragraph 1 or 2 naturally.

CALL TO ACTION:
11. End with TWO clear actions a buyer can take, written persuasively:
    a) Book a test drive at Everest Motoring in White River
    b) Enquire about pre-approved vehicle asset finance through Everest Motoring's accredited finance partners
12. Add gentle urgency without being pushy: phrases like "vehicles of this calibre move quickly" or "stock is limited" are acceptable; avoid clichés like "act now" or "don't miss out".

FORMATTING:
13. Plain prose only. NO markdown headers (* or #), NO bullet lists, NO bold/italic markers. Return the clean text ready to drop into a website paragraph block.
14. Write in a confident, premium, trustworthy tone — never gimmicky or aggressive. Think "luxury dealer with friendly staff" not "used-car salesman".
`;

        const { text, providerUsed } = await runWithFallback({
            prompt: promptText,
            imageUrl: car.main_image_url || null,
            label: "description",
            maxOutputTokens: 1024,
        });
        console.log(`[SEO Content] Description generated via ${providerUsed}.`);
        return text;
    } catch (error) {
        console.error("[SEO Content] Both providers failed — using features-based fallback:", error.message);
        return buildFallbackDescription(car, manualDescription);
    }
}

