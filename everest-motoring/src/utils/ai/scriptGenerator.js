import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateVehicleScript(car) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error("Missing GOOGLE_GEMINI_API_KEY in environment variables.");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        // Using gemini-2.5-flash for broader free-tier availability and reasoning
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

Scene Breakdown:
Scene 1: The Hook (Exterior Hero Shot)
- Very slow, subtle cinematic camera push-in with a tiny, almost imperceptible pan. The camera angle stays mostly locked to the reference image but provides a very slight angle change for a premium feel. Do not distort the background geometry.
- Dramatic lighting (e.g., Golden Hour sunset with realistic lens flares or moody showroom lighting).
- The vehicle's front license plate clearly displays the word "EVEREST" in clean lettering.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a catchy 1-sentence hook introducing the make and model]"

Scene 2: The Technology (Dashboard/Cockpit)
- Very slow, subtle cinematic camera push-in on the dashboard. Do not pan left or right. Focus entirely on the area visible in the reference image.
- The steering wheel is locked firmly on the RIGHT side. The dashboard retains its exact original layout and analog/digital display style.
- Soft ambient lighting.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a 1-sentence voiceover explicitly mentioning 1 or 2 of its best technology features]"

Scene 3: The Comfort (Rear Cabin)
- Very slow, subtle cinematic camera push-in on the back seat or passenger area. Do not pan.
- The cabin interior and the exact background environment visible through the windows perfectly match the source image.
- Natural light streaming through the windows emphasizing space.
- CRITICAL AUDIO INSTRUCTION: End this prompt with "AUDIO: South African English Female Voiceover: [Write a 1-sentence voiceover explicitly mentioning its comfort or powertrain features]"

Scene 4: The Closer (Human Presenter)
- A professional, attractive female sales presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an "Everest Motoring" logo on the breast pocket.
- She stands next to the exact same vehicle from Scene 1, in the exact same outdoor or indoor environment as Scene 1. A subtle "EVEREST MOTORING" logo is visible on a wall or structure behind her.
- She looks directly into the camera with a warm, inviting smile, gesturing welcomingly.
- Very slow, subtle cinematic camera push-in. Do not pan or reveal new environments.
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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up markdown code blocks if the LLM wrapped the JSON
        const cleanText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Error generating script with Gemini:", error);

        // Fallback generic script for 4 scenes if Gemini fails or rate limits
        const presenterDesc = "A professional, attractive white female presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an 'Everest Motoring' logo";

        return [
            { scene: 1, location: "exterior", visual_prompt: `Very slow, subtle cinematic push-in shot with a tiny pan of the ${car.year} ${car.make} ${car.model}. Do not change the background geometry. The front license plate features a clean 'EVEREST' logo. Dramatic "Golden Hour" sunset lighting with realistic lens flares. AUDIO: South African English Female Voiceover: 'Introducing the striking ${car.make} ${car.model}.'` },
            { scene: 2, location: "interior", visual_prompt: `Very slow, subtle cinematic push-in interior POV shot of the ${car.make} ${car.model}. Do not pan left or right. The physical steering wheel is locked firmly on the RIGHT side. The dashboard retains its exact original layout and display style. Soft ambient lighting highlights the exact interior look. AUDIO: South African English Female Voiceover: 'Experience unparalleled technology right at your fingertips.'` },
            { scene: 3, location: "interior", visual_prompt: `Very slow, subtle cinematic push-in shot of the back passenger area of the ${car.make} ${car.model}. Do not pan. Focus on the spacious legroom perfectly matching the reference image. The cabin interior and the background environment visible through the windows perfectly match the source image. AUDIO: South African English Female Voiceover: 'Designed for exceptional comfort on every journey.'` },
            { scene: 4, location: "exterior", visual_prompt: `${presenterDesc} stands confidently next to the exact same ${car.make} ${car.model} in the identical environment as the exterior shot, with an 'EVEREST MOTORING' logo subtly on the wall behind her. Very slow, subtle cinematic push-in shot. She looks directly into the camera with a warm, inviting smile and gestures welcomingly. AUDIO: South African English Female Voiceover: 'Contact Everest Motoring today to book your test drive in this exceptional ${car.make} ${car.model}.'` }
        ];
    }
}

export async function optimizeVehicleDescription(car, manualDescription) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        console.warn("[SEO Content] No GEMINI API KEY found. Skipping description optimization.");
        return manualDescription;
    }

    try {
        console.log(`[SEO Content] Starting description optimization for ${car.year} ${car.make} ${car.model}...`);
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        // Using gemini-2.5-flash as it robustly supports multimodal (vision + text) inputs natively.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let imagePart = null;
        if (car.main_image_url) {
            try {
                // Fetch the image from Supabase (or external URL)
                const response = await fetch(car.main_image_url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const base64Image = Buffer.from(arrayBuffer).toString('base64');
                    const mimeType = response.headers.get('content-type') || 'image/jpeg';

                    imagePart = {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    };
                    console.log("[SEO Content] Successfully loaded reference image for color/condition analysis.");
                }
            } catch (imgErr) {
                console.warn("[SEO Content] Could not fetch image for AI optimization:", imgErr.message);
            }
        }

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

        const requestParts = [promptText];
        if (imagePart) {
            requestParts.push(imagePart);
        }

        console.log("[SEO Content] Calling Gemini 1.5 Flash for generation...");
        const result = await model.generateContent(requestParts);
        const finalDescription = result.response.text().trim();
        console.log("[SEO Content] Successfully generated optimized description.");

        return finalDescription;
    } catch (error) {
        console.error("[SEO Content] Error optimizing description with Gemini:", error);
        return manualDescription; // Fallback to raw text
    }
}

