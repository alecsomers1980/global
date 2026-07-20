import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type SiteSettings = {
  popupEnabled: boolean;
  popupImage: string;
  popupAlt: string;
  popupLink: string;
};

const DEFAULTS: SiteSettings = {
  popupEnabled: false,
  popupImage: "/images/popup.jpeg",
  popupAlt: "",
  popupLink: "",
};

/** Site-wide settings (single row). Degrades to defaults if unset/unavailable. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return DEFAULTS;
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("popup_enabled, popup_image, popup_alt, popup_link")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULTS;

  return {
    popupEnabled: data.popup_enabled ?? false,
    popupImage: data.popup_image || DEFAULTS.popupImage,
    popupAlt: data.popup_alt ?? "",
    popupLink: data.popup_link ?? "",
  };
});
