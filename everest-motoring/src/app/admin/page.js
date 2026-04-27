import { createClient } from "@/utils/supabase/server";
import ReportActions from "./ReportActions";
import GenerateReportButton from "./GenerateReportButton";

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
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-black flex items-center gap-3">
                        Mission <span className="italic">Control</span>
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium tracking-wide">Live Dealership Analytics & Key Performance Indicators.</p>
                </div>
                <ReportActions />
            </div>

            {/* Inventory Health Section */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-1 bg-primary rounded-full"></span>
                        Inventory Health
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group hover:border-primary/50 transition-all">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 group-hover:text-primary transition-colors">Showroom Stock</p>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-slate-900">{activeCars.length}</span>
                            <span className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-widest">Units</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm border-l-primary border-l-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Floor Value</p>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl lg:text-5xl font-black text-slate-900">
                                R {new Intl.NumberFormat('en-ZA').format(totalInventoryValue)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Reserved / Pending</p>
                        <div className="flex items-end gap-3 relative z-10">
                            <span className="text-5xl font-black text-amber-500 group-hover:scale-110 transition-transform">{reservedCars.length}</span>
                            <span className="text-sm text-slate-500 mb-2 font-bold uppercase tracking-widest">Units</span>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[120px] text-slate-100 rotate-[-15deg] group-hover:text-primary/5 transition-colors">payments</span>
                    </div>
                </div>
            </div>

            {/* Sales CRM Section */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-1 bg-green-500 rounded-full"></span>
                        Sales Velocity
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-green-50 p-8 rounded-2xl border border-green-100 shadow-sm">
                        <p className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-4">Inquiries</p>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-green-700">{leadsThisMonth.length}</span>
                            <span className="text-sm text-green-600/50 mb-2 font-bold">LEADS</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Finance Pending</p>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-slate-900">{financePendingLeads.length}</span>
                            <span className="text-sm text-slate-500 mb-2 font-bold">QUEUED</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Deals Won</p>
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black text-primary">{closedWonLeads.length}</span>
                            <span className="text-sm text-slate-500 mb-2 font-bold">TOTAL</span>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">Trade-Ins</p>
                        <div className="flex items-end gap-3 relative z-10">
                            <span className="text-5xl font-black text-slate-900">{tradeInCount || 0}</span>
                            <span className="text-sm text-slate-500 mb-2 font-bold">TOTAL</span>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[120px] text-slate-100 rotate-[-15deg]">car_tag</span>
                    </div>
                </div>
            </div>

            <div 
                className="p-16 rounded-[2.5rem] shadow-2xl relative z-10 border border-primary/20"
                style={{ background: '#000000', backgroundColor: '#000000' }}
            >
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,1,0.3)]">
                            <span className="material-symbols-outlined text-black text-2xl font-black">auto_awesome</span>
                        </div>
                        <span className="text-primary font-black uppercase tracking-[0.5em] text-xs">AI Automation Suite</span>
                    </div>
                    <h3 className="text-5xl font-black text-white mb-8 leading-tight tracking-tighter">Performance <span className="text-primary italic">Intelligence</span></h3>
                    <p className="text-slate-300 mb-12 text-xl leading-relaxed font-medium tracking-wide max-w-2xl">
                        Instantly compile dealership metrics into high-fidelity performance reports. Our automation engine generates visual snapshots of your showroom velocity and sales trends with single-click precision.
                    </p>
                    <GenerateReportButton />
                </div>
                <span className="material-symbols-outlined absolute -right-24 -bottom-24 text-[450px] text-white/5 rotate-12 group-hover:text-primary/5 transition-all duration-1000 ease-in-out">picture_as_pdf</span>
            </div>

        </div>
    );
}
