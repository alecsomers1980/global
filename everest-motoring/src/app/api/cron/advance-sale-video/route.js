// This route handles Vercel cron calls (every minute) to finalize sale videos that are stuck in "generating",
// ensuring that closing the admin dialog doesn't block video completion. It polls Seedance, adds a congrats voiceover,
// and marks the sale video as ready.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { pollSeedanceClip } from "@/utils/ai/seedanceService";
import { addCongratsVoiceover } from "@/utils/ai/congratsVoiceover";
import { postSoldVideoToEmber } from "@/app/admin/inventory/socialAction";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return (request.headers.get("authorization") || "") === "Bearer " + secret;
}

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await createAdminClient();

    // Find the oldest sale still generating a video
    const { data: sale } = await admin
      .from("sales")
      .select("id, car_id, buyer_name, sale_video_task_id, sale_video_status")
      .eq("sale_video_status", "generating")
      .not("sale_video_task_id", "is", null)
      .order("sale_video_started_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!sale) {
      return NextResponse.json({ idle: true });
    }

    // Poll the remote clip generation service
    const poll = await pollSeedanceClip(sale.sale_video_task_id);

    if (poll.isComplete && poll.videoUrl) {
      // Mark as finalizing to prevent duplicate processing
      await admin
        .from("sales")
        .update({ sale_video_status: "finalizing" })
        .eq("id", sale.id);

      let finalUrl = poll.videoUrl;
      try {
        // Get car details for the voiceover label
        const { data: car } = await admin
          .from("cars")
          .select("make, model, year")
          .eq("id", sale.car_id)
          .single();

        const carLabel = car
          ? `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim() || "vehicle"
          : "vehicle";

        finalUrl = await addCongratsVoiceover(poll.videoUrl, {
          fullName: sale.buyer_name,
          carLabel,
          carId: sale.car_id,
        });
      } catch (e) {
        console.warn(
          "[advance-sale-video] voiceover mux failed, using silent clip:",
          e.message
        );
      }

      // Finalize: store the video URL and move to ready
      await admin
        .from("sales")
        .update({
          sale_video_status: "ready",
          sale_video_url: finalUrl,
          sale_video_completed_at: new Date().toISOString(),
        })
        .eq("id", sale.id);

      // Queue the celebration video to Everest's social pages (pending approval
      // in ember-social), scheduled for the morning of the review-email day.
      await postSoldVideoToEmber(sale.id);

      return NextResponse.json({ finalized: sale.id });
    }

    if (poll.error) {
      // Record the failure reason
      await admin
        .from("sales")
        .update({
          sale_video_status: "failed",
          sale_video_error: poll.error,
        })
        .eq("id", sale.id);

      return NextResponse.json({ failed: sale.id, error: poll.error });
    }

    // Still generating
    return NextResponse.json({ pending: sale.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
