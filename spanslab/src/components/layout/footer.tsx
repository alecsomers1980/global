import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-concrete-light border-t border-border pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-slate-DEFAULT rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="text-slate-DEFAULT font-bold text-xl tracking-tight">
                                Spanslab
                            </span>
                        </Link>
                        <p className="text-slate-light text-sm leading-relaxed max-w-xs">
                            Nelspruit&apos;s trusted supplier of Rib & Block slabs and Paving. Building strong foundations for over 15 years.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-slate-light hover:text-orange-DEFAULT transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-light hover:text-orange-DEFAULT transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-light hover:text-orange-DEFAULT transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-slate-DEFAULT font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    Our Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    Projects Gallery
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="text-slate-DEFAULT font-semibold mb-6">Products</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/products?category=rib-and-block" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    Rib & Block Slabs
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=paving" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    Bevel Paving
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=building-materials" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    Building Materials
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-slate-DEFAULT font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-orange-DEFAULT shrink-0 mt-0.5" />
                                <span className="text-slate-light text-sm">
                                    12 Industrial Road,<br />
                                    Nelspruit, Mpumalanga,<br />
                                    South Africa, 1200
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-orange-DEFAULT shrink-0" />
                                <a href="tel:+27137521111" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    +27 13 752 1111
                                </a>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-orange-DEFAULT shrink-0" />
                                <a href="mailto:info@spanslab.co.za" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-sm">
                                    info@spanslab.co.za
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-light text-xs">
                        © {new Date().getFullYear()} Spanslab. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-xs">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-slate-light hover:text-orange-DEFAULT transition-colors text-xs">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
