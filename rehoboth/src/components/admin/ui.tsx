import Link from "next/link";

/**
 * The admin's shared surface language.
 *
 * The public site's geometry holds here — square panels and controls, hairline
 * borders, Marcellus for headings — so the two halves read as one product.
 * What makes this half feel like a tool rather than a shopfront is everything
 * else: the teal rail against a tinted field, a tighter type scale, and one
 * card treatment used on every screen.
 *
 * Most of these are class strings rather than components because the callers
 * already own their own layout and need to add to it.
 */

/* -------------------------------------------------------------- controls */

export const BTN_PRIMARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 bg-brand px-6 text-[12px] uppercase tracking-[0.14em] text-brand-ink transition-colors hover:bg-brand-night disabled:opacity-40";

export const BTN_SECONDARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 border border-hairline bg-white px-6 text-[12px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-brand hover:text-brand disabled:opacity-40";

export const BTN_QUIET =
  "inline-flex min-h-[38px] items-center justify-center gap-2 border border-hairline bg-white px-4 text-[12px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-brand hover:text-brand disabled:opacity-40";

/* ---------------------------------------------------------------- fields */

export const FIELD_LABEL = "block text-[11px] uppercase tracking-[0.18em] text-ink-mute";

export const FIELD =
  "min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-mute/70 focus:border-brand";

/** The one card treatment: square, hairline, lifted just enough to read as a panel. */
export const CARD =
  "border border-hairline bg-white shadow-[0_1px_2px_rgba(36,64,58,0.04),0_10px_28px_-20px_rgba(36,64,58,0.4)]";

/* ---------------------------------------------------------------- pieces */

/**
 * Status pill. Three tones only — done, in flight, wrong. Every status string
 * in this admin (order, stockist, message) maps onto one of those, so the
 * colour means the same thing on every screen.
 */
const DONE = new Set(["paid", "fulfilled", "sent", "approved", "answered", "on the site"]);
const WRONG = new Set(["failed", "cancelled", "declined"]);
// Not a warning and not an achievement — a product being off the site is
// simply a state, and colouring it amber would make nine ordinary rows look
// like nine problems.
const QUIET = new Set(["hidden", "contacted"]);

export function StatusPill({ status }: { status: string }) {
  const tone = DONE.has(status)
    ? "bg-brand/15 text-brand-night"
    : WRONG.has(status)
      ? "bg-red-700/10 text-red-800"
      : QUIET.has(status)
        ? "bg-ink/8 text-ink-soft"
        : "bg-amber-500/15 text-amber-800";

  return (
    <span
      className={`inline-flex shrink-0 items-center px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${tone}`}
    >
      {status}
    </span>
  );
}

/**
 * Every admin screen opens the same way: eyebrow, title, a line of
 * orientation, and the screen's own action parked top right. The action is a
 * node because on some screens it is a link and on others a form button.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5 border-b border-hairline pb-8">
      <div className="min-w-0">
        {eyebrow && <p className="text-[11px] uppercase tracking-[0.24em] text-brand">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** A headline figure, for the dashboard. */
export function StatCard({
  label,
  value,
  href,
  note,
}: {
  label: string;
  value: number | string;
  href?: string;
  note?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-mute">{label}</p>
      {/* Body face, not the display serif: Marcellus draws a wide round zero
          that reads as a letter O at this size, and "0 orders to send" is the
          most common thing this tile ever says. Tabular figures keep the four
          tiles aligned. */}
      <p className="mt-4 text-5xl leading-none font-light text-ink [font-variant-numeric:tabular-nums]">
        {value}
      </p>
      {/* Reserved height, so a row of tiles does not jump about when only one
          of them has something to add. */}
      <p className="mt-3 min-h-[18px] text-[13px] text-brand">{note ?? ""}</p>
    </>
  );

  return href ? (
    <Link href={href} className={`${CARD} block p-7 transition-colors hover:border-brand`}>
      {body}
    </Link>
  ) : (
    <div className={`${CARD} p-7`}>{body}</div>
  );
}

/** Card wrapper for the list and form screens. The header is optional. */
export function Card({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${CARD} ${className}`}>
      {(title || description) && (
        <div className="border-b border-hairline px-7 py-6">
          {title && <h2 className="font-display text-xl text-ink">{title}</h2>}
          {description && (
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/** One "nothing here yet" state, so six screens do not each invent their own. */
export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 px-7 py-20 text-center">
      <p className="text-[15px] text-ink-mute">{message}</p>
      {action}
    </div>
  );
}

/**
 * Feedback after a save. Each screen had grown its own pair of these, and a
 * refusal should not look subtly different depending which page you are on.
 * The role differs by tone on purpose: an error interrupts a screen reader, a
 * confirmation waits its turn.
 */
export function Notice({ tone, children }: { tone: "error" | "ok"; children: React.ReactNode }) {
  return tone === "error" ? (
    <div role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-[14px] text-red-800">
      {children}
    </div>
  ) : (
    <p role="status" className="border-l-2 border-brand bg-brand-wash px-4 py-3 text-[14px] text-brand-night">
      {children}
    </p>
  );
}

/** Status filters — orders, stockists and messages all need the same row. */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={
            value === o.value
              ? "min-h-[40px] bg-brand-night px-5 text-[12px] uppercase tracking-[0.12em] text-brand-ink"
              : "min-h-[40px] border border-hairline bg-white px-5 text-[12px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-brand hover:text-brand"
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
