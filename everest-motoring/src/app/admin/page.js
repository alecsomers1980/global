import { createClient } from "@/utils/supabase/server";

export const metadata = {
    title: "Mission Control | Everest Admin",
};

export default async function AdminDashboardRoot() {
    const supabase = await createClient();

    // 1. Fetch Inventory Health Metrics
    const { data: cars } = await supabase.from('cars').select('price, status');

    const activeCars = cars?.filter(c => c.status === 'available') || [];
    const totalInventoryValue = activeCars.reduce((sum, car) => sum + (car.price || 0), 0);
    const reservedCars = cars?.filter(c => c.status === 'reserved') || [];

    // 2. Fetch Sales & CRM Velocity (Current Month vs Overall)
    const { data: leads } = await supabase.from('leads').select('status, created_at');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const leadsThisMonth = leads?.filter(l => {
        const d = new Date(l.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }) || [];

    const closedWonLeads = leadsThisMonth.filter(l => l.status === 'closed_won');
    const financePendingLeads = leadsThisMonth.filter(l => l.status === 'finance_pending');

    // 3. Fetch Trade-In Volume
    const { count: tradeInCount } = await supabase
        .from('value_my_car_requests')
        .select('*', { count: 'exact', head: true });

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mission Control</h1>
                    <p className="text-slate-500 mt-1">Live Dealership Analytics & Key Performance Indicators.</p>
                </div>
            </div>

            {/* Inventory Health Section */}
            <div className="mb-10">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">inventory_2</span>
                    Inventory Health
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Showroom Stock</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-slate-900">{activeCars.length}</span>
                            <span className="text-sm text-slate-500 mb-1">Vehicles</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Floor Value</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-indigo-600">
                                R {new Intl.NumberFormat('en-ZA').format(totalInventoryValue)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 z-10 relative">Reserved / Pending</p>
                        <div className="flex items-end gap-3 z-10 relative">
                            <span className="text-4xl font-bold text-amber-500">{reservedCars.length}</span>
                            <span className="text-sm text-slate-500 mb-1">Vehicles</span>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-amber-50 opacity-50 rotate-[-15deg]">payments</span>
                    </div>
                </div>
            </div>

            {/* Sales CRM Section */}
            <div className="mb-10">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">monitoring</span>
                    Sales Velocity (This Month)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-green-50 to-white">
                        <p className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">Total Inquiries</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-green-600">{leadsThisMonth.length}</span>
                            <span className="text-sm text-green-600/70 mb-1">Leads</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Finance Pending</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-slate-900">{financePendingLeads.length}</span>
                            <span className="text-sm text-slate-500 mb-1">Portals Active</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Deals Closed</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-slate-900">{closedWonLeads.length}</span>
                            <span className="text-sm text-slate-500 mb-1">Won</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 z-10 relative">Trade-In Requests</p>
                        <div className="flex items-end gap-3 z-10 relative">
                            <span className="text-4xl font-bold text-slate-900">{tradeInCount || 0}</span>
                            <span className="text-sm text-slate-500 mb-1">All Time</span>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-indigo-50 opacity-50 rotate-[-15deg]">car_tag</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg mt-12 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2">Automated PDF Reporting</h3>
                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                        Phase 8 includes integrating an n8n automation engine that will compile these metrics into beautiful monthly PDF reports, securely emailed directly to the Dealer Principal.
                    </p>
                    <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        Scheduled for Phase 8
                    </span>
                </div>
                <span className="material-symbols-outlined absolute -right-10 -top-10 text-[200px] text-white/5 rotate-12">picture_as_pdf</span>
            </div>

        </div>
    );
}
