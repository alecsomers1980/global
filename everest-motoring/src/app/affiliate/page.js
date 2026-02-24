import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AffiliateDashboardClient from "./AffiliateDashboardClient";

export const metadata = { title: "Pipeline | Affiliate Portal" };

export default async function AffiliateDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Fetch the affiliate's profile data to get their unique code and bank details
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) return redirect("/login");

    // Fetch all leads attributed to this affiliate
    const { data: leads } = await supabase
        .from('leads')
        .select(`
            id, client_name, client_phone, client_email, status, created_at,
            cars ( make, model, year, price, main_image_url )
        `)
        .eq('affiliate_id', user.id)
        .order('created_at', { ascending: false });

    return <AffiliateDashboardClient profile={profile} leads={leads || []} />;
}
