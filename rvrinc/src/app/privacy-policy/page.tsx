import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                {/* Banner */}
                <section className="bg-brand-navy py-16 text-center text-white relative overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        {/* Re-using the header background for consistency */}
                        <div className="absolute inset-0 bg-brand-navy/90 z-10" />
                    </div>
                    <div className="container relative z-20">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Privacy Policy & POPI Act</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Protection of Personal Information Act (POPIA) Compliance
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container max-w-4xl space-y-8 text-gray-700 leading-relaxed">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-brand-navy">1. Commitment to Privacy</h2>
                            <p>
                                Roets & Van Rensburg Inc. is committed to protecting the privacy and security of your personal information. We comply with the Protection of Personal Information Act 4 of 2013 (&quot;POPIA&quot;) and the Constitution of South Africa.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">2. Collection of Personal Information</h2>
                            <p>
                                We collect personal information directly from you when you instruct us to provide legal services, or when you interact with us specifically for the purpose of inquiries. This includes, but is not limited to:
                            </p>
                            <ul className="list-disc pl-5">
                                <li>Basic identification details (ID number, name, contact details).</li>
                                <li>Financial information required for FICA compliance.</li>
                                <li>Details relevant to your legal matter (medical records for RAF claims, employment history, etc.).</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">3. Use of Personal Information</h2>
                            <p>
                                Your personal information is used strictly for the purpose for which it was collected, including:
                            </p>
                            <ul className="list-disc pl-5">
                                <li>Providing legal advice and representation.</li>
                                <li>Drafting legal contracts and documents.</li>
                                <li>Communicating with you regarding your case.</li>
                                <li>Complying with legal obligations (e.g., FICA, tax laws).</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">4. Sharing of Information</h2>
                            <p>
                                We process your information confidentially. We do not sell your personal information. We may disclose your information to:
                            </p>
                            <ul className="list-disc pl-5">
                                <li>Advocates, correspondents, and experts involved in your matter.</li>
                                <li>The Road Accident Fund, courts, or opposing parties as necessitated by legal proceedings.</li>
                                <li>Service providers who assist with our business operations (IT, accounting), subject to confidentiality agreements.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">5. Data Security</h2>
                            <p>
                                We have implemented reasonable technical and organizational measures to prevent the loss, damage, or unauthorized destruction of your personal information. This includes physical security at our offices and cybersecurity measures on our digital systems.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">6. Your Rights</h2>
                            <p>
                                Under POPIA, you have the right to:
                            </p>
                            <ul className="list-disc pl-5">
                                <li>Request access to the personal information we hold about you.</li>
                                <li>Request the correction or deletion of your personal information.</li>
                                <li>Object to the processing of your personal information.</li>
                                <li>Lodge a complaint with the Information Regulator.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">7. Contact Us</h2>
                            <p>
                                If you have any questions about this policy or wish to exercise your rights, please contact our Information Officer at: <a href="mailto:info@rvrinc.co.za" className="text-brand-gold hover:underline">info@rvrinc.co.za</a>.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
