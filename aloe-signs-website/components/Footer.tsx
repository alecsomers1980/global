'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on the Under Construction gateway and any portal pages
    if (pathname === '/' || pathname.startsWith('/portal')) {
        return null;
    }

    return (
        <footer className="bg-[#0B0E0D] text-white/90 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Company Info */}
                    <div className="space-y-6">
                        <div className="relative h-12 w-48">
                            <Image
                                src="/aloe-logo.png"
                                alt="Aloe Signs Logo"
                                fill
                                className="object-contain object-left brightness-0 invert"
                            />
                        </div>
                        <p className="text-white/60 text-lg leading-relaxed max-w-xs">
                            High-impact visual branding built to be seen. Products that build businesses.
                        </p>
                        <div className="space-y-3 font-medium">
                            <p className="flex items-center gap-3 text-aloe-green">
                                <span className="w-1.5 h-1.5 rounded-full bg-aloe-green"></span>
                                068 883 8049
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                team@aloesigns.co.za
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <a
                                href="https://www.facebook.com/profile.php?id=61577881601723"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-aloe-green hover:text-black flex items-center justify-center text-white/70 transition-all hover:scale-110"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.instagram.com/aloe_signs_team"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-aloe-green hover:text-black flex items-center justify-center text-white/70 transition-all hover:scale-110"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">SERVICES</h4>
                        <ul className="space-y-4 text-white/50 font-semibold text-sm">
                            <li><Link href="/services/billboards" className="hover:text-aloe-green transition-colors">BILLBOARDS</Link></li>
                            <li><Link href="/services/building-wraps" className="hover:text-aloe-green transition-colors">BUILDING WRAPS & XXL</Link></li>
                            <li><Link href="/services/bulk-orders-screen-printing" className="hover:text-aloe-green transition-colors">BULK ORDERS & SCREEN PRINTING</Link></li>
                            <li><Link href="/services/fleet-maintenance-branding" className="hover:text-aloe-green transition-colors">FLEET MAINTENANCE & BRANDING</Link></li>
                            <li><Link href="/services/promo-items" className="hover:text-aloe-green transition-colors">PROMO ITEMS</Link></li>
                            <li><Link href="/services/wall-art" className="hover:text-aloe-green transition-colors">WALL ART</Link></li>
                            <li><Link href="/services/set-building-strike" className="hover:text-aloe-green transition-colors">SET BUILDING & STRIKE</Link></li>
                        </ul>
                    </div>

                    {/* Shop & Support */}
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">QUICK LINKS</h4>
                        <ul className="space-y-4 text-white/50 font-semibold text-sm">
                            <li><Link href="/shop" className="hover:text-aloe-green transition-colors">SHOP ALL</Link></li>
                            <li><Link href="/portfolio" className="hover:text-aloe-green transition-colors">OUR WORK</Link></li>
                            <li><Link href="/about" className="hover:text-aloe-green transition-colors">ABOUT US</Link></li>
                            <li><Link href="/contact" className="hover:text-aloe-green transition-colors">CONTACT</Link></li>
                            <li><Link href="/get-quote" className="hover:text-aloe-green transition-colors">GET A QUOTE</Link></li>
                            <li><Link href="/order/track" className="hover:text-aloe-green transition-colors">TRACK ORDER</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <h4 className="text-white font-black text-lg">Ready to grow?</h4>
                        <p className="text-white/60 text-sm">Join 500+ businesses that choose Aloe Signs for their branding needs.</p>
                        <Link
                            href="/get-quote"
                            className="block w-full py-4 bg-white text-black font-black text-center rounded-xl hover:bg-aloe-green transition-all hover:scale-[1.02]"
                        >
                            START A PROJECT
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                    <p>© 2026 ALOE SIGNS. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">PRIVACY</Link>
                        <Link href="/terms-conditions" className="hover:text-white transition-colors">TERMS</Link>
                        <Link href="/refund-policy" className="hover:text-white transition-colors">REFUND</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

