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
- Continuous slow cinematic push-in already in motion on frame one, with a subtle angle change for a premium feel. The camera moves smoothly toward the vehicle without ever pausing. Do not distort the background geometry.
- Dramatic lighting (e.g., Golden Hour sunset with realistic lens flares or moody showroom lighting).
- The vehicle's front license plate clearly displays the word "EVEREST" in clean lettering.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a catchy 1-sentence hook introducing the make and model]"

Scene 2: The Technology (Dashboard/Cockpit)
- Continuous slow cinematic push-in on the dashboard, already in motion on frame one. The camera moves smoothly toward the dashboard for the entire clip with no pauses or held frames. Focus entirely on the area visible in the reference image.
- The steering wheel is locked firmly on the RIGHT side. The dashboard retains its exact original layout and analog/digital display style.
- Soft ambient lighting.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a 1-sentence voiceover explicitly mentioning 1 or 2 of its best technology features]"

Scene 3: The Comfort (Rear Cabin)
- Continuous slow cinematic push-in into the rear cabin, already in motion on frame one. Smooth, uninterrupted forward movement for the full clip duration.
- The cabin interior and the exact background environment visible through the windows perfectly match the source image.
- Natural light streaming through the windows emphasizing space.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a 1-sentence voiceover explicitly mentioning its comfort or powertrain features]"

Scene 4: The Closer (Human Presenter)
- A professional, attractive female sales presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an "Everest Motoring" logo on the breast pocket.
- She stands next to the exact same vehicle from Scene 1, in the exact same outdoor or indoor environment as Scene 1. A subtle "EVEREST MOTORING" logo is visible on a wall or structure behind her.
- She looks directly into the camera with a warm, inviting smile, gesturing welcomingly throughout — her hand and head movement is constant and natural for the whole clip.
- Continuous slow cinematic push-in toward the presenter, already in motion on frame one. The push-in continues smoothly across the entire clip with no held frames.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a unique, premium 1-sentence Call to Action urging the viewer to contact Everest Motoring regarding this specific make/model. Do NOT use the word 'new']"

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
        const presenterDesc = "A professional, attractive white female presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an 'Everest Motoring' logo";

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

        const motionRule = "Camera motion is continuous from frame one to the last frame, with smooth uninterrupted movement across the entire clip. Never produce a held or static frame at any point.";

        return [
            { scene: 1, location: "exterior", visual_prompt: `Continuous slow cinematic push-in already in motion on frame one of the ${car.year} ${car.make} ${car.model}. ${motionRule} Do not change the background geometry. The front license plate features a clean 'EVEREST' logo. Dramatic "Golden Hour" sunset lighting with realistic lens flares. AUDIO: South African English Female Voiceover: '${hookLine}'` },
            { scene: 2, location: "interior", visual_prompt: `Continuous slow cinematic push-in interior POV shot of the ${car.make} ${car.model}, already in motion on frame one. ${motionRule} The physical steering wheel is locked firmly on the RIGHT side. The dashboard retains its exact original layout and display style. Soft ambient lighting highlights the exact interior look. AUDIO: South African English Female Voiceover: '${techLine}'` },
            { scene: 3, location: "interior", visual_prompt: `Continuous slow cinematic push-in into the back passenger area of the ${car.make} ${car.model}, already in motion on frame one. ${motionRule} Focus on the spacious legroom perfectly matching the reference image. The cabin interior and the background environment visible through the windows perfectly match the source image. AUDIO: South African English Female Voiceover: '${comfortLine}'` },
            { scene: 4, location: "exterior", visual_prompt: `${presenterDesc} stands confidently next to the exact same ${car.make} ${car.model} in the identical environment as the exterior shot, with an 'EVEREST MOTORING' logo subtly on the wall behind her. Continuous slow cinematic push-in toward her, already in motion on frame one. ${motionRule} She looks directly into the camera with a warm, inviting smile and gestures welcomingly throughout the clip. AUDIO: South African English Female Voiceover: 'Contact Everest Motoring today to book your test drive in this exceptional ${car.make} ${car.model}.'` }
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
You are an expert automotive copywriter specializing in SEO and high-conversion sales copy for Everest Motoring.
Write a brilliant, SEO-optimized, highly attractive sales pitch description for the following vehicle.

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
1. Write 2-3 engaging, persuasive paragraphs. 
2. It MUST be optimized for Google SEO (use relevant keywords implicitly, e.g. "Buy used ${car.make} ${car.model} in South Africa").
3. Important: When mentioning the price, spell out the currency. You MUST write it as "${car.price} South African Rand".
4. Highlight the best features, the pristine condition, and the overall value proposition.
5. If an image is provided in the prompt, scan the photo to determine the exact color of the car and integrate that color naturally into the description.
6. Use all the information provided to write a compelling narrative.
7. CRITICAL: End with a strong, explicit Call to Action aimed at lead generation and sales (e.g., "Contact Everest Motoring today to book your exclusive test drive, or inquire about our tailored finance options!").
8. Do NOT include markdown headers (* or #) or unnecessary formatting. Just return the clean, professional text ready to be displayed on the website.
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

