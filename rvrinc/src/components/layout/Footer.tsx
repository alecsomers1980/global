import Link from "next/link";
import { Facebook, Linkedin, Instagram } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-brand-navy text-white pt-16 pb-8">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-brand-gold">Roets & Van Rensburg</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        A legacy of over 25 years. A future of dedicated advocacy. We don&apos;t just pursue claims — we restore lives.
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Est. 2000</p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Our Expertise</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/about#expertise" className="hover:text-white transition-colors">RAF Claims</Link></li>
                        <li><Link href="/about#expertise" className="hover:text-white transition-colors">Personal Injury</Link></li>
                        <li><Link href="/about#expertise" className="hover:text-white transition-colors">Loss of Support</Link></li>
                        <li><Link href="/about#expertise" className="hover:text-white transition-colors">General Litigation</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>40 Van Ryneveld Ave, Pierre van Ryneveld, Pretoria</li>
                        <li>087 150 5683</li>
                        <li>info@rvrinc.co.za</li>
                        <li className="pt-2">144 2nd Avenue, Marble Hall</li>
                        <li>013 261 7187/8/9</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Update on Your Case</h4>
                    <p className="text-sm text-gray-300">Existing clients can track the progress of their case.</p>
                    <Link href="/case-update" className="inline-block px-4 py-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-colors rounded-md text-sm">
                        Check Your Case
                    </Link>

                    {/* Social Media */}
                    <div className="pt-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Stay Connected</p>
                        <div className="flex gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-colors">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-colors">
                                <Instagram className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} Roets & Van Rensburg Attorneys. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Link href="/privacy-policy" className="hover:text-gray-300">Privacy Policy</Link>
                    <span className="hidden md:inline">|</span>
                    <Link href="/paia-manual" className="hover:text-gray-300">PAIA Manual</Link>
                </div>
            </div>
        </footer>
    );
}
