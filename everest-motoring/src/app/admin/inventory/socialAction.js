"use server";

export async function createSocialPost(car) {
    const apiKey = process.env.EMBER_SOCIAL_API_KEY;
    if (!apiKey) {
        return { success: false, error: "EMBER_SOCIAL_API_KEY is not configured." };
    }

    const priceFormatted = new Intl.NumberFormat('en-ZA').format(car.price);
    const content = `New Arrival! 🚗💨\n\n${car.year} ${car.make} ${car.model}\nPrice: R ${priceFormatted}\n${car.mileage ? `Mileage: ${car.mileage} km\n` : ''}\n${car.description || ""}`;

    const media_urls = [];
    if (car.video_url && !car.video_url.startsWith('ai_') && !car.video_url.startsWith('mux_') && !car.video_url.startsWith('error')) {
        media_urls.push(car.video_url); 
    }
    if (car.main_image_url) {
        media_urls.push(car.main_image_url);
    }
    
    const payload = {
        content,
        media_urls,
        platforms: ['facebook', 'instagram', 'youtube'] 
    };

    try {
        const apiUrl = process.env.EMBER_SOCIAL_URL || "http://localhost:3000"; 
        const response = await fetch(`${apiUrl}/api/trigger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || response.statusText);
        }

        const data = await response.json();
        return { success: true, postId: data.post_id };
    } catch (error) {
        console.error("Error posting to Ember Social:", error);
        return { success: false, error: error.message };
    }
}
