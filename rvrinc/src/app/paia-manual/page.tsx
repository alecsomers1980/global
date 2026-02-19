import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PAIAPage() {
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
                        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">PAIA Manual</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Promotion of Access to Information Act 2 of 2000
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container max-w-4xl space-y-8 text-gray-700 leading-relaxed">
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-brand-navy">1. Introduction</h2>
                            <p>
                                The Promotion of Access to Information Act, 2000 (Act No. 2 of 2000) (PAIA) gives effect to the constitutional right of access to any information held by the State and any information that is held by another person and that is required for the exercise or protection of any rights.
                            </p>
                            <p>
                                Roets & Van Rensburg Inc. is a private body as defined in the Act, and this manual contains the information specified in section 51(1) of the Act, which is applicable to such a private body.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">2. Contact Details</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Head of Body:</strong> The Directors</li>
                                <li><strong>Physical Address:</strong> 40 Van Ryneveld Avenue, Pierre van Ryneveld, Centurion</li>
                                <li><strong>Postal Address:</strong> P.O. Box [Postal Code], Pretoria</li>
                                <li><strong>Telephone:</strong> 087 150 5683</li>
                                <li><strong>Email:</strong> info@rvrinc.co.za</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">3. Guide of the Information Regulator</h2>
                            <p>
                                A guide on how to use the Act is available from the Information Regulator. Queries can be directed to:
                            </p>
                            <ul className="list-none pl-5 space-y-1 bg-gray-50 p-4 rounded-md border border-gray-200">
                                <li><strong>The Information Regulator (South Africa)</strong></li>
                                <li>Physical Address: JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</li>
                                <li>Website: <a href="https://www.justice.gov.za/inforeg" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">www.justice.gov.za/inforeg</a></li>
                                <li>Email: inforeg@justice.gov.za</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">4. Records Available Without Request</h2>
                            <p>
                                The following records are available without a formal PAIA request:
                            </p>
                            <ul className="list-disc pl-5">
                                <li>Public marketing material</li>
                                <li>Information available on our website</li>
                                <li>Fee structures (upon simplified request)</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">5. Records Available via Request</h2>
                            <p>
                                The following records may be requested, subject to the grounds for refusal as set out in the Act:
                            </p>
                            <ul className="list-disc pl-5">
                                <li><strong>Client Records:</strong> Correspondence, legal documents, contracts.</li>
                                <li><strong>Financial Records:</strong> Annual financial statements, tax returns, banking records.</li>
                                <li><strong>Employee Records:</strong> Employment contracts, payroll records, disciplinary records.</li>
                                <li><strong>Company Records:</strong> Incorporation documents, minutes of meetings.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-navy mt-8">6. Request Procedure</h2>
                            <p>
                                To request access to a record, please complete the prescribed Form C (available on the Information Regulator&apos;s website) and submit it to our Information Officer at the contact details provided above. A prescribed fee may be payable.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
