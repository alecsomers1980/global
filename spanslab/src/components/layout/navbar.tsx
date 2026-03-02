"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "#", isDropdown: true },
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
];

const productLinks = [
    { name: "Cement Stock Bricks", href: "/products/cement-stock-bricks" },
    { name: "Maxi Bricks", href: "/products/maxi-bricks" },
    { name: "Hollow Blocks", href: "/products/hollow-blocks" },
    { name: "Rib & Block Slab", href: "/products/rib-and-block-system" },
    { name: "50mm Bevel Paving", href: "/products/50mm-bevel" },
    { name: "60mm Interlock Paving", href: "/products/60mm-interlock" },
    { name: "80mm Interlock Paving", href: "/products/80mm-interlock" },
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
                "fixed top-0 w-full z-50 transition-all duration-500",
                scrolled
                    ? "bg-white/95 backdrop-blur-xl shadow-md border-b border-border/40 h-20"
                    : "bg-transparent h-20"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <img
                            src="/images/Spanslab-Logo.png"
                            alt="Spanslab Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            item.isDropdown ? (
                                <div key={item.name} className="relative group">
                                    <button
                                        className={cn(
                                            "text-sm font-medium transition-colors hover:text-orange-DEFAULT flex items-center",
                                            pathname.startsWith("/products")
                                                ? "text-orange-DEFAULT font-semibold"
                                                : "text-slate-DEFAULT"
                                        )}
                                    >
                                        {item.name}
                                        <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute left-0 top-full mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 divide-y divide-gray-100 z-50">
                                        {productLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-orange-DEFAULT transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
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
                            )
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
                            item.isDropdown ? (
                                <div key={item.name} className="space-y-1 py-2">
                                    <div className="block px-3 text-base font-medium text-slate-700">
                                        {item.name}
                                    </div>
                                    <div className="pl-4 space-y-1 mt-2">
                                        {productLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                className={cn(
                                                    "block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-50",
                                                    pathname === link.href
                                                        ? "text-orange-DEFAULT bg-orange-50/50"
                                                        : "text-slate-DEFAULT"
                                                )}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
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
                            )
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
