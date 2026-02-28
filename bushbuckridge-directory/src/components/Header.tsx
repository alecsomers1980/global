import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navLinks = [
    { name: 'Home / Hub', href: '/' },
    { name: 'Find a Service', href: '/find-a-service' },
    { name: 'Business Directory', href: '/directory' },
    { name: 'Spotlight', href: '/spotlight' },
    { name: 'Events', href: '/events' },
    { name: 'Opportunities', href: '/opportunities' },
    { name: 'Jobs', href: '/jobs' },
]

export default function Header() {
    return (
        <header className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                <div className="glass-dark h-20 w-full max-w-7xl rounded-[2rem] flex items-center justify-between px-8 shadow-2xl pointer-events-auto border-white/10 backdrop-blur-2xl">
                    <div className="flex gap-6 md:gap-10">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="bg-secondary text-secondary-foreground h-10 w-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-110">
                                B
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl text-white tracking-tighter leading-none">DBIB</span>
                                <span className="hidden md:inline-block font-bold text-[10px] text-white/40 uppercase tracking-[0.2em] leading-none mt-1">
                                    Bushbuckridge
                                </span>
                            </div>
                        </Link>
                        <nav className="hidden lg:flex gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center text-sm font-bold text-white/70 transition-all hover:text-secondary hover:scale-105"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button asChild className="hidden sm:inline-flex rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold border-0">
                            <Link href="/buy-your-spot">Buy Your Spot</Link>
                        </Button>

                        {/* Mobile Navigation */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 lg:hidden border-white/10 bg-white/5 text-white">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="flex flex-col bg-[#0B0E0D] border-white/10 text-white">
                                <nav className="grid gap-6 py-8 text-xl font-bold">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center transition-colors hover:text-secondary text-white/70"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-auto space-y-8 pb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-secondary text-secondary-foreground h-10 w-10 rounded-xl flex items-center justify-center font-black text-xl">
                                            B
                                        </div>
                                        <span className="text-2xl font-black text-white tracking-tighter">DBIB</span>
                                    </div>
                                    <p className="text-white/50 text-base leading-relaxed">
                                        The premier business directory and investment journal connecting local enterprises and empowering the Bushbuckridge economy.
                                    </p>
                                    <Button asChild className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-bold">
                                        <Link href="/buy-your-spot">Buy Your Spot</Link>
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
