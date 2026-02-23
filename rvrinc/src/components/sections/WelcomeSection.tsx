import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, UserCheck, Scale, ArrowRight } from "lucide-react";

export function WelcomeSection() {
    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Welcome Messsage */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-navy font-medium text-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                            </span>
                            Est. 2000 — Over 25 Years of Excellence
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-brand-navy leading-tight">
                            Welcome to Roets & <br />
                            Van Rensburg Inc.
                        </h2>

                        <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                            <p>
                                At RVR Inc., we believe that legal representation is more than just a service&mdash;it&apos;s a commitment to restoring dignity and ensuring the future security of our clients.
                            </p>
                            <p>
                                Founded in 2000, our firm has grown from a specialized practice into a leading authority in Road Accident Fund (RAF) claims and general litigation across South Africa. With offices in <strong>Pretoria</strong> and <strong>Marble Hall</strong>, we provide a localized approach with nationwide legal power.
                            </p>
                            <p>
                                Whether you are navigating a complex RAF claim or require expert civil litigation, our team is driven by a singular purpose: <strong>Transforming legal challenges into life-changing results.</strong>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 border border-brand-gold/20 rounded-lg">
                                    <Scale className="w-5 h-5 text-brand-gold" />
                                </div>
                                <span className="font-semibold text-brand-navy">Proven Strategy</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 border border-brand-gold/20 rounded-lg">
                                    <UserCheck className="w-5 h-5 text-brand-gold" />
                                </div>
                                <span className="font-semibold text-brand-navy">Personalized Care</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Portal Teaser Card */}
                    <div className="lg:col-span-5">
                        <div className="relative group p-8 md:p-10 rounded-3xl bg-brand-navy text-white overflow-hidden shadow-2xl">
                            {/* Abstract background elements */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 space-y-6">
                                <div className="p-3 bg-white/10 rounded-2xl w-fit">
                                    <ShieldCheck className="w-8 h-8 text-brand-gold" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Secure Client Portal</h3>
                                    <p className="text-gray-400">
                                        Already a client? Access your secure portal to track your case status, upload documents, and communicate directly with your attorney.
                                    </p>
                                </div>

                                <ul className="space-y-3 pt-2">
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                        Live Case Roadmap & Updates
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                        Secure Document Vault
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                        Meeting Scheduling
                                    </li>
                                </ul>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <Link href="/case-update" className="flex-1">
                                        <Button variant="brand" className="w-full text-brand-navy font-bold py-6 text-base group">
                                            Login to Your Case
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Link href="/contact" className="flex-1 lg:hidden xl:block">
                                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/5 text-white py-6 text-base">
                                            Help Accessing
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
