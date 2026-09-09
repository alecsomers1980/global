import * as React from "react";
import { createAdminClient } from "@/utils/supabase/server";
import { sendEmail } from "@/lib/resend";
import { AffiliateMediaKit } from "@/emails/AffiliateMediaKit";
import { buildAffiliateVehiclePayload } from "@/utils/affiliate/mediaKit";

/**
 * Emails every approved affiliate their personalised media kit for a car.
 * Shared core used by both the /api/affiliate/notify-approved webhook (an
 * external caller, kept for compatibility) and the direct in-process call
 * from postApprovedVideoPosts — the moment Everest's own walkaround
 * approval succeeds, which is now the sole trigger for this.
 */
export async function notifyApprovedAffiliates(carId) {
  const supabase = await createAdminClient();

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("id", carId)
    .maybeSingle();

  if (!car) {
    return { success: false, error: "Car not found", notified: 0 };
  }

  const { data: affiliates, error: affiliatesError } = await supabase
    .from("profiles")
    .select("id, first_name, email, affiliate_code")
    .eq("role", "affiliate")
    .eq("is_approved", true)
    .not("affiliate_code", "is", null);

  if (affiliatesError) {
    return { success: false, error: affiliatesError.message, notified: 0 };
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
        console.warn(`notifyApprovedAffiliates: send failed for affiliate ${affiliate.id}:`, result.error);
      }
    } catch (err) {
      console.warn(`notifyApprovedAffiliates: send threw for affiliate ${affiliate.id}:`, err.message);
    }
  }

  return { success: true, notified };
}
