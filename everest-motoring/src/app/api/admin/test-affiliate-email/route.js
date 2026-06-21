import * as React from "react";
import { createAdminClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/resend";
import { AffiliateMediaKit } from "@/emails/AffiliateMediaKit";

export async function GET() {
    const supabase = await createAdminClient();

    const { data: car, error } = await supabase
        .from("cars")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !car) {
        return Response.json({ success: false, error: error || "No available car found" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";
    const trackingLink = `${siteUrl}/inventory/${car.id}?ref=TEST123`;
    const mediaKitUrl = `${siteUrl}/affiliate/media/${car.id}`;

    const vehicle = {
        make: car.make,
        model: car.model,
        year: car.year,
        price: `R ${new Intl.NumberFormat("en-ZA").format(car.price)}`,
        mileage: car.mileage ? `${new Intl.NumberFormat("en-ZA").format(car.mileage)} km` : null,
        transmission: car.transmission,
        fuelType: car.fuel_type,
        colour: car.colour,
        features: car.features || [],
        image: car.main_image_url,
        mediaKitUrl,
        trackingLink,
    };

    const result = await sendEmail({
        to: "alec@firewireit.co.za",
        subject: `[TEST] New Media Kit: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        react: React.createElement(AffiliateMediaKit, { vehicle, affiliateName: "Alec (Test)" }),
    });

    return Response.json({ success: result.success, car: { id: car.id, make: car.make, model: car.model }, result });
}
