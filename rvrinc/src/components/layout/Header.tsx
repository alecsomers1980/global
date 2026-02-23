"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";

const navLinks = [
    { href: "/about", label: "About Us" },
    { href: "/about#expertise", label: "Areas of Expertise" },
    { href: "/about#team", label: "Our Team" },
    { href: "/insights", label: "Insights" },
    { href: "/contact", label: "Contact" },
];

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-10 w-48">
                        <Image
                            src="/images/logo.png"
                            alt="Roets & Van Rensburg"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-brand-navy transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Button */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/case-update">
                        <Button variant="brand" size="sm">
                            Update on Your Case
                        </Button>
                    </Link>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur">
                    <nav className="container py-4 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-brand-navy hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-border/40 mt-2 pt-3 flex flex-col gap-2 px-4">
                            <Link href="/case-update" onClick={() => setMobileOpen(false)}>
                                <Button variant="brand" size="sm" className="w-full">
                                    Update on Your Case
                                </Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
