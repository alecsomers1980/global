import { createAdminClient } from "@/utils/supabase/server";
import { enableDownloads, getMp4Url } from "@/utils/ai/cloudflareStreamService";

export async function GET(request, { params }) {
    const { carId } = await params;

    const supabase = await createAdminClient();
    const { data: car, error } = await supabase
        .from("cars")
        .select("id, video_url")
        .eq("id", carId)
        .single();

    if (error || !car) {
        return Response.json({ ready: false, error: "Car not found" }, { status: 404 });
    }

    if (typeof car.video_url !== "string" || !car.video_url.startsWith("cf:")) {
        return Response.json({ ready: false, error: "No video available for this vehicle yet" });
    }

    const uid = car.video_url.slice(3);

    try {
        await enableDownloads(uid);
        return Response.json({ ready: true, url: getMp4Url(uid) });
    } catch (err) {
        return Response.json({ ready: false, error: err.message }, { status: 500 });
    }
}
