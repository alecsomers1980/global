/** Compliance screen for user-generated text (currently: product reviews).
 *
 *  Publishing a review is the brand endorsing it, so a review that claims a
 *  product cured a disease carries the same SAHPRA / Medicines Act / ARB
 *  exposure as our own copy would. See docs/compliance-rules.md §2 "Never use"
 *  — this list is the machine-readable mirror of that section and MUST be kept
 *  in sync with it.
 *
 *  A hit never deletes anything: it forces the review into the `pending`
 *  moderation queue so a human decides. Screening is deliberately
 *  over-sensitive — a false flag costs staff one click, a miss publishes an
 *  illegal medical claim.
 */

/** Disease / condition names — never publishable as a claim. */
const CONDITIONS = [
  "cancer",
  "carcinoma",
  "tumour",
  "tumor",
  "diabetes",
  "diabetic",
  "hiv",
  "aids",
  "crohn",
  "ulcer",
  "ulcers",
  "hypertension",
  "high blood pressure",
  "cholesterol",
  "arthritis",
  "asthma",
  "psoriasis",
  "eczema",
  "menopause",
  "andropause",
  "thyroid",
  "epilepsy",
  "epileptic",
  "depression",
  "anxiety",
  "stroke",
  "covid",
  "shingles",
  "candida",
  "fungus",
];

/** Action verbs implying medical treatment. */
const TREATMENT_VERBS = [
  "cure",
  "cures",
  "cured",
  "curing",
  "heal",
  "heals",
  "healed",
  "healing",
  "treat",
  "treats",
  "treated",
  "treatment",
  "prevent",
  "prevents",
  "prevented",
  "kill",
  "kills",
  "killed",
  "eliminate",
  "eliminates",
  "eliminated",
  "reverse",
  "reverses",
  "reversed",
];

/** Pharma-style / efficacy claims. */
const PHARMA_CLAIMS = [
  "antibacterial",
  "anti-bacterial",
  "antiviral",
  "anti-viral",
  "antifungal",
  "anti-fungal",
  "anti-inflammatory",
  "antiinflammatory",
  "clinically proven",
  "medically proven",
  "medicinal",
  "medicine",
  "prescription",
  "helicobacter",
  "pylori",
  "detoxes",
  "detoxifies",
  "boosts immune",
  "immune system",
  "big pharma",
];

/** Every screened term, in one list (exported for the admin UI + tests). */
export const COMPLIANCE_TERMS: string[] = [
  ...CONDITIONS,
  ...TREATMENT_VERBS,
  ...PHARMA_CLAIMS,
];

/** Word-boundary matcher per term. Built once.
 *  \b keeps "heal" from matching "healthy" and "cure" from matching "manicure";
 *  multi-word terms allow any run of whitespace between the words. */
const PATTERNS: { term: string; re: RegExp }[] = COMPLIANCE_TERMS.map((term) => ({
  term,
  re: new RegExp(
    `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[\s-]+/g, "[\\s-]+")}\\b`,
    "i"
  ),
}));

export type ComplianceResult = {
  /** True when the text contains any prohibited term. Forces `pending`. */
  flagged: boolean;
  /** Which terms matched — shown to staff in the moderation queue. */
  hits: string[];
};

/** Screen free text against the prohibited-claims list.
 *  Returns every distinct term that matched, so staff can see *why* it's held. */
export function screen(...texts: (string | null | undefined)[]): ComplianceResult {
  const haystack = texts.filter(Boolean).join(" \n ");
  if (!haystack.trim()) return { flagged: false, hits: [] };

  const hits: string[] = [];
  for (const { term, re } of PATTERNS) {
    if (re.test(haystack)) hits.push(term);
  }
  return { flagged: hits.length > 0, hits };
}
