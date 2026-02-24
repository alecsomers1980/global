import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateVehicleScript(car) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        throw new Error("Missing GOOGLE_GEMINI_API_KEY in environment variables.");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        // Using gemini-1.5-flash for broader free-tier availability
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an expert cinematic Creative Director specializing in luxury automotive car commercials.
Write an intelligent, 3-scene visual prompt script for an AI Image-to-Video generator (like Sora or Veo) based on the following vehicle.

Vehicle Details:
Make: ${car.make}
Model: ${car.model}
Year: ${car.year}
Price: R ${new Intl.NumberFormat('en-ZA').format(car.price)}
Mileage: ${car.mileage} km
Transmission: ${car.transmission || 'Unknown'}
Fuel Type: ${car.fuel_type || 'Unknown'}
Features: ${car.features && car.features.length > 0 ? car.features.join(', ') : 'Standard features'}

Strict Instructions for the script:
1. You must write exactly THREE scene descriptions. Each scene is an 8-second video clip.

2. **AVATAR CONSISTENCY (CRITICAL):** Every single scene MUST feature the EXACT SAME presenter — a professional, attractive white female with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse, with an "Everest Motoring" logo embroidered on the blazer's breast pocket. She has light makeup, a warm confident smile, and looks approximately 30 years old. You MUST repeat this EXACT description of her appearance in EVERY scene prompt to ensure the AI generates the same person each time.

3. **BACKGROUND CONSISTENCY (CRITICAL):** ALL THREE scenes must take place in the EXACT SAME environment — a sleek, modern "Everest Motoring" premium showroom with polished concrete floors, floor-to-ceiling glass windows letting in natural daylight, soft overhead spotlights on the car, and a large brushed-metal "EVEREST MOTORING" sign on the back wall. You MUST repeat this EXACT environment description in EVERY scene prompt to maintain visual continuity.

4. The prompt MUST describe both the presenter's actions and the camera movement (e.g., "Presenter smiles and gestures to the sleek exterior as the camera slowly pans right...").

5. Scene 1 (Exterior Reveal): The presenter stands next to the car in the showroom. She gestures towards the vehicle with enthusiasm. The camera moves smoothly from a front view to a side profile view of the car.

6. Scene 2 (Interior Showcase): The presenter sits inside the cabin, speaking directly to the camera while pointing out the luxurious features, steering wheel, dashboard, and technology.

7. Scene 3 (Conversion CTA): The presenter steps out of the car and stands next to it in the showroom, looking directly into the camera with a warm, inviting smile. She gestures welcomingly as if personally inviting the viewer to visit. The mood is persuasive and exciting — she is clearly closing a sale. The camera slowly pushes in towards her face for an intimate, trust-building close-up. The "EVEREST MOTORING" sign is prominently visible behind her, along with contact details or a subtle "Book Your Test Drive" graphic overlay suggestion.

8. Format Requirement: Return ONLY a valid JSON array of objects with keys: scene, location, and visual_prompt. Do not include markdown formatting outside the JSON array.

Example Output:
[
  { "scene": 1, "location": "exterior", "visual_prompt": "A professional, attractive white female presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an 'Everest Motoring' logo on the breast pocket, stands confidently next to the car inside a sleek modern 'Everest Motoring' showroom with polished concrete floors, floor-to-ceiling glass windows, soft spotlights, and a large brushed-metal 'EVEREST MOTORING' sign on the back wall. She smiles warmly and gestures towards the vehicle. Smooth cinematic camera movement starts from a front view and sweeps to a side profile view, 8k resolution." },
  { "scene": 2, "location": "interior", "visual_prompt": "The same professional white female presenter with shoulder-length blonde hair in the navy blazer and white blouse sits in the driver's seat, talking directly to the camera while pointing out the luxurious interior features, dashboard, and steering wheel. The showroom's natural light streams through the glass windows behind the car." },
  { "scene": 3, "location": "exterior", "visual_prompt": "The same professional white female presenter with shoulder-length blonde hair in the navy blazer and white blouse steps out of the car and stands next to it in the Everest Motoring showroom. She looks directly into the camera with a warm, inviting smile and gestures welcomingly, as if personally inviting the viewer to visit. The camera slowly pushes in towards her for an intimate close-up. The large 'EVEREST MOTORING' sign is prominently visible on the wall behind her." }
]
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up markdown code blocks if the LLM wrapped the JSON
        const cleanText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Error generating script with Gemini:", error);

        // Fallback generic script if Gemini fails or rate limits
        const avatarDesc = "A professional, attractive white female presenter with shoulder-length blonde hair, wearing a tailored navy blue blazer over a white blouse with an 'Everest Motoring' logo on the breast pocket";
        const showroomDesc = "inside a sleek modern 'Everest Motoring' showroom with polished concrete floors, floor-to-ceiling glass windows, soft spotlights, and a large brushed-metal 'EVEREST MOTORING' sign on the back wall";
        return [
            { scene: 1, location: "exterior", visual_prompt: `${avatarDesc} stands confidently next to the ${car.year} ${car.make} ${car.model} ${showroomDesc}. She smiles warmly and gestures towards the vehicle. The camera moves smoothly from a front view to a side profile view of the car, 8k cinematic quality.` },
            { scene: 2, location: "interior", visual_prompt: `${avatarDesc} sits in the driver's seat of the ${car.make} ${car.model}, talking directly to the camera while highlighting the luxurious interior features, steering wheel, and dashboard. Natural showroom light streams through the glass windows.` },
            { scene: 3, location: "exterior", visual_prompt: `${avatarDesc} steps out of the ${car.make} ${car.model} and stands next to it ${showroomDesc}. She looks directly into the camera with a warm inviting smile and gestures welcomingly, personally inviting the viewer to visit. The camera slowly pushes in towards her for an intimate trust-building close-up. The 'EVEREST MOTORING' sign is prominently visible behind her.` }
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

