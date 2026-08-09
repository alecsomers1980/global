import { ExternalLink } from 'lucide-react';

interface PartnerCardProps {
  name: string;
  location: string;
  website: string;
  blurb: string;
  children?: React.ReactNode;
}

export function PartnerCard({ name, location, website, blurb, children }: PartnerCardProps) {
  return (
    <div className="grid gap-8 rounded border border-ink/10 bg-white p-8 md:grid-cols-2">
      <div>
        <h3>{name}</h3>
        <p className="mt-1 text-xs uppercase tracking-wide3 text-text/70">{location}</p>
        <p className="mt-4 text-sm leading-relaxed text-text/70 normal-case">{blurb}</p>
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-4 text-sm text-amber-text hover:text-amber-text-text/80 transition-colors"
        >
          Visit Website
          <ExternalLink size={14} />
        </a>
      </div>
      <div>
        <p className="mb-3 text-xs uppercase tracking-wide3 text-text/70">
          Check availability
        </p>
        <div className="rounded border border-ink/10 bg-[#FAFAFA] p-4">
          {/*
            The frame exists because the embedded widget is third-party and cannot be restyled to
            match, so the seam is made deliberate.
          */}
          {children}
        </div>
      </div>
    </div>
  );
}
