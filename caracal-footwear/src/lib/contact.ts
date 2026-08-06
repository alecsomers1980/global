const MIN_SUBMIT_MS = 2500;

/**
 * True if this submission looks automated: the honeypot field was filled
 * (real visitors never see it), or the form was submitted faster than a
 * human could plausibly fill it in. Mirrors the pattern already proven in
 * the Lublaw ContactForm/api/contact route.
 */
export function isSpamSubmission(honeypot: string, renderedAt: number, now: number): boolean {
  if (honeypot.trim().length > 0) return true;
  return now - renderedAt < MIN_SUBMIT_MS;
}
