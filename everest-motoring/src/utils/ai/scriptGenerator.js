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
2. Provide highly detailed visual descriptions of the camera movement, lighting, and environment.

Scene Breakdown:
Scene 1: The Hook (Exterior Hero Shot)
- Cinematic tracking shot, smooth glide from front bumper to side profile.
- Dramatic lighting (e.g., Golden Hour sunset with realistic lens flares or moody showroom lighting).
- Describe high-energy cuts showing the car's silhouette.

Scene 2: The Technology (Dashboard/Cockpit)
- Interior cinematic POV shot.
- Slow pan across the dashboard, focusing on digital displays, premium stitching, or center console. **CRITICAL: This is a South African vehicle, which means it is Right-Hand Drive (RHD). The steering wheel must be on the right side of the car.**
- Soft ambient lighting.

Scene 3: The Comfort (Rear Cabin)
- Slow push-in to the back seat or passenger area.
- Focus on legroom, seat texture, and comfort.
- Natural light streaming through the windows emphasizing space.

Scene 4: The Closer (Human Presenter)
- A professional, attractive female sales presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an "Everest Motoring" logo on the breast pocket.
- She stands next to the car in a sleek modern "Everest Motoring" premium showroom setup with polished concrete floors and large brushed-metal "EVEREST MOTORING" sign.
- She looks directly into the camera with a warm, inviting smile, gesturing welcomingly.
- Camera slowly pushes in for an intimate close-up.

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
            { scene: 1, location: "exterior", visual_prompt: `Cinematic 4K tracking shot of the ${car.year} ${car.make} ${car.model}. The camera starts low at the front bumper and smoothly glides to a side profile. Dramatic "Golden Hour" sunset lighting with realistic lens flares and high-energy cuts showing the car's silhouette.` },
            { scene: 2, location: "interior", visual_prompt: `Interior cinematic POV shot of the ${car.make} ${car.model}. The camera slowly pans across the dashboard, focusing on the high-tech digital displays and premium stitching. CRITICAL: This is a Right-Hand Drive (RHD) car. Soft ambient lighting highlights the interior luxury.` },
            { scene: 3, location: "interior", visual_prompt: `Cinematic slow push-in to the back passenger area of the ${car.make} ${car.model}. Focus on the spacious legroom and premium seat texture. Natural light streams through the windows emphasizing comfort and space.` },
            { scene: 4, location: "exterior", visual_prompt: `${presenterDesc} stands confidently next to the ${car.make} ${car.model} in a sleek modern 'Everest Motoring' showroom. She looks directly into the camera with a warm, inviting smile and gestures welcomingly. Cinematic camera slowly pushes in towards her for an intimate close-up.` }
        ];
    }
}

export async function optimizeVehicleDescription(car, manualDescription) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return manualDescription;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        // Using gemini-1.5-flash as it robustly supports multimodal (vision + text) inputs natively.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
                }
            } catch (imgErr) {
                console.warn("Could not fetch image for AI optimization:", imgErr);
            }
        }

        const promptText = `
You are an expert automotive copywriter specializing in SEO and high-conversion sales copy for Everest Motoring.
Write a short, punchy, and highly attractive description for the following vehicle.

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
1. Keep it concise but persuasive (2-3 short paragraphs max).
2. It must be optimized for Google SEO (use relevant keywords implicitly).
3. Important: When mentioning the price, spell out the currency. For example, do not write "R 800,000", you MUST write it as "800,000 South African Rand".
4. Highlight the best features, the condition, and the overall value proposition.
5. If an image is provided in the prompt, scan the photo to determine the exact color of the car and integrate that color naturally into the description.
6. Use all the information provided, from the make to the features to the extra/unique features, to write a compelling narrative.
7. End with a strong Call to Action to book a test drive or inquire for finance.
8. Do not include markdown headers or unnecessary formatting. Just return the clean text ready to be displayed on the website.
`;

        const requestParts = [promptText];
        if (imagePart) {
            requestParts.push(imagePart);
        }

        const result = await model.generateContent(requestParts);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error optimizing description with Gemini:", error);
        return manualDescription; // Fallback to raw text
    }
}

