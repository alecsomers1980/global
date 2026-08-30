/** Compliance screen for anything that reaches a Rehoboth page.
 *
 *  Ported from dianas-bulbinella/src/lib/compliance.ts, with the terms that
 *  appear on Rehoboth's own printed labels added — those labels claim
 *  treatment of malaria, hepatitis and cancers, and describe the capsules as
 *  "IMMUNE BOOSTER". Under the Medicines and Related Substances Act 101 of
 *  1965 that wording makes the product a medicine, so none of it may appear on
 *  the website. See docs/label-claims-note-for-client.md.
 *
 *  Screening is deliberately over-sensitive: a false flag costs one edit, a
 *  miss publishes an illegal medical claim on a live shop.
 */

/** Disease / condition names — never publishable as a claim. */
const CONDITIONS = [
  "cancer",
  "cancers",
  "carcinoma",
  "tumour",
  "tumor",
  "malaria",
  "hepatitis",
  "diabetes",
  "diabetic",
  "hiv",
  "aids",
  "crohn",
  "ulcer",
  "ulcers",
  "hypertension",
  "high blood pressure",
  "blood sugar",
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
  "infection",
  "infections",
  "inflammation",
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
  "bacterial",
  "antiviral",
  "anti-viral",
  "viral",
  "antifungal",
  "anti-fungal",
  "fungal",
  "anti-inflammatory",
  "antiinflammatory",
  "clinically proven",
  "medically proven",
  "medicinal",
  "medicine",
  "prescription",
  "detoxes",
  "detoxifies",
  "boosts immune",
  "immune system",
  "immune booster",
  "immune boosting",
  "immune support",
];

/** Every screened term, in one list (exported for the admin UI + tests). */
export const COMPLIANCE_TERMS: string[] = [
  ...CONDITIONS,
  ...TREATMENT_VERBS,
  ...PHARMA_CLAIMS,
];

/** Word-boundary matcher per term. Built once.
 *  \b keeps "heal" from matching "healthy" and "cure" from matching "manicure";
 *  multi-word terms allow any run of whitespace or hyphen between the words. */
const PATTERNS: { term: string; re: RegExp }[] = COMPLIANCE_TERMS.map((term) => ({
  term,
  re: new RegExp(
    `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[\s-]+/g, "[\\s-]+")}\\b`,
    "i"
  ),
}));

export type ComplianceResult = {
  /** True when the text contains any prohibited term. */
  flagged: boolean;
  /** Which terms matched — shown to staff so they can see why. */
  hits: string[];
};

/** Screen free text against the prohibited-claims list. */
export function screen(...texts: (string | null | undefined)[]): ComplianceResult {
  const haystack = texts.filter(Boolean).join(" \n ");
  if (!haystack.trim()) return { flagged: false, hits: [] };

  const hits: string[] = [];
  for (const { term, re } of PATTERNS) {
    if (re.test(haystack)) hits.push(term);
  }
  return { flagged: hits.length > 0, hits };
}
