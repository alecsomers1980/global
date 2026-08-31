"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchSocialLinks } from "@/app/_actions/social";

/**
 * Frieda's number, and the button's floor.
 *
 * Unlike the social icons in the footer, this one does not disappear when the
 * admin leaves the WhatsApp box empty — a shop should always be reachable, and
 * WhatsApp is how South African customers actually make contact. Setting a
 * link in Settings overrides it, verbatim, so a business number or a click-to-
 * chat link with its own wording both work.
 */
const DEFAULT_HREF =
  "https://wa.me/27828249023?text=" +
  encodeURIComponent("Hello Rehoboth Herbal Co., I have a question about your products.");

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [href, setHref] = useState(DEFAULT_HREF);

  useEffect(() => {
    fetchSocialLinks()
      .then((links) => {
        if (links.whatsapp) setHref(links.whatsapp);
      })
      .catch(() => {
        // The default number is already in state; a failed lookup should not
        // take the button away.
      });
  }, []);

  // The admin is a tool, not a shopfront — a chat bubble floating over the
  // orders table is in the way.
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message Rehoboth Herbal Co. on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_-4px_rgba(16,32,28,0.45)] transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-night md:bottom-7 md:right-7"
    >
      {/* WhatsApp's own glyph. The green is theirs too — this is the one
          control on the site where being recognisable beats being on-brand. */}
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-.9 1.6-.6 2.6.4 1.4 1.3 2.7 2.5 3.7 1.6 1.4 3 1.9 4 2 .6.1 1.2 0 1.7-.3.4-.3.7-.7.8-1.2.1-.3.1-.5 0-.6l-.4-.2z" />
      </svg>
    </a>
  );
}
