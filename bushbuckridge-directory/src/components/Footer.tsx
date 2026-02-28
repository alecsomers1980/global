import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-muted/40 pb-8 pt-16 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Doing Business in Bushbuckridge</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            The premier business directory and investment journal connecting local enterprises and empowering the local economy.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/directory" className="text-sm text-muted-foreground hover:text-foreground">
                                    Business Directory
                                </Link>
                            </li>
                            <li>
                                <Link href="/find-a-service" className="text-sm text-muted-foreground hover:text-foreground">
                                    Find a Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/opportunities" className="text-sm text-muted-foreground hover:text-foreground">
                                    Opportunities (Tenders/Funding)
                                </Link>
                            </li>
                            <li>
                                <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
                                    Local Jobs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Actions</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/buy-your-spot" className="text-sm text-muted-foreground hover:text-foreground">
                                    Buy Your Spot
                                </Link>
                            </li>
                            <li>
                                <Link href="/enquiries" className="text-sm text-muted-foreground hover:text-foreground">
                                    Enquiries
                                </Link>
                            </li>
                            <li>
                                <Link href="/download-journal" className="text-sm text-muted-foreground hover:text-foreground font-medium flex items-center">
                                    Download the Annual Journal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Get in touch</h3>
                        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                            <span className="block">Email: info@dbib.co.za</span>
                            <span className="block">Phone: +27 12 345 6789</span>
                            <span className="block mt-4">Follow us on social media</span>
                            {/* Add social icons here if needed */}
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row text-sm text-muted-foreground">
                    <p>© {currentYear} Bushbuckridge Business Journal. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
                        <Link href="/admin" className="hover:text-foreground">Staff Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
