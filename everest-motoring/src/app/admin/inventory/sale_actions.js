"use server";

import * as React from "react";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/resend";
import { Resend } from "resend";
import { PostSaleReviewEmail } from "@/emails/PostSaleReview";
import {
    startSeedanceClip,
    pollSeedanceClip,
    SEEDANCE_STYLE_PROMPTS,
    buildSeedancePrompt,
} from "@/utils/ai/seedanceService";
import { addCongratsVoiceover } from "@/utils/ai/congratsVoiceover";

const REVIEW_DELAY_DAYS = 4;

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    if (!profile || profile.role !== "admin") throw new Error("Admins only");
    return { user };
}

export async function getLeadsForCar(carId) {
    await requireAdmin();
    const admin = await createAdminClient();
    const { data, error } = await admin
        .from("leads")
        .select("id, client_name, client_email, client_phone, status, created_at")
        .eq("car_id", carId)
        .order("created_at", { ascending: false });
    if (error) {
        console.error("getLeadsForCar error:", error);
        return [];
    }
    return data || [];
}

export async function getSaleForCar(carId) {
    await requireAdmin();
    const admin = await createAdminClient();
    const { data } = await admin
        .from("sales")
        .select("*")
        .eq("car_id", carId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    return data;
}

export async function markCarAsSold(formData) {
    try {
        return await markCarAsSoldInner(formData);
    } catch (err) {
        console.error("markCarAsSold unexpected error:", err);
        return { error: `Server error: ${err?.message || String(err)}` };
    }
}

async function markCarAsSoldInner(formData) {
    const { user } = await requireAdmin();
    const admin = await createAdminClient();

    const carId = formData.get("car_id");
    const leadId = formData.get("lead_id") || null;
    const buyerName = formData.get("buyer_name");
    const buyerEmail = formData.get("buyer_email") || null;
    const buyerPhone = formData.get("buyer_phone") || null;
    const buyerBirthday = formData.get("buyer_birthday") || null;
    const notes = formData.get("notes") || null;
    const photoFile = formData.get("delivery_photo");

    if (!carId || !buyerName) {
        return { error: "Vehicle and buyer name are required." };
    }

    // Reject duplicate sale records for the same car
    const { data: existing } = await admin
        .from("sales")
        .select("id")
        .eq("car_id", carId)
        .maybeSingle();
    if (existing) {
        return { error: "This vehicle already has a sale record." };
    }

    const { data: car, error: carErr } = await admin
        .from("cars")
        .select("id, make, model, year, main_image_url")
        .eq("id", carId)
        .single();
    if (carErr || !car) {
        return { error: "Vehicle not found." };
    }

    let deliveryPhotoUrl = null;
    if (photoFile && typeof photoFile === "object" && photoFile.size > 0) {
        const ext = (photoFile.name?.split(".").pop() || "jpg").toLowerCase();
        const fileName = `${carId}-${Date.now()}.${ext}`;
        const { error: upErr } = await admin.storage
            .from("delivery-photos")
            .upload(fileName, photoFile, { upsert: false, contentType: photoFile.type });
        if (upErr) {
            console.error("Delivery photo upload error:", upErr);
            return { error: "Failed to upload delivery photo." };
        }
        const { data: urlData } = admin.storage.from("delivery-photos").getPublicUrl(fileName);
        deliveryPhotoUrl = urlData.publicUrl;
    }

    const sold_at = new Date();
    const scheduledFor = new Date(sold_at.getTime() + REVIEW_DELAY_DAYS * 24 * 60 * 60 * 1000);
    const willEmail = !!buyerEmail;

    const { data: sale, error: saleErr } = await admin
        .from("sales")
        .insert({
            car_id: carId,
            lead_id: leadId,
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            buyer_phone: buyerPhone,
            buyer_birthday: buyerBirthday,
            delivery_photo_url: deliveryPhotoUrl,
            notes,
            sold_at: sold_at.toISOString(),
            review_email_scheduled_for: willEmail ? scheduledFor.toISOString() : null,
            created_by: user.id,
        })
        .select()
        .single();
    if (saleErr) {
        console.error("Sale insert error:", saleErr);
        return { error: "Failed to record sale." };
    }

    const { error: carUpdErr } = await admin
        .from("cars")
        .update({ status: "sold" })
        .eq("id", carId);
    if (carUpdErr) console.error("Car status update error:", carUpdErr);

    if (leadId) {
        await admin.from("leads").update({ status: "closed_won" }).eq("id", leadId);

        // Immediately delete any client-uploaded financial documents for this lead
        const { data: leadDocs } = await admin
            .from("lead_documents")
            .select("id, file_path")
            .eq("lead_id", leadId);

        if (leadDocs && leadDocs.length > 0) {
            const filePaths = leadDocs.map(d => d.file_path);
            
            // 1. Remove physical files from secure vault
            const { error: storageErr } = await admin.storage.from("finance_documents").remove(filePaths);
            if (storageErr) {
                console.error("Privacy cleanup: Failed to delete client docs from storage:", storageErr);
            }

            // 2. Remove tracking records from DB
            const { error: dbDocsErr } = await admin.from("lead_documents").delete().eq("lead_id", leadId);
            if (dbDocsErr) {
                console.error("Privacy cleanup: Failed to delete client doc records from DB:", dbDocsErr);
            } else {
                console.log(`Privacy cleanup: Deleted ${filePaths.length} documents for lead ${leadId}`);
            }
        }
    }

    if (willEmail) {
        const reviewUrl =
            process.env.GOOGLE_REVIEW_URL ||
            "https://www.google.com/search?q=Everest+Motoring+White+River";
        const vehicleModel = `${car.year} ${car.make} ${car.model}`;
        try {
            const result = await sendEmail({
                to: buyerEmail,
                subject: `Congratulations on your ${vehicleModel}`,
                react: React.createElement(PostSaleReviewEmail, {
                    customerName: buyerName,
                    vehicleModel,
                    carImageUrl: car.main_image_url,
                    deliveryPhotoUrl,
                    reviewUrl,
                }),
                scheduledAt: scheduledFor.toISOString(),
            });
            if (result.success && result.data?.id) {
                await admin
                    .from("sales")
                    .update({ review_email_id: result.data.id })
                    .eq("id", sale.id);
            } else if (!result.success) {
                console.warn("Review email scheduling failed (sale still recorded):", result.error);
            }
        } catch (err) {
            console.warn("Review email scheduling threw (sale still recorded):", err);
        }
    }

    revalidatePath("/admin/inventory");
    revalidatePath("/inventory");

    return { success: true };
}

export async function startSaleVideo(saleId, styleKey) {
    await requireAdmin();
    const admin = await createAdminClient();

    const { data: sale, error: saleErr } = await admin
        .from("sales")
        .select("id, buyer_name, delivery_photo_url, car_id, sale_video_status")
        .eq("id", saleId)
        .single();
    if (saleErr || !sale) return { error: "Sale not found." };
    if (sale.sale_video_status === "generating" || sale.sale_video_status === "finalizing") {
        return { error: "A video is already being generated for this sale." };
    }

    // Source image: the delivery photo if provided, otherwise the car's main
    // (first) image. Either way we generate the Pixel Build clip silently and
    // add a congratulations voiceover once it's ready (no on-screen text).
    let imageUrl = sale.delivery_photo_url;
    if (!imageUrl) {
        const { data: car } = await admin
            .from("cars")
            .select("main_image_url")
            .eq("id", sale.car_id)
            .single();
        imageUrl = car?.main_image_url || null;
    }
    if (!imageUrl) {
        return { error: "No delivery photo, and this vehicle has no main image to use." };
    }

    const useStyle = SEEDANCE_STYLE_PROMPTS[styleKey] ? styleKey : "pixel_build";
    const prompt = buildSeedancePrompt(useStyle, { buyerName: sale.buyer_name });

    try {
        const { taskId } = await startSeedanceClip({
            imageUrl,
            prompt,
            durationSeconds: 8,
            aspectRatio: "16:9",
            resolution: "720p",
            generateAudio: false, // congratulations voiceover is muxed on after
        });

        const { error: updErr } = await admin
            .from("sales")
            .update({
                sale_video_style: useStyle,
                sale_video_task_id: taskId,
                sale_video_status: "generating",
                sale_video_url: null,
                sale_video_error: null,
                sale_video_started_at: new Date().toISOString(),
                sale_video_completed_at: null,
            })
            .eq("id", saleId);

        if (updErr) {
            console.error("startSaleVideo DB update failed:", updErr);
            return { error: `DB update failed: ${updErr.message}` };
        }

        return { success: true, taskId };
    } catch (err) {
        console.error("startSaleVideo error:", err);
        await admin
            .from("sales")
            .update({
                sale_video_status: "failed",
                sale_video_error: err.message || "Failed to start generation",
            })
            .eq("id", saleId);
        return { error: err.message || "Failed to start video generation." };
    }
}

export async function pollSaleVideo(saleId) {
    await requireAdmin();
    const admin = await createAdminClient();

    const { data: sale } = await admin
        .from("sales")
        .select("id, car_id, buyer_name, buyer_email, delivery_photo_url, sale_video_task_id, sale_video_status, sale_video_url, review_email_id, review_email_sent_at, review_email_scheduled_for")
        .eq("id", saleId)
        .single();
    if (!sale) return { error: "Sale not found." };
    if (sale.sale_video_status === "ready") {
        return { status: "ready", videoUrl: sale.sale_video_url };
    }
    // The clip is rendered and we're muxing the voiceover — keep the UI waiting.
    if (sale.sale_video_status === "finalizing") {
        return { status: "generating" };
    }
    if (sale.sale_video_status !== "generating" || !sale.sale_video_task_id) {
        return { status: sale.sale_video_status || "none" };
    }

    const result = await pollSeedanceClip(sale.sale_video_task_id);

    if (result.isComplete && result.videoUrl) {
        // Claim finalization first so a concurrent poll doesn't re-mux.
        await admin.from("sales").update({ sale_video_status: "finalizing" }).eq("id", saleId);

        // Add the congratulations voiceover onto the (silent) Pixel Build clip.
        // Best-effort: if it fails, fall back to the silent clip rather than
        // failing the whole sale video.
        let finalUrl = result.videoUrl;
        try {
            const { data: car } = await admin
                .from("cars")
                .select("make, model, year")
                .eq("id", sale.car_id)
                .single();
            const carLabel = car ? `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim() : "vehicle";
            finalUrl = await addCongratsVoiceover(result.videoUrl, {
                fullName: sale.buyer_name,
                carLabel,
                carId: sale.car_id,
            });
        } catch (voErr) {
            console.warn("Congrats voiceover mux failed, using silent clip:", voErr.message);
        }

        await admin
            .from("sales")
            .update({
                sale_video_status: "ready",
                sale_video_url: finalUrl,
                sale_video_completed_at: new Date().toISOString(),
            })
            .eq("id", saleId);

        // If a review email is still scheduled (not yet sent), cancel + re-schedule with the video.
        if (sale.review_email_id && !sale.review_email_sent_at && sale.review_email_scheduled_for && sale.buyer_email) {
            const scheduledFor = new Date(sale.review_email_scheduled_for);
            if (scheduledFor.getTime() > Date.now() + 60_000) {
                await rescheduleReviewEmailWithVideo({
                    saleId,
                    oldEmailId: sale.review_email_id,
                    buyerEmail: sale.buyer_email,
                    buyerName: sale.buyer_name,
                    carId: sale.car_id,
                    deliveryPhotoUrl: sale.delivery_photo_url,
                    videoUrl: finalUrl,
                    scheduledFor,
                });
            }
        }

        revalidatePath("/admin/inventory");
        return { status: "ready", videoUrl: finalUrl };
    }

    if (result.error) {
        await admin
            .from("sales")
            .update({
                sale_video_status: "failed",
                sale_video_error: result.error,
            })
            .eq("id", saleId);
        return { status: "failed", error: result.error };
    }

    return { status: "generating" };
}

async function rescheduleReviewEmailWithVideo({ saleId, oldEmailId, buyerEmail, buyerName, carId, deliveryPhotoUrl, videoUrl, scheduledFor }) {
    const admin = await createAdminClient();

    // Cancel the old scheduled email — Resend doesn't allow content updates on scheduled mail.
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.cancel(oldEmailId);
    } catch (err) {
        console.warn("Failed to cancel previous review email (continuing to schedule new):", err);
    }

    const { data: car } = await admin
        .from("cars")
        .select("make, model, year, main_image_url")
        .eq("id", carId)
        .single();
    const vehicleModel = car ? `${car.year} ${car.make} ${car.model}` : "your new vehicle";
    const reviewUrl =
        process.env.GOOGLE_REVIEW_URL ||
        "https://www.google.com/search?q=Everest+Motoring+White+River";

    const result = await sendEmail({
        to: buyerEmail,
        subject: `Congratulations on your ${vehicleModel}`,
        react: React.createElement(PostSaleReviewEmail, {
            customerName: buyerName,
            vehicleModel,
            carImageUrl: car?.main_image_url,
            deliveryPhotoUrl,
            videoUrl,
            reviewUrl,
        }),
        scheduledAt: scheduledFor.toISOString(),
    });

    if (result.success && result.data?.id) {
        await admin
            .from("sales")
            .update({ review_email_id: result.data.id })
            .eq("id", saleId);
    } else if (!result.success) {
        console.warn("Re-schedule with video failed:", result.error);
    }
}
