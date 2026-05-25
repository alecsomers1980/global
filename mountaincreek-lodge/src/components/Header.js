"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname?.startsWith('/studio')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/accommodation', label: 'ACCOMMODATION' },
    { href: '/packages', label: 'PACKAGES' },
    { href: '/experiences', label: 'EXPERIENCES' },
    { href: '/gallery', label: 'GALLERY' },
    { href: '/red-litchi', label: 'RED LITCHI CAFE' },
    { href: '/contact', label: 'CONTACT US' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 glass-nav ${
          isScrolled ? 'scrolled' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Mountain Creek Lodge Home">
            <Image
              src="/images/logo.png"
              alt="Mountain Creek Lodge Logo"
              width={200}
              height={60}
              className="h-10 md:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans font-medium text-xs tracking-widest uppercase text-primary/80 hover:text-primary hover:scale-105 transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <Link
              href="https://www.nightsbridge.co.za/bridge/book?bbid=27902"
              className="hidden lg:inline-flex bg-primary text-linen border border-primary px-6 py-2.5 rounded-sm font-semibold tracking-wider text-xs shadow-sm hover:bg-transparent hover:text-primary transition-all duration-300 uppercase"
            >
              BOOK NOW
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center text-primary focus:outline-none"
              aria-label="Toggle Menu"
              aria-expanded={isMenuOpen}
            >
              <div className="flex flex-col space-y-2 transition-all duration-300">
                <span className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center ${isMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
                <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-current transition-all duration-300 origin-center ${isMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out lg:hidden ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Glassmorphic Background */}
        <div className="absolute inset-0 bg-linen/90 backdrop-blur-2xl shadow-2xl" />
        
        {/* Drawer Content */}
        <div className="relative h-full flex flex-col items-center justify-center pt-20 pb-10 px-6">
          <nav className="flex flex-col items-center space-y-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="font-serif text-3xl tracking-wider text-primary hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-12">
            <Link
              href="https://www.nightsbridge.co.za/bridge/book?bbid=27902"
              onClick={() => setIsMenuOpen(false)}
              className="bg-primary text-linen border border-primary px-8 py-3.5 rounded-sm font-semibold tracking-widest text-sm shadow-md hover:bg-transparent hover:text-primary transition-all duration-300 uppercase"
            >
              BOOK NOW
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
