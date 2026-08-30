/**
 * Form bot protection without a CAPTCHA.
 *
 * Two signals, both free and invisible: a honeypot field no human can see, and
 * how long the form was on screen. Neither blocks a determined attacker; both
 * stop the automated form-fillers that account for essentially all of the junk
 * a small site receives.
 *
 * Callers treat a bot result as SUCCESS and silently drop the submission — a
 * rejection message tells the bot exactly what to change.
 */

/** Bots fill and submit in well under a second; people do not. */
export const MIN_SUBMIT_MS = 2500;

export type BotGuardFields = {
  /** The honeypot. Named plausibly so autofill reaches for it. */
  company?: unknown;
  /** Date.now() captured when the form mounted. */
  renderedAt?: unknown;
};

export function isBot(fields: BotGuardFields, now: number = Date.now()): boolean {
  if (typeof fields.company === "string" && fields.company.trim() !== "") return true;
  if (fields.company != null && typeof fields.company !== "string") return true;

  const rendered = Number(fields.renderedAt);
  // A missing or unparseable timestamp means the field was stripped rather
  // than filled — which a real browser never does.
  if (!Number.isFinite(rendered)) return true;

  // renderedAt comes from the visitor's own clock, so a fast clock puts it in
  // the future and the elapsed time comes out negative. That is skew, not
  // speed: treating it as a bot would silently block a real customer from
  // checking out. Only a genuinely quick submission counts.
  const elapsed = now - rendered;
  return elapsed >= 0 && elapsed < MIN_SUBMIT_MS;
}
