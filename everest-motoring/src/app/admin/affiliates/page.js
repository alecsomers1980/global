import { createAdminClient } from "@/utils/supabase/server";
import AffiliateRow from "./AffiliateRow";
import AffiliateTopActions from "./AffiliateTopActions";

export const metadata = { title: "Affiliate Network Manager | Everest Admin" };

export default async function AdminAffiliatesPage() {
    const supabase = await createAdminClient();

    // 1. Fetch all affiliate profiles
    const { data: affiliates } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'affiliate')
        .order('created_at', { ascending: false });

    // 2. Fetch ALL leads (with car + client info) to compute metrics
    const { data: leads } = await supabase
        .from('leads')
        .select('id, affiliate_id, client_name, status, created_at, cars(year, make, model, price)');

    // 3. Build metrics + attach leads per affiliate
    const affiliateMetrics = (affiliates || []).map(affiliate => {
        const affiliateLeads = (leads || []).filter(l => l.affiliate_id === affiliate.id);
        const totalLeads = affiliateLeads.length;
        const closedWon = affiliateLeads.filter(l => l.status === 'closed_won').length;
        const estPending = affiliateLeads.reduce((sum, lead) => {
            if (['new', 'contacted', 'finance_pending'].includes(lead.status)) return sum + 1000;
            return sum;
        }, 0);
        return { ...affiliate, totalLeads, closedWon, estPending, leads: affiliateLeads };
    });

    // 4. Split into pending vs active
    const pendingAffiliates = affiliateMetrics.filter(a => !a.is_approved);
    const activeAffiliates = affiliateMetrics.filter(a => a.is_approved === true);

    // 5. Network summary stats
    const networkLeads = (leads || []).filter(l => l.affiliate_id !== null);
    const networkTotalLeads = networkLeads.length;
    const networkClosedWon = networkLeads.filter(l => l.status === 'closed_won').length;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-12 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-black">Affiliate <span className="italic">Network</span></h1>
                    <p className="text-slate-500 mt-2 font-medium tracking-wide">Monitor your referral network, approve applications, and track pipeline velocity.</p>
                </div>
                <AffiliateTopActions affiliates={affiliateMetrics} />
            </div>

            {/* ── Network Overview Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Affiliates</p>
                    <span className="text-4xl font-black text-slate-900">{affiliates?.length || 0}</span>
                </div>
                <div className={`p-6 rounded-2xl border shadow-sm ${pendingAffiliates.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${pendingAffiliates.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Pending Approval</p>
                    <span className={`text-4xl font-black ${pendingAffiliates.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{pendingAffiliates.length}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-primary border-t-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Network Leads</p>
                    <span className="text-4xl font-black text-slate-900">{networkTotalLeads}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-green-500 border-t-4">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">Network Closed</p>
                    <span className="text-4xl font-black text-slate-900">{networkClosedWon}</span>
                </div>
            </div>

            {/* ── Section: Pending Approval ── */}
            {pendingAffiliates.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-lg font-bold text-slate-800">Pending Approval</h2>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
                            {pendingAffiliates.length}
                        </span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <AffiliatesTable affiliates={pendingAffiliates} allLeads={leads || []} isPending />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Section: Active Affiliates ── */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-lg font-bold text-slate-800">Registered & Active Affiliates</h2>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
                        {activeAffiliates.length}
                    </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {activeAffiliates.length > 0 ? (
                        <div className="overflow-x-auto">
                            <AffiliatesTable affiliates={activeAffiliates} allLeads={leads || []} />
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">group_off</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Affiliates Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Approve pending applications above, or invite new affiliates to grow your network.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Shared table shell (server component, passes rows to client AffiliateRow) ──
function AffiliatesTable({ affiliates, allLeads, isPending = false }) {
    return (
        <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] bg-slate-50">
                    <th className="p-6 font-black">Salesperson</th>
                    <th className="p-6 font-black">Phone</th>
                    <th className="p-6 font-black text-center">Tracking Code</th>
                    <th className="p-6 font-black text-center">Leads</th>
                    <th className="p-6 font-black text-center">Closed Won</th>
                    <th className="p-6 font-black text-right">Pending Commission</th>
                    <th className="p-6 font-black text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {affiliates.map(aff => (
                    <AffiliateRow
                        key={aff.id}
                        aff={aff}
                        affiliateLeads={aff.leads}
                        isPending={isPending}
                    />
                ))}
            </tbody>
        </table>
    );
}
