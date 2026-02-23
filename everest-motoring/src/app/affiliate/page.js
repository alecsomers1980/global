import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Pipeline | Affiliate Portal" };

export default async function AffiliateDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/login");

    // Fetch the affiliate's profile data to get their unique code
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

    // Calculate funnel metrics
    const totalLeads = leads?.length || 0;
    const pendingDeals = leads?.filter(l => ['contacted', 'finance_pending'].includes(l.status)).length || 0;
    const closedWon = leads?.filter(l => l.status === 'closed_won').length || 0;

    // Estimate potential pipeline value (assuming 1% commission for visual purposes. You can adjust this logic later)
    const pipelineValue = leads?.reduce((sum, currentLead) => {
        if (['new', 'contacted', 'finance_pending'].includes(currentLead.status) && currentLead.cars?.price) {
            return sum + (currentLead.cars.price * 0.01);
        }
        return sum;
    }, 0) || 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Pipeline</h1>
                    <p className="text-slate-500 mt-1">Track your referred leads and potential commissions.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Code:</span>
                    <span className="text-lg font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded border border-amber-100">{profile.affiliate_code || 'PENDING'}</span>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Referrals</p>
                    <span className="text-3xl font-bold text-slate-900">{totalLeads}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-500">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Deals</p>
                    <span className="text-3xl font-bold text-slate-900">{pendingDeals}</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-green-500 bg-green-50/30">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Closed Won</p>
                    <span className="text-3xl font-bold text-green-700">{closedWon}</span>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl shadow-md border-t-4 border-t-indigo-500 relative overflow-hidden">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Est. Pipeline Value</p>
                    <span className="text-3xl font-bold text-white relative z-10">R {new Intl.NumberFormat('en-ZA').format(pipelineValue)}</span>
                    <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-6xl text-white/10 rotate-12">account_balance_wallet</span>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Recent Referrals</h2>
                </div>

                {leads && leads.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-bold">Client Name</th>
                                    <th className="p-4 font-bold">Vehicle of Interest</th>
                                    <th className="p-4 font-bold">Date Referred</th>
                                    <th className="p-4 font-bold">Deal Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{lead.client_name}</p>
                                            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-[16px]">call</span>
                                                {lead.client_phone}
                                            </p>
                                            {lead.client_email && (
                                                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                                    <span className="material-symbols-outlined text-[16px]">mail</span>
                                                    {lead.client_email}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {lead.cars ? (
                                                <div className="flex items-center gap-3">
                                                    {lead.cars.main_image_url && (
                                                        <img src={lead.cars.main_image_url} className="w-10 h-10 object-cover rounded shadow-sm border border-slate-200" alt="Car" />
                                                    )}
                                                    <div>
                                                        <span className="font-bold text-slate-800 block text-sm">
                                                            {lead.cars.year} {lead.cars.make} {lead.cars.model}
                                                        </span>
                                                        <p className="text-xs text-slate-500 font-medium">R {new Intl.NumberFormat('en-ZA').format(lead.cars.price)}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">Vehicle removed</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(lead.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase rounded-md ${lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                                                    lead.status === 'finance_pending' ? 'bg-purple-100 text-purple-700' :
                                                        lead.status === 'closed_won' ? 'bg-green-100 text-green-700' :
                                                            'bg-slate-200 text-slate-600'
                                                }`}>
                                                {lead.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">group_add</span>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Referrals Yet</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            Generate a tracking link from the Link Generator tab and share it with your network to start earning commissions.
                        </p>
                        <a href="/affiliate/links" className="mt-6 inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                            Go to Link Generator
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
