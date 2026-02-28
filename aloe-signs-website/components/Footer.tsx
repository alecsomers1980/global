import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
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
                            <p className="flex items-center gap-3 text-vibrant-emerald">
                                <span className="w-1.5 h-1.5 rounded-full bg-vibrant-emerald"></span>
                                068 883 8049
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                                team@aloesigns.co.za
                            </p>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">SERVICES</h4>
                        <ul className="space-y-4 text-white/50 font-semibold text-sm">
                            <li><Link href="/services/vehicle-branding" className="hover:text-vibrant-emerald transition-colors">VEHICLE BRANDING</Link></li>
                            <li><Link href="/services/building-signage" className="hover:text-vibrant-emerald transition-colors">BUILDING SIGNAGE</Link></li>
                            <li><Link href="/services/shopfronts" className="hover:text-vibrant-emerald transition-colors">SHOPFRONTS</Link></li>
                            <li><Link href="/services/wayfinding-interior" className="hover:text-vibrant-emerald transition-colors">WAYFINDING & INTERIOR</Link></li>
                            <li><Link href="/services/billboards-outdoor" className="hover:text-vibrant-emerald transition-colors">BILLBOARDS & OUTDOOR</Link></li>
                            <li><Link href="/services/large-format-print" className="hover:text-vibrant-emerald transition-colors">LARGE FORMAT PRINT</Link></li>
                            <li><Link href="/services/screen-printing" className="hover:text-vibrant-emerald transition-colors">SCREEN PRINTING</Link></li>
                        </ul>
                    </div>

                    {/* Shop & Support */}
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">QUICK LINKS</h4>
                        <ul className="space-y-4 text-white/50 font-semibold text-sm">
                            <li><Link href="/shop" className="hover:text-vibrant-emerald transition-colors">SHOP ALL</Link></li>
                            <li><Link href="/portfolio" className="hover:text-vibrant-emerald transition-colors">OUR WORK</Link></li>
                            <li><Link href="/about" className="hover:text-vibrant-emerald transition-colors">ABOUT US</Link></li>
                            <li><Link href="/contact" className="hover:text-vibrant-emerald transition-colors">CONTACT</Link></li>
                            <li><Link href="/get-quote" className="hover:text-vibrant-emerald transition-colors">GET A QUOTE</Link></li>
                            <li><Link href="/order/track" className="hover:text-vibrant-emerald transition-colors">TRACK ORDER</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="glass-card p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <h4 className="text-white font-black text-lg">Ready to grow?</h4>
                        <p className="text-white/60 text-sm">Join 500+ businesses that choose Aloe Signs for their branding needs.</p>
                        <Link
                            href="/get-quote"
                            className="block w-full py-4 bg-white text-black font-black text-center rounded-xl hover:bg-vibrant-emerald transition-all hover:scale-[1.02]"
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

