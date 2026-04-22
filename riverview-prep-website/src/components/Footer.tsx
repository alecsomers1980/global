import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = [
  {
    title: "School",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Admissions", href: "/admissions" },
      { name: "News & Events", href: "/news" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Parent Portal", href: "/parent-portal" },
      { name: "Staff Portal", href: "/staff" },
      { name: "Alumni", href: "/alumni" },
      { name: "Gallery", href: "/gallery" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-brand-green text-white pt-24 pb-12 overflow-hidden rounded-t-[3rem] md:rounded-t-[5rem]">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-4 group">
              <Image 
                src="/images/logo.png" 
                alt="Riverview Preparatory School Logo" 
                width={50} 
                height={50} 
                className="h-auto w-auto"
                priority
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight group-hover:text-brand-gold transition-colors">Riverview</span>
                <span className="font-light text-[10px] tracking-[0.2em] uppercase opacity-70 group-hover:text-brand-gold transition-colors">Preparatory School</span>
              </div>
            </Link>
            
            <p className="text-white/60 text-xs leading-relaxed max-w-xs">
              Fostering cognitive, physical, emotional, and social excellence in the heart of Malelane since 1996.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-brand-gold/20 transition-all hover:scale-110">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-brand-gold/20 transition-all hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-brand-gold">
                {group.title}
              </h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-brand-gold">
              Visit Us
            </h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
                <span>Malelane, Mpumalanga,<br />South Africa</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <span>+27 (0) 13 790 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <span>info@riverviewprep.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white/40 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Riverview Preparatory School. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
