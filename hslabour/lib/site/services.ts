export type Service = {
  slug: string;
  locationSlug: string;
  name: string;
  locationName: string;
  tagline: string;
  challenge: string;
  solution: string;
  description: string;
  keywords: string[];
  faqs: { q: string; a: string }[];
};

const recruitment: Service = {
  slug: "recruitment",
  locationSlug: "recruitment-agency",
  name: "Permanent & Contract Recruitment",
  locationName: "Recruitment Agency",
  tagline: "Connecting great employers with skilled, reliable people across South Africa.",
  challenge:
    "Finding the right person for the job is time-consuming, expensive, and risky when a hire doesn’t work out.",
  solution:
    "With 25+ years' hands‑on experience, H&S Labour Brokers sources, screens, and places qualified permanent and contract candidates across multiple sectors. Every placement is backed by a guaranteed replacement period, giving employers peace of mind.",
  description:
    "Our recruitment consultants understand the South African labour market and work closely with you to fill permanent, contract, and project-based roles. We handle everything from advertising and shortlisting to reference checks and offer management, so you can focus on running your business. Because we’ve been doing this since 1998, we know how to match the right person to the right role—and we stand behind every placement with a guarantee. If the person we place doesn’t work out within the agreed period, we find a replacement at no extra cost.",
  keywords: [
    "recruitment agency South Africa",
    "permanent recruitment",
    "contract recruitment",
    "staffing solutions",
    "job placements",
    "professional recruitment"
  ],
  faqs: [
    {
      q: "What kind of roles do you recruit for?",
      a: "We recruit across a broad range of sectors—from general labour and blue‑collar roles to skilled technical, administrative, and middle‑management positions. If you have a vacancy, we can usually help."
    },
    {
      q: "How long does the replacement guarantee last?",
      a: "The length of the guarantee depends on the role and the agreed terms, but it is a standard part of our permanent placement service. If the candidate leaves or doesn’t perform within that window, we restart the search at no cost."
    },
    {
      q: "Do you handle the interviews and assessments?",
      a: "Yes—we can shortlist, conduct structured interviews, and, where required, arrange skills, psychometric, or other assessments so that you only see the candidates who are truly ready."
    },
    {
      q: "Is there a fee for contract staffing?",
      a: "Contract placements are typically billed on an hourly or monthly rate that covers the candidate’s salary and our service fee. You get a clear, all‑in rate with no hidden costs."
    }
  ]
};

const tes: Service = {
  slug: "tes",
  locationSlug: "tes-provider",
  name: "Temporary Employment Services (TES)",
  locationName: "TES Provider",
  tagline: "Flexible temporary and contract workers—compliant, productive, and hassle‑free.",
  challenge:
    "Companies need to scale their workforce quickly while staying compliant with labour laws. Managing statutory deductions, contracts, and industrial relations for a variable workforce is complex and exposes employers to significant risk.",
  solution:
    "H&S Labour Brokers becomes the legal employer of the temporary workers we supply. We handle all payroll, UIF, PAYE, SDL, leave, and IR matters, freeing you from compliance headaches. In terms of the Labour Relations Act s198A, we manage the deeming provision and joint‑and‑several liability so that you remain protected.",
  description:
    "Temporary Employment Services (TES), often called labour broking, is a dynamic way to meet short‑term, seasonal, or project‑specific staffing needs without adding permanent headcount. H&S Labour Brokers recruits, employs, and manages the temporary workers on your behalf. We take care of the entire employment relationship—payroll, statutory deductions, employee relations, discipline, and all labour law obligations. Crucially, under s198A of the LRA, workers earning below the BCEA threshold may be deemed the client’s employee after three months; our structures and IR protocols are designed to manage that transition in a way that minimises your risk and ensures compliance.",
  keywords: [
    "temporary employment services",
    "labour broker South Africa",
    "TES provider",
    "temp staff solutions",
    "contract workers",
    "workforce compliance"
  ],
  faqs: [
    {
      q: "What is the difference between TES and ordinary temp agencies?",
      a: "TES providers, as labour brokers, legally employ the workers we place with you. We carry the full employer responsibilities—payroll, tax, UIF, disciplinary processes—whereas many temp agencies merely match candidates and leave compliance to the client."
    },
    {
      q: "What happens if a temp worker needs to be disciplined or dismissed?",
      a: "Because we are the employer, our IR specialists handle the process—from issuing warnings to chairing disciplinary hearings—in line with the Labour Relations Act. You simply report the issue and we manage it."
    },
    {
      q: "How do you handle the three‑month deeming provision?",
      a: "We closely monitor assignments approaching the three‑month mark and work with you to structure the arrangement in a compliant way—whether that means rotating staff, converting the person to a fixed‑term contract, or absorbing them onto your payroll under our guidance. Our goal is to prevent unintended employment relationships and the associated joint‑and‑several liability."
    },
    {
      q: "Are the workers you supply covered by your UIF and COIDA registration?",
      a: "Yes. All temporary workers are registered with the Department of Employment and Labour and the Compensation Fund through H&S Labour Brokers. You don’t have to worry about payroll deductions or injury‑on‑duty claims."
    }
  ]
};

const payroll: Service = {
  slug: "payroll",
  locationSlug: "payroll-services",
  name: "Payroll & Timesheets",
  locationName: "Payroll Services",
  tagline: "Accurate, compliant payroll that keeps your team happy and your business safe.",
  challenge:
    "Processing payroll, capturing timesheets, and staying current with SARS and labour‑law requirements takes hours and leaves no room for error—one mistake can trigger penalties and damage employee trust.",
  solution:
    "H&S Labour Brokers takes over the heavy lifting: we capture hours, calculate gross‑to‑net pay, deduct PAYE, UIF and SDL, issue payslips, and provide detailed monthly reports. Every step is checked, and we keep you compliant with changing legislation.",
  description:
    "Payroll is the heartbeat of any employer‑employee relationship. Our dedicated payroll service removes the administrative burden from your business. We receive timesheets (paper, Excel, or from a clocking system), accurately capture every hour, apply the correct tax tables, deductions, and employer contributions, and generate digital payslips. At month‑end you receive a full reconciliation report, EMP201 summaries, and UIF declarations. Because we are a labour broker, we understand the unique payroll requirements of temporary and contract staff, but we also serve clients who simply want to outsource payroll for their permanent workforce.",
  keywords: [
    "payroll services South Africa",
    "outsourced payroll",
    "timesheet processing",
    "PAYE UIF SDL",
    "payslip generation",
    "payroll compliance"
  ],
  faqs: [
    {
      q: "Do I still need a payroll administrator if I use your service?",
      a: "No—you can either reduce or repurpose that role. You send us the hours worked, and we handle everything from gross pay to net pay and all statutory filings. You remain fully compliant without a dedicated payroll person."
    },
    {
      q: "How do you keep my payroll data secure?",
      a: "We use password‑protected systems, encrypted data transmission, and role‑based access controls. Paper records are stored securely, and digital files are backed up daily. Confidentiality is built into our processes."
    },
    {
      q: "Can you handle complex pay rates, overtime, and shift patterns?",
      a: "Yes. Our system accommodates basic hours, overtime at 1.5x or 2x, public holiday rates, standby allowances, and shift differentials. We work with each client to set up the correct earning definitions."
    },
    {
      q: "What happens if the SARS rates or PAYE tables change?",
      a: "We monitor all legislative updates and apply them immediately. You don’t need to worry about missed deadlines or incorrect deductions—we keep your payroll aligned with the latest laws."
    }
  ]
};

const vetting: Service = {
  slug: "vetting",
  locationSlug: "vetting-services",
  name: "Vetting & Risk Screening",
  locationName: "Vetting & Background Screening",
  tagline: "Hire with confidence—know exactly who you’re bringing into your organisation.",
  challenge:
    "A bad hire can damage customer relationships, company reputation, and even expose the business to fraud. Without thorough background checks, employers take a gamble every time they onboard someone.",
  solution:
    "Our end‑to‑end vetting service and partners verify criminal records, credit histories, qualifications, and professional references—plus optional psychometric and skills assessments—so you can make informed, low‑risk hiring decisions.",
  description:
    "Pre‑employment screening is an essential safeguard in today’s business environment. H&S Labour Brokers coordinates a full suite of checks: criminal background clearance through AFIS, credit bureau checks (with candidate consent), qualification verification with tertiary institutions, and detailed reference checks with previous employers. Where the role demands it, we can also arrange psychometric profiling and practical skills assessments. The result is a clear, documented report that helps you decide with facts, not guesswork.",
  keywords: [
    "background checks South Africa",
    "pre-employment screening",
    "criminal record check",
    "qualification verification",
    "credit check for employment",
    "vetting services"
  ],
  faqs: [
    {
      q: "Is it legal to run a credit check on a job applicant?",
      a: "Yes, provided you have the candidate’s written consent and the check is relevant to the role. We ensure that consent is obtained and that all checks comply with the National Credit Act and POPIA."
    },
    {
      q: "How long does a full vetting report take?",
      a: "Standard checks (criminal, reference, ID) can be completed within 3–5 working days. Qualification and credit checks may add a few more days depending on third‑party response times. We keep you updated throughout."
    },
    {
      q: "Can you screen existing employees too?",
      a: "Absolutely. Periodic re‑screening is common for roles of trust. The process is the same—consent is required, and we handle everything confidentially."
    },
    {
      q: "What if something negative comes up in the report?",
      a: "We present the facts objectively and, where appropriate, advise on how the finding might impact the role. The final hiring decision always rests with you, but we give you the information to make it responsibly."
    }
  ]
};

const hrIr: Service = {
  slug: "hr-ir",
  locationSlug: "hr-ir-management",
  name: "HR & IR Management",
  locationName: "HR & IR Management",
  tagline: "Solid HR foundations and industrial‑relations peace of mind, from contracts to CCMA.",
  challenge:
    "Small and medium‑sized businesses often don’t have in‑house HR expertise, leaving them exposed to unfair‑dismissal claims, CCMA cases, and non‑compliant employment practices that can result in costly awards.",
  solution:
    "We draft employment contracts, staff policies, and disciplinary codes, chair disciplinary hearings, and represent employers at the CCMA. You get the protection of a dedicated HR/IR team without the overhead.",
  description:
    "Our HR & IR service is built for employers who want to do things right. We tailor employment contracts for permanent, fixed‑term, and TES‑employed staff, ensuring they align with the Basic Conditions of Employment Act and the LRA. We create or review company policies—leave, disciplinary, grievance, and code of conduct—and provide ongoing support when employment issues arise. If a dispute escalates, we handle CCMA conciliation and arbitration on your behalf. The result is a workplace that is fair, compliant, and defensible.",
  keywords: [
    "HR management South Africa",
    "IR services",
    "employment contracts",
    "CCMA representation",
    "disciplinary hearings",
    "labour law compliance"
  ],
  faqs: [
    {
      q: "Do you only help when there is a problem, or can you set things up from scratch?",
      a: "Both. We can start from zero—writing a full set of contracts and policies—or step in when an employee has just referred a dispute to the CCMA. Most clients use us proactively to prevent problems."
    },
    {
      q: "Can you represent us at the CCMA?",
      a: "Yes, we are experienced in CCMA proceedings and will prepare your case, represent you at conciliation and arbitration, and guide you on settlement options when that makes commercial sense."
    },
    {
      q: "Do your contracts cover the new parental leave and other recent changes?",
      a: "Yes—we keep all template documents up to date with the latest amendments to the BCEA, Labour Laws Amendment Act, and relevant national legislation."
    },
    {
      q: "What happens during a disciplinary hearing—do you chair it?",
      a: "We can chair the hearing as an independent, knowledgeable outsider, or we can coach one of your own managers to run it. Either way, we ensure the process is procedurally and substantively fair."
    }
  ]
};

const cvResponse: Service = {
  slug: "cv-response",
  locationSlug: "cv-response-handling",
  name: "CV Response Handling",
  locationName: "CV Response Handling",
  tagline: "Let us turn a flood of CVs into a short, pre‑qualified shortlist you can actually use.",
  challenge:
    "Advertising a vacancy often results in hundreds of CVs—some relevant, many not. Sifting through them, checking basic requirements, and responding to every applicant drains your time and can delay hiring decisions.",
  solution:
    "H&S Labour Brokers manages the entire CV response process: we write and place the advert, receive all applications, screen against your criteria, and deliver a shortlist of pre‑qualified candidates. You only spend time with people who are genuinely worth meeting.",
  description:
    "This service is designed for employers who want to keep control of final hiring decisions but don’t have the capacity to handle the initial deluge. We agree on the ideal candidate profile, craft a compelling job advert (and place it on the right platforms), and then systematically filter responses. We check qualifications, experience, salary expectations, and eligibility to work. Shortlisted candidates are presented with a summary so you can interview with confidence. For roles that later require placement on your payroll, we can also assist with contract and induction support.",
  keywords: [
    "CV screening service",
    "response handling",
    "applicant shortlisting",
    "job advert placement",
    "recruitment administration",
    "pre-qualified candidates"
  ],
  faqs: [
    {
      q: "Is this only for mass hiring, or will it work for a single role?",
      a: "It works for any volume—from a single hard‑to‑fill position to a large‑scale intake. You define the requirement, and we manage the response, whether that’s 10 or 500 CVs."
    },
    {
      q: "Do you provide feedback to unsuccessful candidates?",
      a: "Yes—this is a key part of the service. We reply to every applicant (or at least those who met a minimum threshold), protecting your employer brand and saving you from having to send dozens of regret emails."
    },
    {
      q: "What platforms do you use to advertise?",
      a: "We use a mix of job portals, social media, and our own networks depending on the role—always aiming for the best reach within your budget. You only pay for the advertising cost; our management is part of the service."
    },
    {
      q: "Can you also handle the initial telephone screens?",
      a: "Yes. We can add a structured telephonic screening step to verify key information and assess soft skills before you see the final shortlist. This further reduces your interview time."
    }
  ]
};

export const services: Service[] = [
  recruitment,
  tes,
  payroll,
  vetting,
  hrIr,
  cvResponse
];

export function getService(slug: string): Service | undefined {
  return services.find(s => s.slug === slug);
}

export function getServiceByLocationSlug(locationSlug: string): Service | undefined {
  return services.find(s => s.locationSlug === locationSlug);
}