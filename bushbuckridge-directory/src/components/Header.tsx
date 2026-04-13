import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, LogIn } from 'lucide-react'

const navLinks = [
    { name: 'Home / Hub', href: '/' },
    { name: 'Find a Service', href: '/find-a-service' },
    { name: 'Business Directory', href: '/directory' },
    { name: 'Events', href: '/events' },
    { name: 'Opportunities', href: '/opportunities' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Pricing', href: '/pricing' },
]

export default function Header() {
    return (
        <header className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                <div className="bg-white/95 h-20 w-full max-w-7xl rounded-[2rem] flex items-center justify-between gap-4 xl:gap-8 px-4 xl:px-8 shadow-xl pointer-events-auto border border-gray-100 backdrop-blur-xl">
                    <div className="flex gap-4 xl:gap-10">
                        <Link href="/" className="flex items-center group">
                            <img src="/logo.png" alt="DBIB Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
                        </Link>
                        <nav className="hidden lg:flex gap-4 xl:gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center text-sm font-bold text-gray-600 transition-all hover:text-primary hover:scale-105 whitespace-nowrap"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button asChild variant="ghost" className="hidden md:inline-flex text-gray-600 hover:text-primary hover:bg-gray-50 font-bold">
                            <Link href="/login">
                                <LogIn className="h-4 w-4 mr-1.5" />
                                Login
                            </Link>
                        </Button>
                        <Button asChild className="hidden sm:inline-flex rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold border-0">
                            <Link href="/list-your-business">List Your Business</Link>
                        </Button>

                        {/* Mobile Navigation */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 lg:hidden border-gray-200 bg-gray-50 text-gray-600">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="flex flex-col bg-white border-gray-100">
                                <nav className="grid gap-6 py-8 text-xl font-bold">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center transition-colors hover:text-primary text-gray-600"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/login"
                                        className="flex items-center transition-colors hover:text-primary text-gray-600"
                                    >
                                        <LogIn className="h-5 w-5 mr-3" /> Login to Portal
                                    </Link>
                                </nav>
                                <div className="mt-auto space-y-8 pb-8">
                                    <div className="flex items-center bg-gray-50 p-4 rounded-2xl">
                                        <img src="/logo.png" alt="DBIB Logo" className="h-10 w-auto" />
                                    </div>
                                    <p className="text-white/50 text-base leading-relaxed">
                                        The premier community directory connecting local enterprises and empowering the Bushbuckridge economy.
                                    </p>
                                    <Button asChild className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-bold">
                                        <Link href="/list-your-business">List Your Business</Link>
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
