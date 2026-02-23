"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactModal } from "@/components/ContactModal";
import { MapPin, Phone, Mail, Clock, MessageCircle, Shield, Send } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOffice, setModalOffice] = useState("");

    const openModal = (office: string) => {
        setModalOffice(office);
        setModalOpen(true);
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                {/* Hero */}
                <section className="bg-brand-navy py-20 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image src="/images/header3.jpg" alt="Law Office" fill className="object-cover object-right opacity-15 mix-blend-overlay" priority />
                        <div className="absolute inset-0 bg-brand-navy/70 mix-blend-multiply" />
                    </div>
                    <div className="container relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="h-px w-12 bg-brand-gold/50" />
                            <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase">Contact Us</span>
                            <div className="h-px w-12 bg-brand-gold/50" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Take the First Step Toward Your Recovery</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                            The Road Accident Fund is complex. Getting expert help shouldn&apos;t be.
                        </p>
                        <p className="text-gray-400 max-w-2xl mx-auto mt-3">
                            At Roets & Van Rensburg, we are ready to put our decades of experience to work for you. Whether you are just starting your claim or have hit a roadblock with the Fund, our team is here to provide the clarity and results you deserve.
                        </p>
                    </div>
                </section>

                {/* Two Offices Side-by-Side */}
                <section className="py-20">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-serif font-bold text-brand-navy mb-3">Our Offices</h2>
                            <p className="text-gray-500">Choose your nearest office to get in touch.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                            {/* Pretoria Office */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow">
                                {/* Map */}
                                <div className="aspect-video bg-gray-200 relative">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3590.224816174826!2d28.2393!3d-25.8456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDUwJzQ0LjIiUyAyOMKwMTQnMjEuNSJF!5e0!3m2!1sen!2sza!4v1645512345678!5m2!1sen!2sza"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Pretoria Office Map"
                                        className="absolute inset-0"
                                    />
                                </div>
                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-gold" />
                                        <h3 className="text-xl font-serif font-bold text-brand-navy">Head Office — Pretoria</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">40 Van Ryneveld Avenue, Pierre van Ryneveld, Pretoria</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <a href="tel:0871505683" className="text-gray-600 hover:text-brand-navy transition-colors">087 150 5683</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <a href="mailto:info@rvrinc.co.za" className="text-gray-600 hover:text-brand-navy transition-colors">info@rvrinc.co.za</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <a href="https://wa.me/27760465545" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-navy transition-colors">WhatsApp: 076 046 5545</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <span className="text-gray-600">Mon – Fri: 08:00 – 16:00</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openModal("Pretoria Office")}
                                        className="w-full mt-4 px-6 py-3 bg-brand-navy text-white rounded-xl font-semibold text-sm hover:bg-brand-navy/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Send a Message
                                    </button>
                                </div>
                            </div>

                            {/* Marble Hall Office */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow">
                                {/* Map */}
                                <div className="aspect-video bg-gray-200 relative">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.123456789012!2d29.2956!3d-24.9705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDU4JzEzLjgiUyAyOcKwMTcnNDQuMiJF!5e0!3m2!1sen!2sza!4v1645512345679!5m2!1sen!2sza"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Marble Hall Office Map"
                                        className="absolute inset-0"
                                    />
                                </div>
                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-gold" />
                                        <h3 className="text-xl font-serif font-bold text-brand-navy">Marble Hall Office</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600">144 2nd Avenue, Marble Hall</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <a href="tel:0132617187" className="text-gray-600 hover:text-brand-navy transition-colors">013 261 7187/8/9</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <a href="mailto:martie@rvrinc.co.za" className="text-gray-600 hover:text-brand-navy transition-colors">martie@rvrinc.co.za</a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-brand-gold flex-shrink-0" />
                                            <a href="https://wa.me/27827640218" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-brand-navy transition-colors">WhatsApp: 082 764 0218</a>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openModal("Marble Hall Office")}
                                        className="w-full mt-4 px-6 py-3 bg-brand-navy text-white rounded-xl font-semibold text-sm hover:bg-brand-navy/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Send a Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* POPIA Notice */}
                <section className="pb-16">
                    <div className="container max-w-2xl">
                        <div className="bg-brand-cream rounded-xl p-6 border border-gray-100 flex items-start gap-4 text-center mx-auto">
                            <Shield className="w-6 h-6 text-brand-gold mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-brand-navy text-sm">The Roets & Van Rensburg Guarantee</p>
                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                    We handle your data with the highest level of confidentiality and respect, in full compliance with POPIA.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Modal */}
                <ContactModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    office={modalOffice}
                />

            </main>
            <Footer />
        </div>
    );
}
