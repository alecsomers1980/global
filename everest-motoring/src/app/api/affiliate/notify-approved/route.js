import * as React from "react";
import { createAdminClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/resend";
import { AffiliateMediaKit } from "@/emails/AffiliateMediaKit";
import { buildAffiliateVehiclePayload } from "@/utils/affiliate/mediaKit";

/**
 * This is called by Ember Social the moment a car's full walkthrough post is approved there,
 * and it emails every approved affiliate their personalised media kit for that car.
 */
export async function POST(req) {
  const secret = process.env.AFFILIATE_NOTIFY_SECRET;
  const authorization = req.headers.get("authorization") || "";

  if (!secret || authorization !== `Bearer ${secret}`) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { carId } = await req.json();

  if (!carId) {
    return Response.json({ success: false, error: "carId is required" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", carId)
    .maybeSingle();

  if (!car) {
    return Response.json({ success: false, error: "Car not found" }, { status: 404 });
  }

  const { data: affiliates, error: affiliatesError } = await supabase
    .from("profiles")
    .select("id, first_name, email, affiliate_code")
    .eq("role", "affiliate")
    .eq("is_approved", true)
    .not("affiliate_code", "is", null);

  if (affiliatesError) {
    return Response.json({ success: false, error: affiliatesError.message }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://everestmotoring.co.za";
  let notified = 0;

  for (const affiliate of affiliates || []) {
    const vehicle = buildAffiliateVehiclePayload(car, affiliate.affiliate_code, siteUrl);

    try {
      const result = await sendEmail({
        to: affiliate.email,
        subject: `New Media Kit: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        react: React.createElement(AffiliateMediaKit, {
          vehicle,
          affiliateName: affiliate.first_name || "Partner",
        }),
      });

      if (result.success) {
        notified += 1;
      } else {
        console.warn(`Failed to notify affiliate ${affiliate.id}: ${result.error}`);
      }
    } catch (err) {
      console.warn(`Failed to notify affiliate ${affiliate.id}: ${err.message}`);
    }
  }

  return Response.json({ success: true, notified });
}
