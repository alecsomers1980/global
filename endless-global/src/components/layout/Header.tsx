"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us' },
]

const serviceLinks = [
  { label: 'Investment Services', href: '/investment-services' },
  { label: 'Financial Services', href: '/financial-services' },
  { label: 'Trade Services', href: '/trade-services' },
  { label: 'Consulting Services', href: '/consulting-services' },
]

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => pathname === href

  const isServiceActive = () =>
    serviceLinks.some((s) => pathname.startsWith(s.href))

  const handleCloseMobile = () => setMobileOpen(false)

  const headerBg = scrolled
    ? 'bg-brand shadow-lg'
    : 'bg-transparent'

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${headerBg}`}
    >
      <div className="eg-container flex items-center justify-between h-24">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/images/logo-white.png"
            alt="Endless Global Point"
            className="h-16 w-auto"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-wide text-white transition-colors hover:text-white/80 ${
                isActive(link.href)
                  ? 'border-b-2 border-white font-semibold'
                  : 'border-b-2 border-transparent'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Services dropdown */}
          <div className="relative group">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              className={`text-sm uppercase tracking-wide text-white transition-colors hover:text-white/80 cursor-pointer ${
                isServiceActive()
                  ? 'border-b-2 border-white font-semibold'
                  : 'border-b-2 border-transparent'
              }`}
            >
              Services ▾
            </button>

            {/* Dropdown panel */}
            <div
              className={`absolute left-0 top-full mt-2 bg-white text-ink rounded shadow-lg py-2 min-w-56 ${
                dropdownOpen ? 'block' : 'hidden group-hover:block'
              }`}
            >
              {serviceLinks.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  onClick={() => setDropdownOpen(false)}
                  className={`block px-4 py-2 text-sm hover:bg-cream hover:text-brand transition-colors ${
                    isActive(service.href)
                      ? 'font-semibold underline'
                      : ''
                  }`}
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop BOOK NOW */}
          <Link
            href="/talk-to-us"
            className="hidden lg:inline-flex items-center justify-center border border-white/70 text-white px-5 py-2 rounded-md text-xs uppercase font-semibold tracking-wide hover:bg-white hover:text-brand transition-colors"
          >
            Book Now
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col space-y-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              mobileOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
              mobileOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`absolute top-full left-0 w-full bg-brand shadow-lg lg:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="eg-container flex flex-col py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleCloseMobile}
              className={`text-base uppercase tracking-wide text-white hover:text-white/80 transition-colors ${
                isActive(link.href)
                  ? 'font-semibold underline'
                  : ''
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="space-y-2">
            <span className="text-base uppercase tracking-wide text-white/70">
              Services
            </span>
            <div className="pl-4 space-y-2">
              {serviceLinks.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  onClick={handleCloseMobile}
                  className={`block text-sm uppercase tracking-wide text-white hover:text-white/80 transition-colors ${
                    isActive(service.href)
                      ? 'font-semibold underline'
                      : ''
                  }`}
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/talk-to-us"
            onClick={handleCloseMobile}
            className="inline-block border border-white/70 text-white px-5 py-2 rounded-md text-xs uppercase font-semibold tracking-wide hover:bg-white hover:text-brand transition-colors text-center mt-4"
          >
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
