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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="inline-block font-bold text-xl text-primary">DBIB</span>
                        <span className="hidden md:inline-block font-medium text-sm text-muted-foreground whitespace-nowrap">
                            Doing Business in Bushbuckridge
                        </span>
                    </Link>
                    <nav className="hidden lg:flex gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <Button asChild className="hidden sm:inline-flex rounded-full">
                        <Link href="/buy-your-spot">Buy Your Spot</Link>
                    </Button>

                    {/* Mobile Navigation */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Demo menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col">
                            <nav className="grid gap-4 py-4 text-lg font-medium">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center transition-colors hover:text-foreground text-muted-foreground"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto pt-6 border-t">
                                <Button asChild className="w-full">
                                    <Link href="/buy-your-spot">Buy Your Spot</Link>
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
