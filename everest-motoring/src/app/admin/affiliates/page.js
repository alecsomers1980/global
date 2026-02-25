import { createClient, createAdminClient } from "@/utils/supabase/server";
import AffiliateApprovalToggle from "./AffiliateApprovalToggle";
import AffiliateTopActions from "./AffiliateTopActions";

export const metadata = { title: "Affiliate Manager | Everest Admin" };

export default async function AdminAffiliatesPage() {
    const supabase = await createAdminClient();

    // 1. Fetch all profiles with the 'affiliate' role
    const { data: affiliates } = await supabase
        .from('profiles')
        .select('*, is_approved')
        .eq('role', 'affiliate')
        .order('created_at', { ascending: false });

    // 2. Fetch ALL leads to calculate organic metrics for each affiliate
    const { data: leads } = await supabase
        .from('leads')
        .select('id, affiliate_id, status, cars(price)');

    // 3. Aggregate metrics per affiliate
    const affiliateMetrics = affiliates?.map(affiliate => {
        const affiliateLeads = leads?.filter(l => l.affiliate_id === affiliate.id) || [];

        const totalLeads = affiliateLeads.length;
        const closedWon = affiliateLeads.filter(l => l.status === 'closed_won').length;

        // Estimated pending commissions (Flat R1000 per potential sale)
        const estPending = affiliateLeads.reduce((sum, lead) => {
            if (['new', 'contacted', 'finance_pending'].includes(lead.status)) {
                return sum + 1000;
            }
            return sum;
        }, 0);

        return { ...affiliate, totalLeads, closedWon, estPending };
    }) || [];

    const networkTotalLeads = leads?.filter(l => l.affiliate_id !== null).length || 0;
    const networkClosedWon = leads?.filter(l => l.affiliate_id !== null && l.status === 'closed_won').length || 0;

    return (
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Affiliate Network Management</h1>
                    <p className="text-slate-500 mt-1">Monitor your referral network performance and pipeline velocity.</p>
                </div>
                <AffiliateTopActions affiliates={affiliateMetrics} />
            </div>

            {/* Network Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Affiliates</p>
                            <span className="text-3xl font-bold text-slate-900">{affiliates?.length || 0}</span>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-amber-500/20">group</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Network Leads</p>
                            <span className="text-3xl font-bold text-slate-900">{networkTotalLeads}</span>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-blue-500/20">trending_up</span>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl shadow-md border-t-4 border-t-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Network Closed Deals</p>
                            <span className="text-3xl font-bold text-white">{networkClosedWon}</span>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-green-500/20">handshake</span>
                    </div>
                </div>
            </div>

            {/* Affiliates Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Registered Affiliates</h2>
                </div>

                {affiliates && affiliates.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-bold">Salesperson</th>
                                    <th className="p-4 font-bold">Contact</th>
                                    <th className="p-4 font-bold text-center">Tracking Code</th>
                                    <th className="p-4 font-bold text-center">Total Leads</th>
                                    <th className="p-4 font-bold text-center">Closed Won</th>
                                    <th className="p-4 font-bold text-right">Pending Commissions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {affiliateMetrics.map((aff) => (
                                    <tr key={aff.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900 text-lg">{aff.first_name} {aff.last_name}</p>
                                            <p className="text-xs text-slate-500">Joined {new Date(aff.created_at).toLocaleDateString('en-ZA')}</p>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">phone</span>{aff.phone}</span>
                                                <AffiliateApprovalToggle affiliate={aff} />
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-bold tracking-widest uppercase border border-amber-200 rounded">
                                                {aff.affiliate_code || 'NONE'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold">
                                                {aff.totalLeads}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700 font-bold">
                                                {aff.closedWon}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-800 text-lg">
                                            R {new Intl.NumberFormat('en-ZA').format(aff.estPending)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">group_off</span>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Affiliates Found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Share the application link (<span className="block mt-1 font-mono text-xs bg-slate-100 p-1 rounded">/register</span>) with external salespeople to grow your network.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
