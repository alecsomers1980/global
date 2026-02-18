import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold font-serif text-brand-navy tracking-tight">
                        Roets & Van Rensburg
                    </span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/practice-areas" className="text-sm font-medium text-muted-foreground hover:text-brand-navy transition-colors">
                        Practice Areas
                    </Link>
                    <Link href="/team" className="text-sm font-medium text-muted-foreground hover:text-brand-navy transition-colors">
                        Our Team
                    </Link>
                    <Link href="/insights" className="text-sm font-medium text-muted-foreground hover:text-brand-navy transition-colors">
                        Insights
                    </Link>
                    <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-brand-navy transition-colors">
                        Contact
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/portal">
                        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                            Client Portal
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="brand" size="sm">
                            Book Consultation
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
