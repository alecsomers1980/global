export type NavLink = { label: string; href: string };
export type NavGroup = NavLink & { children?: NavLink[] };

export const NAV_GROUPS: NavGroup[] = [
  { label: "Home", href: "/" },
  {
    label: "Wills & Estates",
    href: "/wills-estates/administration-of-deceased-estates",
    children: [
      { label: "Administration of Deceased Estates", href: "/wills-estates/administration-of-deceased-estates" },
      { label: "Drafting of Wills", href: "/wills-estates/drafting-of-wills" },
      { label: "Setting up Trusts / Appointment of Trustees", href: "/wills-estates/setting-up-trusts-appointment-of-trustees" },
      { label: "Estate Planning", href: "/wills-estates/estate-planning" },
      { label: "Contingency Plans for SME's", href: "/wills-estates/contingency-plans-for-smes" },
      { label: "Estate & Wills Related Litigation", href: "/wills-estates/estate-wills-related-litigation" },
    ],
  },
  {
    label: "Property Law",
    href: "/property-law/conveyancing",
    children: [
      { label: "Conveyancing", href: "/property-law/conveyancing" },
      { label: "Property Transfer Cost Calculator", href: "/property-law/property-transfer-cost-calculator" },
      { label: "Contracts", href: "/property-law/contracts" },
      { label: "Lease Agreements", href: "/property-law/lease-agreements" },
      { label: "Sureties", href: "/property-law/sureties" },
      { label: "Power of Attorney", href: "/property-law/power-of-attorney" },
      { label: "Property Dispute Litigation", href: "/property-law/property-dispute-litigation" },
    ],
  },
  {
    label: "Litigation",
    href: "/litigation/divorces",
    children: [
      { label: "Divorces", href: "/litigation/divorces" },
      { label: "Property Disputes", href: "/litigation/property-disputes" },
      { label: "Evictions", href: "/litigation/evictions" },
      { label: "Debt Collection", href: "/litigation/debt-collection" },
      { label: "Consumer Protection Act", href: "/litigation/consumer-protection-act" },
      { label: "Personal Injuries", href: "/litigation/personal-injuries" },
      { label: "High Court Applications", href: "/litigation/high-court-applications" },
    ],
  },
  {
    label: "Law of Contract",
    href: "/law-of-contract/antenuptial-contracts",
    children: [
      { label: "Antenuptial (PreNup) Contracts", href: "/law-of-contract/antenuptial-contracts" },
      { label: "Service Level Agreements", href: "/law-of-contract/service-level-agreements" },
      { label: "Cohabitation Agreements", href: "/law-of-contract/cohabitation-agreements" },
      { label: "Partnership Agreements", href: "/law-of-contract/partnership-agreements" },
    ],
  },
  { label: "Notary", href: "/notary" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];
