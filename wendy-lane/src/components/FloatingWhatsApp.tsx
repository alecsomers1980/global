"use client";

import { usePathname } from "next/navigation";
import { BUSINESS } from "@/data/business";

/**
 * Persistent WhatsApp tap-target — WhatsApp is Wendy Lane's main sales channel,
 * so it should never be more than one thumb-tap away. Hidden on /quote, where the
 * quote builder has its own WhatsApp CTA (and a mobile total bar that would clash).
 */
export default function FloatingWhatsApp() {
  const pathname = usePathname();
  if (pathname === "/quote") return null;

  return (
    <a
      href={BUSINESS.whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`WhatsApp Wendy Lane on ${BUSINESS.whatsapp.display}`}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:bottom-6 sm:right-6"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.768.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.787-1.48-1.76-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.074-.149-.67-1.611-.918-2.205-.242-.579-.487-.5-.67-.51-.172-.009-.37-.012-.57-.012-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.478 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.078 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.032-1.378l-.36-.214-3.74.981.998-3.649-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.027 6.988 2.892a9.82 9.82 0 0 1 2.892 6.992c-.001 5.45-4.436 9.885-9.889 9.885m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">WhatsApp us</span>
    </a>
  );
}
