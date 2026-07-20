import { createClient } from "@/lib/supabase/server";
import PopupSettingsForm from "@/components/admin/PopupSettingsForm";

export const dynamic = "force-dynamic";

type SettingsRow = {
  popup_enabled: boolean;
  popup_image: string | null;
  popup_alt: string | null;
  popup_link: string | null;
};

export default async function AdminPopupPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("popup_enabled, popup_image, popup_alt, popup_link")
    .eq("id", 1)
    .maybeSingle<SettingsRow>();

  return (
    <PopupSettingsForm
      initial={{
        popup_enabled: data?.popup_enabled ?? true,
        popup_image: data?.popup_image ?? "/images/popup.jpeg",
        popup_alt: data?.popup_alt ?? "",
        popup_link: data?.popup_link ?? "",
      }}
    />
  );
}
