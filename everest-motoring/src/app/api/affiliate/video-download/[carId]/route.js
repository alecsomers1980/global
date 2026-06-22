import { createAdminClient } from "@/utils/supabase/server";
import { enableDownloads, getMp4Url } from "@/utils/ai/cloudflareStreamService";

export async function GET(request, { params }) {
    const { carId } = await params;
    const { searchParams } = new URL(request.url);
    const wantsRedirect = searchParams.get("redirect") === "1";

    const supabase = await createAdminClient();
    const { data: car, error } = await supabase
        .from("cars")
        .select("id, video_url")
        .eq("id", carId)
        .single();

    if (error || !car) {
        return wantsRedirect
            ? new Response("Car not found", { status: 404 })
            : Response.json({ ready: false, error: "Car not found" }, { status: 404 });
    }

    if (typeof car.video_url !== "string" || !car.video_url.startsWith("cf:")) {
        const message = "No video available for this vehicle yet";
        return wantsRedirect
            ? new Response(message, { status: 404 })
            : Response.json({ ready: false, error: message });
    }

    const uid = car.video_url.slice(3);

    try {
        await enableDownloads(uid);
        const mp4Url = getMp4Url(uid);
        return wantsRedirect ? Response.redirect(mp4Url, 302) : Response.json({ ready: true, url: mp4Url });
    } catch (err) {
        return wantsRedirect
            ? new Response(`Video not ready: ${err.message}`, { status: 500 })
            : Response.json({ ready: false, error: err.message }, { status: 500 });
    }
}
