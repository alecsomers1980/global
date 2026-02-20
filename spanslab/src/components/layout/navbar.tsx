"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <header
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-border/40"
                    : "bg-white/50 backdrop-blur-sm"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-slate-DEFAULT rounded-lg flex items-center justify-center group-hover:bg-orange-DEFAULT transition-colors duration-300">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-slate-DEFAULT font-bold text-xl tracking-tight">
                            Spanslab
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-orange-DEFAULT",
                                    pathname === item.href
                                        ? "text-orange-DEFAULT font-semibold"
                                        : "text-slate-DEFAULT"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Button variant="default" className="bg-orange-DEFAULT hover:bg-orange-hover text-white">
                            Get Quote
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-md text-slate-DEFAULT hover:bg-slate-100 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-border shadow-lg animate-accordion-down">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "block px-3 py-4 rounded-md text-base font-medium transition-colors hover:bg-slate-50",
                                    pathname === item.href
                                        ? "text-orange-DEFAULT bg-orange-50/50"
                                        : "text-slate-DEFAULT"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-4 px-3">
                            <Button className="w-full bg-orange-DEFAULT hover:bg-orange-hover text-white">
                                Get Quote
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
