import { createClient } from "@/utils/supabase/server";
import { inviteClientAction } from "./actions";
import LeadsTable from "./LeadsTable";

export const metadata = {
    title: "Car Inquiries | Everest Admin",
};

export default async function LeadsPage() {
    const supabase = await createClient();

    // Fetch all leads, joining the 'cars' table to see which vehicle they want
    const { data: leads } = await supabase
        .from('leads')
        .select(`
            *,
            cars ( make, model, year, main_image_url, price ),
            profiles:affiliate_id ( first_name, last_name, affiliate_code )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Vehicle Inquiries</h1>
                    <p className="text-slate-500 mt-1">Manage leads generated from individual car listings.</p>
                </div>
            </div>

            <LeadsTable initialLeads={leads || []} />
        </div>
    );
}
