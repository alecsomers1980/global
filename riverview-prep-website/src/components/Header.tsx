"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Admissions", href: "/admissions" },
  { name: "Academics", href: "/academics" },
  { name: "Co-Curriculum", href: "/beyond-the-classroom" },
  { name: "News", href: "/news" },
  { name: "Alumni", href: "/alumni" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 50,
      onEnter: () => setIsScrolled(true),
      onLeaveBack: () => setIsScrolled(false),
    });

    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (isScrolled) {
      gsap.to(".floating-island", {
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        paddingTop: "0.75rem",
        paddingBottom: "0.75rem",
        borderColor: "rgba(27, 94, 32, 0.1)",
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.to(".nav-link", { color: "#1B5E20", duration: 0.4 });
    } else {
      gsap.to(".floating-island", {
        backgroundColor: "transparent",
        backdropFilter: "blur(0px)",
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        borderColor: "transparent",
        boxShadow: "none",
        duration: 0.6,
        ease: "power3.out",
      });
      gsap.to(".nav-link", { color: "#FFFFFF", duration: 0.4 });
    }
  }, [isScrolled]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
      <div
        className={cn(
          "floating-island pointer-events-auto flex items-center justify-between gap-10 px-10 max-w-[95vw]",
          isScrolled ? "mt-4" : "mt-0"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Image
            src={isScrolled ? "/images/logo.png" : "/images/logo_t.png"}
            alt="Riverview Preparatory School"
            width={140}
            height={40}
            className="header-logo w-auto h-16 md:h-20 lg:h-32 object-contain transition-opacity duration-500"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7 flex-shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="nav-link text-xs font-semibold uppercase tracking-widest hover:text-brand-gold transition-colors whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link
            href="/admissions"
            className="magnetic-button text-[10px] uppercase tracking-widest py-2 px-6 whitespace-nowrap"
          >
            Apply Now
          </Link>
          <button
            className="lg:hidden p-2 text-brand-green"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
