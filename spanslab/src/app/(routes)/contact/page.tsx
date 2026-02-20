"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader
                title="Get in Touch"
                description="Ready to start your project? Contact our team for quotes, technical advice, or general inquiries."
                image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2670&auto=format&fit=crop"
            />

            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                        {/* Contact Form */}
                        <div className="bg-concrete-light p-8 rounded-2xl border border-border/60">
                            <h2 className="text-2xl font-bold text-slate-DEFAULT mb-6">Send us a Message</h2>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="john@company.com" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="+27 ..." />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="interest">I'm interested in...</Label>
                                    <select
                                        id="interest"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select a product...</option>
                                        <option value="rib-and-block">Rib & Block Slabs</option>
                                        <option value="paving">Paving</option>
                                        <option value="ready-mix">Ready Mix Concrete</option>
                                        <option value="other">General Inquiry</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" placeholder="Tell us about your project requirements..." className="h-32" />
                                </div>

                                <Button type="submit" className="w-full bg-orange-DEFAULT hover:bg-orange-hover text-white">
                                    Send Message
                                </Button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-DEFAULT mb-6">Contact Information</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                            <MapPin className="h-5 w-5 text-orange-DEFAULT" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-DEFAULT">Visit Us</h3>
                                            <p className="text-slate-light leading-relaxed mt-1">
                                                12 Industrial Road<br />
                                                Riverside Industrial Park<br />
                                                Nelspruit, 1200
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Phone className="h-5 w-5 text-orange-DEFAULT" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-DEFAULT">Call Us</h3>
                                            <p className="text-slate-light leading-relaxed mt-1">
                                                <a href="tel:+27137521111" className="hover:text-orange-DEFAULT transition-colors">+27 13 752 1111</a> <br />
                                                <span className="text-xs text-slate-400">Sales & Support</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Mail className="h-5 w-5 text-orange-DEFAULT" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-DEFAULT">Email Us</h3>
                                            <p className="text-slate-light leading-relaxed mt-1">
                                                <a href="mailto:info@spanslab.co.za" className="hover:text-orange-DEFAULT transition-colors">info@spanslab.co.za</a> <br />
                                                <a href="mailto:sales@spanslab.co.za" className="hover:text-orange-DEFAULT transition-colors">sales@spanslab.co.za</a>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5 text-orange-DEFAULT" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-DEFAULT">Business Hours</h3>
                                            <p className="text-slate-light leading-relaxed mt-1 text-sm">
                                                Mon - Fri: 07:00 - 17:00 <br />
                                                Sat: 08:00 - 12:00 <br />
                                                Sun & Public Holidays: Closed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="w-full h-64 bg-slate-200 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                    <div className="text-center">
                                        <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                        <span className="text-slate-400 font-medium">Google Maps Integration</span>
                                    </div>
                                </div>
                                {/* 
                // Actual Google Maps Embed
                <iframe 
                    src="https://www.google.com/maps/embed?pb=..." 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen 
                    loading="lazy" 
                /> 
                */}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
