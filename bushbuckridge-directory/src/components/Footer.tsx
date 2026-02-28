import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-[#0B0E0D] text-white pb-12 pt-24 mt-auto relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-secondary text-secondary-foreground h-10 w-10 rounded-xl flex items-center justify-center font-black text-xl">
                                B
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">DBIB</span>
                        </div>
                        <p className="text-white/50 text-base leading-relaxed max-w-xs">
                            The premier business directory and investment journal connecting local enterprises and empowering the Bushbuckridge economy.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Explore</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/directory" className="text-base text-white/60 hover:text-white transition-colors">
                                    Business Directory
                                </Link>
                            </li>
                            <li>
                                <Link href="/find-a-service" className="text-base text-white/60 hover:text-white transition-colors">
                                    Find a Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/opportunities" className="text-base text-white/60 hover:text-white transition-colors">
                                    Opportunities
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-base text-white/60 hover:text-white transition-colors">
                                    Local Jobs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Actions</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/buy-your-spot" className="text-base text-white/60 hover:text-white transition-colors">
                                    Register Business
                                </Link>
                            </li>
                            <li>
                                <Link href="/enquiries" className="text-base text-white/60 hover:text-white transition-colors">
                                    Enquiries
                                </Link>
                            </li>
                            <li>
                                <Link href="/download-journal" className="text-base text-secondary hover:text-secondary/80 font-bold flex items-center">
                                    <BookOpen className="mr-2 h-4 w-4" /> 2026 Journal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">Get in touch</h3>
                        <div className="flex flex-col space-y-4 text-base text-white/60">
                            <span className="block">Email: <span className="text-white font-medium">info@dbib.co.za</span></span>
                            <span className="block">Phone: <span className="text-white font-medium">+27 13 777 0000</span></span>
                            <div className="flex gap-4 pt-2">
                                {/* Social placeholders with cinematic style */}
                                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors shadow-lg">
                                    <span className="sr-only">Social</span>
                                    <div className="h-2 w-2 bg-secondary rounded-full" />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors shadow-lg">
                                    <span className="sr-only">Social</span>
                                    <div className="h-2 w-2 bg-secondary rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-12 sm:flex-row text-sm text-white/30 font-medium">
                    <p>© {currentYear} Bushbuckridge Business Journal. Portions by Google Lab's Cinematic UI.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/admin" className="hover:text-white transition-colors">Staff</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
