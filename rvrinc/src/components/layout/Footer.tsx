import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-brand-navy text-white pt-16 pb-8">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-brand-gold">Roets & Van Rensburg</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Upholding justice with unwavering commitment since 1995. A premier South African law firm dedicated to excellence.
                    </p>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Practice Areas</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li><Link href="/practice-areas/commercial" className="hover:text-white transition-colors">Commercial Law</Link></li>
                        <li><Link href="/practice-areas/family" className="hover:text-white transition-colors">Family Law</Link></li>
                        <li><Link href="/practice-areas/litigation" className="hover:text-white transition-colors">Civil Litigation</Link></li>
                        <li><Link href="/practice-areas/property" className="hover:text-white transition-colors">Property Law</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Contact</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>123 Justice Avenue, Pretoria</li>
                        <li>+27 (0) 12 345 6789</li>
                        <li>info@rvrinc.co.za</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Client Portal</h4>
                    <p className="text-sm text-gray-300">Existing clients can track cases securely online.</p>
                    <Link href="/portal" className="inline-block px-4 py-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-navy transition-colors rounded-md text-sm">
                        Access Portal
                    </Link>
                </div>
            </div>

            <div className="container border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} Roets & Van Rensburg Attorneys. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
