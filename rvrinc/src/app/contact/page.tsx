import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                <section className="bg-brand-navy py-16 text-center text-white">
                    <div className="container">
                        <h1 className="text-4xl font-serif font-bold mb-4">Contact Us</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                            Get in touch to schedule a consultation. We are here to assist you with your legal needs.
                        </p>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container grid lg:grid-cols-2 gap-16">

                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Our Offices</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <MapPin className="w-6 h-6 text-brand-gold mr-4 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Pretoria (Head Office)</h3>
                                            <p className="text-gray-600">123 Justice Avenue, Brooklyn</p>
                                            <p className="text-gray-600">Pretoria, 0181</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="w-6 h-6 text-brand-gold mr-4 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Marble Hall</h3>
                                            <p className="text-gray-600">45 Main Street</p>
                                            <p className="text-gray-600">Marble Hall, 0450</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Get in Touch</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Phone className="w-5 h-5 text-brand-gold mr-4" />
                                        <span className="text-gray-600">+27 (0) 12 345 6789</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="w-5 h-5 text-brand-gold mr-4" />
                                        <span className="text-gray-600">info@rvrinc.co.za</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 text-brand-gold mr-4" />
                                        <span className="text-gray-600">Mon - Fri: 08:00 - 17:00</span>
                                    </div>
                                </div>
                            </div>



                            {/* Map / Office Image */}
                            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative shadow-lg">
                                <Image
                                    src="/images/Ptagroup.png"
                                    alt="Roets & Van Rensburg Offices"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Send Us a Message</h2>
                            <form className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <input type="email" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Practice Area</label>
                                    <select className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none bg-white">
                                        <option>General Inquiry</option>
                                        <option>Civil Litigation</option>
                                        <option>Family Law</option>
                                        <option>Commercial Law</option>
                                        <option>Property Law</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Message</label>
                                    <textarea rows={4} className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"></textarea>
                                </div>

                                <Button type="submit" size="lg" variant="brand" className="w-full">
                                    Send Message
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    All communications are treated with strict confidentiality.
                                </p>
                            </form>
                        </div>

                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
