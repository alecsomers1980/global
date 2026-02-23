export const metadata = {
    title: "Vehicle Finance Guide South Africa | Everest Motoring",
    description: "Learn how to easily finance your next pre-owned vehicle through major South African banks like WesBank, Absa, Standard Bank, and Nedbank.",
};

export default function FinancePage() {
    return (
        <div className="bg-background-light min-h-screen">
            <section className="bg-slate-900 py-24 px-4 text-center lg:px-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="mb-4 inline-flex items-center rounded-full bg-secondary/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 border border-secondary">
                        Finance & Insurance
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Seamless Vehicle Finance</h1>
                    <p className="text-lg text-slate-300 md:text-xl">We partner with all major South African banks to secure you the most competitive interest rates possible. Approvals within 24 hours.</p>
                </div>
            </section>

            <section className="py-20 px-4 lg:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-primary">Approved by the Best</h2>
                            <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                                Everest Motoring is an approved dealership with WesBank, Absa Vehicle Finance, Standard Bank, MFC (Nedbank), and more. Because we are a highly trusted dealer, we have direct lines to the banks to negotiate on your behalf.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="text-slate-700 font-medium">No hidden admin fees</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="text-slate-700 font-medium">Fast pre-approvals without affecting your credit score</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span className="text-slate-700 font-medium">Trade-ins accepted to lower your deposit</span>
                                </li>
                            </ul>
                            <button className="bg-secondary hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all">
                                Apply for Pre-Approval
                            </button>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Required Documents</h3>
                            <ul className="space-y-4 text-slate-600 text-sm">
                                <li className="flex items-start gap-3">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0">1</span>
                                    <span>Clear copy of your South African ID Document (or Passport with Traffic Register)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0">2</span>
                                    <span>Copy of a valid South African Driver's License</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0">3</span>
                                    <span>3 Months latest stamped bank statements</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0">4</span>
                                    <span>Latest payslip (or 3 months if commission earner)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-primary/10 text-primary w-6 h-6 rounded flex items-center justify-center font-bold flex-shrink-0">5</span>
                                    <span>Proof of Residence (not older than 3 months)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
