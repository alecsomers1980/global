import { SITE } from '@/data/site';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  experience?: string;
  className?: string;
}

export function WhatsAppButton({ experience, className }: WhatsAppButtonProps) {
  const text = experience
    ? `Hi Kruger Panorama Experience, I would like a quote for the ${experience}.`
    : 'Hi Kruger Panorama Experience, I would like to enquire about a trip.';

  return (
    <a
      href={`${SITE.whatsappHref}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded border border-ink/15 px-6 py-3 text-xs font-semibold uppercase tracking-wide2 transition-colors hover:border-amber hover:text-amber-text-text ${className ?? ''}`}
    >
      <MessageCircle className="h-4 w-4" />
      Chat on WhatsApp
    </a>
  );
}
