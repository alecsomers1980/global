const MIN_SUBMIT_MS = 2500;

/** True if the submission looks automated: the hidden honeypot field was
 *  filled in (real visitors never see it), or the form was submitted faster
 *  than a human could type a message. */
export function isBotSubmission(input: { honeypot?: string; renderedAt?: number }): boolean {
  const honeypotTripped = Boolean(input.honeypot);
  const submittedTooFast =
    typeof input.renderedAt === "number" && Date.now() - input.renderedAt < MIN_SUBMIT_MS;
  return honeypotTripped || submittedTooFast;
}