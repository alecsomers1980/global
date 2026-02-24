export const metadata = {
    title: "Contact Us | Everest Motoring White River",
    description: "Get in touch with Everest Motoring. Find our dealership in White River, Mpumalanga, or reach out to our team of experts.",
};

import PageBanner from "@/components/PageBanner";

export default function ContactPage() {
    return (
        <div className="bg-background-light min-h-screen">
            <PageBanner
                title="Contact Us"
                subtitle="We are ready to assist you. Visit our showroom in White River or contact us digitally."
            />

            <section className="py-20 px-4 lg:px-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                    <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-slate-100 h-full">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Send us a Message</h2>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
                                <input type="text" className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                                    <input type="email" className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                                    <input type="tel" className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Message</label>
                                <textarea rows="4" className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"></textarea>
                            </div>
                            <button type="button" className="w-full bg-secondary hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-md">
                                Send Message
                            </button>
                        </form>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="bg-secondary text-white rounded-2xl shadow-sm p-8 md:p-12 h-full flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-8">Showroom Details</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Address</h4>
                                        <p className="text-blue-100">9 Chief Mgiyeni Khumalo Drive,<br />White River, Mpumalanga, 1240</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-3xl">call</span>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Phone</h4>
                                        <p className="text-blue-100">+27 (0)13 854 0600</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-3xl">mail</span>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Email</h4>
                                        <p className="text-blue-100">info@everestmotoring.co.za</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
