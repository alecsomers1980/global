'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, ChevronDown, Phone } from 'lucide-react';

export default function Header() {
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Projects', href: '/projects' },
        { name: 'Shop', href: '/shop' },
        { name: 'News', href: '/news' },
        { name: 'Track Order', href: '/order/track' },
        { name: 'Contact', href: '/contact' },
    ];

    const services = [
        { name: 'Billboards', href: '/services/billboards' },
        { name: 'Building wraps & XXL needs', href: '/services/building-wraps' },
        { name: 'Bulk orders & screen printing', href: '/services/bulk-orders-screen-printing' },
        { name: 'Fleet maintenance & branding', href: '/services/fleet-maintenance-branding' },
        { name: 'Promo Items', href: '/services/promo-items' },
        { name: 'Wall art', href: '/services/wall-art' },
        { name: 'Set building & strike', href: '/services/set-building-strike' },
        { name: '3D Renders', href: '/services/3d-renders' },
        { name: 'Tangible Visual Texture', href: '/services/tangible-visual-texture' },
        { name: 'Plant/Mines Regulatory Signs', href: '/services/regulatory-signs' },
        { name: 'Site Activations', href: '/services/site-activations' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-4 py-6 transition-all duration-300">
            <div className={`max-w-7xl mx-auto rounded-[2rem] px-8 py-3 flex items-center justify-between shadow-2xl transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md py-2 border border-black/5' : 'glass-card'}`}>
                {/* Logo */}
                <Link href="/" className="flex items-center" onClick={closeMenu}>
                    <div className="relative h-12 w-40">
                        <Image
                            src="/aloe-logo.png"
                            alt="Aloe Signs Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-10">
                    <Link href="/" className={`text-sm font-semibold tracking-wide hover:text-aloe-green hover:scale-105 transition-all ${isScrolled ? 'text-charcoal' : 'text-white/80'}`}>
                        HOME
                    </Link>
                    <Link href="/about" className={`text-sm font-semibold tracking-wide hover:text-aloe-green hover:scale-105 transition-all ${isScrolled ? 'text-charcoal' : 'text-white/80'}`}>
                        ABOUT
                    </Link>

                    <div className="relative group">
                        <button className={`text-sm font-semibold tracking-wide hover:text-aloe-green transition-all flex items-center gap-1 ${isScrolled ? 'text-charcoal' : 'text-white/80'}`}>
                            SERVICES
                            <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-black/95 backdrop-blur-3xl">
                                <div className="py-2 grid gap-1 p-2">
                                    {services.map((service) => (
                                        <Link
                                            key={service.href}
                                            href={service.href}
                                            className="block px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-aloe-green rounded-xl transition-all"
                                        >
                                            {service.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link href="/projects" className={`text-sm font-semibold tracking-wide hover:text-aloe-green hover:scale-105 transition-all ${isScrolled ? 'text-charcoal' : 'text-white/80'}`}>
                        PROJECTS
                    </Link>

                    <Link href="/shop" className={`text-sm font-semibold tracking-wide hover:text-aloe-green hover:scale-105 transition-all ${isScrolled ? 'text-charcoal' : 'text-white/80'}`}>
                        SHOP
                    </Link>

                    <Link href="/news" className={`text-sm font-semibold tracking-wide hover:text-aloe-green hover:scale-105 transition-all ${isScrolled ? 'text-charcoal' : 'text-white/80'}`}>
                        NEWS
                    </Link>
                </nav>

                {/* Right Side */}
                <div className="hidden lg:flex items-center gap-6">
                    <a href="tel:0116932600" className="flex items-center gap-2 group">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isScrolled ? 'bg-charcoal/5 group-hover:bg-aloe-green group-hover:text-black text-charcoal' : 'bg-white/5 group-hover:bg-aloe-green group-hover:text-black text-white'}`}>
                            <Phone className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-bold tracking-tight transition-colors ${isScrolled ? 'text-charcoal' : 'text-white/90'}`}>011 693 2600</span>
                    </a>

                    <Link
                        href="/shop/cart"
                        className={`relative p-2.5 rounded-full transition-all group ${isScrolled ? 'bg-charcoal/5 hover:bg-charcoal/10' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        <ShoppingCart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isScrolled ? 'text-charcoal' : 'text-white/90'}`} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-aloe-green text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/artwork"
                        className="px-8 py-3 bg-aloe-green text-charcoal text-sm font-black rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,51,0.4)] transition-all active:scale-95"
                    >
                        UPLOAD ARTWORK
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden flex items-center gap-4">
                    <Link
                        href="/shop/cart"
                        className="relative p-2.5 bg-white/5 rounded-full"
                    >
                        <ShoppingCart className="w-5 h-5 text-white" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-aloe-green text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={toggleMenu}
                        className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'bg-charcoal/5 text-charcoal' : 'bg-white/5 text-white'}`}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-[#0B0E0D]/95 backdrop-blur-xl z-[90] lg:hidden transition-all duration-500 flex flex-col items-center justify-center ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                <nav className="flex flex-col items-center gap-8 p-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            className="text-3xl font-black text-white hover:text-aloe-green transition-all tracking-tighter"
                        >
                            {link.name.toUpperCase()}
                        </Link>
                    ))}

                    <Link
                        href="/artwork"
                        onClick={closeMenu}
                        className="mt-4 px-12 py-5 bg-aloe-green text-black font-black rounded-full text-xl shadow-2xl"
                    >
                        UPLOAD ARTWORK
                    </Link>
                </nav>
            </div>
        </header>
    );
}

