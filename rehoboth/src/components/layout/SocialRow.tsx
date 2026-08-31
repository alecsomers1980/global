import { activeSocial, type SocialLinks } from "@/lib/social";

/**
 * The social icons in the footer and on the contact page.
 *
 * Renders nothing at all when no link is set — an empty row of icons pointing
 * nowhere looks like a broken site, not a quiet one.
 */
export function SocialRow({
  links,
  tone = "light",
}: {
  links: SocialLinks;
  tone?: "light" | "dark";
}) {
  const items = activeSocial(links);
  if (items.length === 0) return null;

  const colour =
    tone === "dark"
      ? "text-white/70 hover:text-white"
      : "text-ink-soft hover:text-brand";

  return (
    <ul className="flex flex-wrap items-center gap-4">
      {items.map((item) => (
        <li key={item.key}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Rehoboth Herbal Co. on ${item.label}`}
            className={`flex h-11 w-11 items-center justify-center transition-colors ${colour}`}
          >
            {ICONS[item.key]}
          </a>
        </li>
      ))}
    </ul>
  );
}

/* Simple filled marks at 20px — they sit beside 13px footer text and must not
   shout. Paths are drawn on a 24-unit grid. */
const ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V6.9c0-.7.2-1.1 1.2-1.1H16.5V3.1c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2H8.6v2.9h2.5V21H14v-9.6h2.4l.4-2.9H14z" />
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-.9 1.6-.6 2.6.4 1.4 1.3 2.7 2.5 3.7 1.6 1.4 3 1.9 4 2 .6.1 1.2 0 1.7-.3.4-.3.7-.7.8-1.2.1-.3.1-.5 0-.6l-.4-.2z" />
    </svg>
  ),
  tiktok: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 3h-2.7v12.1a2.4 2.4 0 1 1-2-2.4V10a5.3 5.3 0 1 0 4.7 5.3V9.1c.9.6 2 1 3.2 1V7.5a3.7 3.7 0 0 1-3.2-4.5z" />
    </svg>
  ),
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.6 7.2c-.2-.9-.9-1.5-1.7-1.7C18.3 5 12 5 12 5s-6.3 0-7.9.5c-.8.2-1.5.8-1.7 1.7C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.5 1.7 1.7C5.7 19 12 19 12 19s6.3 0 7.9-.5c.8-.2 1.5-.8 1.7-1.7.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.9 8.2H4V20h2.9V8.2zM5.4 3.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20 13.5c0-3.1-1.7-4.6-3.9-4.6-1.8 0-2.6 1-3 1.7V8.2H10V20h3v-6.4c0-1.3.6-2.1 1.7-2.1 1 0 1.6.7 1.6 2.1V20H20v-6.5z" />
    </svg>
  ),
};
