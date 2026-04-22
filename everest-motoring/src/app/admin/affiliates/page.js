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
        <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-display">Affiliate Network Management</h1>
                    <p className="text-slate-500 mt-1">Monitor your referral network, approve applications, and track pipeline velocity.</p>
                </div>
                <AffiliateTopActions affiliates={affiliateMetrics} />
            </div>

            {/* ── Network Overview Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Affiliates</p>
                    <span className="text-3xl font-bold text-slate-900">{affiliates?.length || 0}</span>
                </div>
                <div className={`p-5 rounded-xl border shadow-sm ${pendingAffiliates.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${pendingAffiliates.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Pending Approval</p>
                    <span className={`text-3xl font-bold ${pendingAffiliates.length > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{pendingAffiliates.length}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-500">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Network Leads</p>
                    <span className="text-3xl font-bold text-slate-900">{networkTotalLeads}</span>
                </div>
                <div className="bg-slate-900 p-5 rounded-xl shadow-md border-t-4 border-t-green-500">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Network Closed</p>
                    <span className="text-3xl font-bold text-white">{networkClosedWon}</span>
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
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider bg-slate-50/70">
                    <th className="p-4 font-bold">Salesperson</th>
                    <th className="p-4 font-bold">Phone</th>
                    <th className="p-4 font-bold text-center">Tracking Code</th>
                    <th className="p-4 font-bold text-center">Leads</th>
                    <th className="p-4 font-bold text-center">Closed Won</th>
                    <th className="p-4 font-bold text-right">Pending Commission</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
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
