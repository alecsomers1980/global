import { BUSINESS } from "@/data/business";
import { DELIVERY_NOTE, MAINTENANCE_NOTE, PRICE_LIST_DATE } from "@/data/pricing";

/**
 * Every answer here is grounded in the published price list, the Frame Built
 * spec, or BUSINESS data — nothing is invented. Questions we cannot answer from
 * source (lead times, deposit terms, warranty period, foundation requirements)
 * are deliberately absent until the client confirms them.
 *
 * Single source of truth: the visible accordion and the FAQPage JSON-LD both
 * read from this array, so the rich result can never drift from the page.
 */
export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "Do your prices include VAT?",
    answer:
      `Yes. Every price on this site includes VAT at 15%, and comes straight off our ${PRICE_LIST_DATE} price list — these are real prices, not estimates.`,
  },
  {
    question: "Is delivery included in the price?",
    answer:
      `No — ${DELIVERY_NOTE.toLowerCase()} Tell us which town you're building in when you send your quote and we'll come back to you with the delivery cost for your area.`,
  },
  {
    question: "Which areas do you deliver to?",
    answer: `We deliver and assemble across the Lowveld: ${BUSINESS.serviceAreas.join(", ")}. If you're just outside these areas, ask us — we'll usually still quote you.`,
  },
  {
    question: "Do you assemble it on site, or do I do that myself?",
    answer:
      "We assemble it. Our own long-serving team leaders take the unit to your site, deliver it and put it up — it isn't a flat-pack you're left to build yourself.",
  },
  {
    question: "What is included as standard on a Wendy house?",
    answer:
      "Termite poison is applied under the Wendy at the time of construction, and the outside walls are coated with wood sealant. All prices include VAT at 15%.",
  },
  {
    question: "What maintenance does a timber building need?",
    answer: `${MAINTENANCE_NOTE} Re-coating the outside once a year is what keeps the timber protected against Lowveld sun and rain, and it's the single biggest factor in how long your building lasts. Our timber care guide walks through what we treat before delivery and what to check each season.`,
  },
  {
    question: "What is the difference between a Wendy house and a Frame Built cabin?",
    answer:
      "A Wendy house is a simple timber utility structure — storage, a guard hut, a site office, a storeroom. A Frame Built cabin is a different building system altogether: it follows formal building regulations and performs like a conventional brick-and-mortar building. More than half the homes in the developed world are timber frame.",
  },
  {
    question: "Are electrics and plumbing included in a Frame Built cabin?",
    answer:
      "No. Electrics and plumbing are excluded so you can arrange them with your own contractors and keep control of that cost. Furniture, fittings and sanitary ware shown on our floor plans are illustrative only and are not included.",
  },
  {
    question: "Can I see prices without phoning for a quote?",
    answer:
      "Yes — that's the point. Our full price list is published on this site, and the quote builder lets you pick your size, window, veranda and extras and see the total instantly before you talk to anyone.",
  },
];
