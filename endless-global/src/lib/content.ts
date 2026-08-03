// Single source of truth for site copy (verbatim from the live Endless Global Point site).

export type ServiceSlug =
  | "investment-services"
  | "financial-services"
  | "trade-services"
  | "consulting-services";

export interface ServiceProcessItem {
  title: string;
  text: string;
}

export interface ServiceData {
  slug: ServiceSlug;
  name: string; // e.g. "Investment Services"
  hero: {
    titleTop: string;
    titleMain: string;
    subtitle: string;
    bgImage: string;
  };
  intro: {
    heading: string;
    paragraphs: string[];
    image: string;
  };
  process: {
    heading: string;
    items: ServiceProcessItem[];
  };
  benefits: {
    heading: string;
    points: string[];
    image: string;
  };
}

export const services: Record<ServiceSlug, ServiceData> = {
  "investment-services": {
    slug: "investment-services",
    name: "Investment Services",
    hero: {
      titleTop: "Smart Investments",
      titleMain: "Global Reach",
      subtitle:
        "At Endless Global Point, we empower investors to expand beyond local markets through access to verified, high-potential ventures across the world.",
      bgImage: "/images/investmentServicesBanner.png",
    },
    intro: {
      heading: "Connecting Investors with Global Opportunities",
      paragraphs: [
        "At Endless Global Point, we specialise in helping investors identify and access profitable opportunities around the world. Whether you're an individual investor, a private equity group, or a corporate entity, our investment services are designed to help you make confident, data-driven decisions that align with your goals.",
        "Our team conducts in-depth market research, evaluates potential ventures, and connects you directly with verified partners and projects. We act as the bridge between high-potential investments and credible investors, ensuring every opportunity is both ethical and sustainable.",
      ],
      image: "/images/investmentServices-6.png",
    },
    process: {
      heading: "Our Investment Approach",
      items: [
        {
          title: "Sustainable Growth",
          text: "We prioritise long-term value creation over short-term gains, helping you invest responsibly in future-ready sectors.",
        },
        {
          title: "Global Access",
          text: "With our global network, you gain exposure to cross-border ventures and emerging markets with real potential.",
        },
        {
          title: "Tailored Strategy",
          text: "Every investor has unique objectives. We design personalised investment plans to suit your growth ambitions and risk profile.",
        },
        {
          title: "Due Diligence",
          text: "Our experts perform comprehensive checks to ensure all opportunities are legitimate, compliant, and high quality.",
        },
      ],
    },
    benefits: {
      heading: "Why Choose Our Investment Services",
      points: [
        "Access to verified international projects",
        "Risk mitigation through professional vetting",
        "Increased ROI through strategic matching",
        "Expert insights from experienced investment consultants",
      ],
      image: "/images/investmentServices-5.png",
    },
  },

  "financial-services": {
    slug: "financial-services",
    name: "Financial Services",
    hero: {
      titleTop: "Building Financial",
      titleMain: "Strength for the Future",
      subtitle:
        "At Endless Global Point, we empower individuals and businesses to make confident, informed financial decisions. Through tailored strategies, expert advisory, and sustainable planning, we help you protect your assets, optimise your capital, and unlock new avenues for growth.",
      bgImage: "/images/financialServicesBanner.png",
    },
    intro: {
      heading: "Empowering Financial Confidence and Growth",
      paragraphs: [
        "Our financial services are built to help businesses and individuals make smarter, more strategic financial decisions. From funding solutions to financial advisory, we provide a comprehensive approach to managing, protecting, and growing your capital.",
        "At Endless Global Point, we understand that financial stability is the foundation of business success. Our consultants take the time to understand your objectives, assess your financial health, and create customised strategies to support your long-term goals.",
      ],
      image: "/images/financialServices-1.png",
    },
    process: {
      heading: "Our Financial Expertise Covers",
      items: [
        {
          title: "Financial Risk Management",
          text: "Identifying potential risks and implementing strategies to safeguard assets and cash flow.",
        },
        {
          title: "Wealth Management",
          text: "Strategic planning for individuals and families seeking to grow and preserve wealth.",
        },
        {
          title: "Business Funding Solutions",
          text: "We assist in sourcing and securing funding for business expansion, start-ups, or project finance.",
        },
        {
          title: "Corporate Finance Advisory",
          text: "Helping companies plan mergers, acquisitions, restructuring, and capital optimisation.",
        },
      ],
    },
    benefits: {
      heading: "Why Choose Our Financial Services",
      points: [
        "Transparent and ethical advisory",
        "Personalised financial roadmaps",
        "Proven strategies for growth and sustainability",
        "A trusted partner focused on measurable results",
      ],
      image: "/images/financialServices-2.png",
    },
  },

  "trade-services": {
    slug: "trade-services",
    name: "Trade Services",
    hero: {
      titleTop: "Seamless Trade",
      titleMain: "Global Reach",
      subtitle:
        "At Endless Global Point, we simplify international trade by bridging businesses with trusted global partners. From market entry and compliance to logistics and negotiations, our trade experts ensure every transaction is efficient, transparent, and profitable.",
      bgImage: "/images/tradeServicesBanner.png",
    },
    intro: {
      heading: "Your Trusted Partner in Global Trade",
      paragraphs: [
        "Navigating international trade can be complex, but with Endless Global Point, it becomes seamless. We connect exporters, importers, distributors, and investors with reliable partners worldwide, enabling trade that is efficient, compliant, and profitable.",
        "Our trade services are designed to simplify the entire process, from establishing partnerships to managing logistics and compliance. Whether you are expanding your export reach or entering new import markets, we act as your strategic trade partner every step of the way.",
      ],
      image: "/images/tradeServices-1.png",
    },
    process: {
      heading: "Our Trade Solutions Include",
      items: [
        {
          title: "Trade Compliance Guidance",
          text: "We prioritise long-term value creation over short-term gains, helping you invest responsibly in future-ready sectors.",
        },
        {
          title: "Negotiation and Contract Assistance",
          text: "Ensure all deals are fair, transparent, and mutually beneficial.",
        },
        {
          title: "Market Entry Support",
          text: "Identify the right international markets for your products or services.",
        },
        {
          title: "Partner Matchmaking",
          text: "Our experts perform comprehensive checks to ensure all opportunities are legitimate, compliant, and high quality.",
        },
      ],
    },
    benefits: {
      heading: "Why Businesses Choose Endless Global Point",
      points: [
        "Strong international network and partnerships",
        "End-to-end trade facilitation and logistics support",
        "Regulatory compliance assurance",
        "Focus on long-term, mutually beneficial relationships",
      ],
      image: "/images/tradeServices-2.png",
    },
  },

  "consulting-services": {
    slug: "consulting-services",
    name: "Consulting Services",
    hero: {
      titleTop: "Strategic Insight",
      titleMain: "Global Impact",
      subtitle:
        "At Endless Global Point, our consulting services empower organisations to make smarter decisions, expand globally, and achieve measurable success. Through in-depth research, strategic planning, and innovation-driven solutions, we help businesses refine their direction, strengthen operations, and unlock new opportunities for growth.",
      bgImage: "/images/consultingServicesBanner.png",
    },
    intro: {
      heading: "Strategic Consulting for Growth and Global Expansion",
      paragraphs: [
        "Our consulting services are designed to help organisations navigate the complexities of global business with clarity and confidence. At Endless Global Point, we combine research, strategy, and innovation to deliver actionable insights and measurable outcomes.",
        "We work closely with clients to understand their challenges and objectives, providing tailored consulting solutions that support expansion, efficiency, and profitability.",
      ],
      image: "/images/consultingServices-1.png",
    },
    process: {
      heading: "Our Consulting Focus Areas",
      items: [
        {
          title: "International Expansion",
          text: "Strategies for entering new markets with minimal risk and maximum impact.",
        },
        {
          title: "Partnership Development",
          text: "Facilitating collaborations and alliances that create long-term value.",
        },
        {
          title: "Business Strategy & Development",
          text: "Helping you refine your business model and align it with market demand.",
        },
        {
          title: "Market Research & Analysis",
          text: "Detailed insights to help you identify opportunities and make informed decisions.",
        },
      ],
    },
    benefits: {
      heading: "Our Approach",
      points: [
        "Deep market understanding and research-driven insights",
        "Bespoke solutions tailored to your business goals",
        "Transparent communication and measurable results",
        "Focus on innovation, sustainability, and success",
      ],
      image: "/images/consultingServices-2.png",
    },
  },
};

export const serviceList = Object.values(services);

// Home page — services grid cards
export const homeServices = [
  {
    slug: "investment-services",
    name: "Investment Services",
    icon: "/images/networking-1.png",
    text: "Maximise your growth potential with the right investment partners. From wealth creation to portfolio management, we introduce you to experts who can guide your financial future.",
  },
  {
    slug: "financial-services",
    name: "Financial Services",
    icon: "/images/networking-2.png",
    text: "Sound financial management is the backbone of success. We connect you to advisors and firms offering services such as accounting, tax planning, insurance, and financial strategy.",
  },
  {
    slug: "trade-services",
    name: "Trade Services",
    icon: "/images/networking-3.png",
    text: "Expand your reach and simplify your operations. Whether it's import/export solutions, logistics, or trade compliance, we refer you to professionals who know the ins and outs of global trade.",
  },
  {
    slug: "consulting-services",
    name: "Consulting Services",
    icon: "/images/networking-4.png",
    text: "Sometimes you need more than a product, you need strategic insight. Our network of consultants helps you unlock opportunities, solve challenges, and drive business efficiency.",
  },
] as const;

// Home — "A Simple Process, Powerful Results" tabbed steps
export interface ProcessBlock {
  heading: string;
  text: string;
}
export interface ProcessStep {
  tab: string;
  title: string;
  image: string;
  lead: string;
  blocks: ProcessBlock[];
}

export const processSteps: ProcessStep[] = [
  {
    tab: "Step 1: Communicate Your Needs",
    title: "Communicate Your Needs",
    image: "/images/Rectangle-22.png",
    lead: "We start by understanding your goals, constraints, and success criteria so we can recommend the right partner the first time.",
    blocks: [
      {
        heading: "What We Explore",
        text: "During this stage, we dive into the details that shape your needs, from your business objectives and growth goals to timelines, budgets, and any regulatory requirements.",
      },
      {
        heading: "What You Prepare",
        text: "To make the process even smoother, we encourage you to share a simple outline of your needs. This could be a short brief, relevant documents such as proposals or reports, or even just a summary of your priorities, timelines, and budget. The more context you provide, the easier it becomes for us to match you with the right professionals.",
      },
      {
        heading: "What You Get From This Step",
        text: "By the end of this stage, you'll have a clear summary of your requirements written in plain language, along with the criteria we'll use to guide our recommendations. You'll also know the expected timeline for receiving your shortlist and exactly what the next steps look like.",
      },
    ],
  },
  {
    tab: "Step 2: You Get Matched With Trusted Providers",
    title: "You Get Matched With Trusted Providers",
    image: "/images/step2.png",
    lead: "Once we've defined your goals, we move into action. Connecting you with carefully selected providers that align with your unique requirements.",
    blocks: [
      {
        heading: "How it Works",
        text: "Our team reviews your criteria and shortlists only the most suitable professionals or service providers from our trusted network. Each recommendation is based on proven experience, reputation, and their ability to meet your specific objectives.",
      },
      {
        heading: "What You Can Expect",
        text: "You'll receive a curated shortlist complete with key insights about each provider, their background, areas of expertise, previous projects, and what makes them the right fit for your needs.",
      },
      {
        heading: "Your Benefit",
        text: "This step saves you time, reduces uncertainty, and ensures you're engaging with vetted professionals who have already demonstrated reliability and excellence.",
      },
    ],
  },
  {
    tab: "Step 3: Make Your Choice and Move Forward With Confidence",
    title: "Make Your Choice and Move Forward With Confidence",
    image: "/images/step3.png",
    lead: "With your shortlist in hand, it's time to make an informed decision and take the next step toward success.",
    blocks: [
      {
        heading: "Your Next Move",
        text: "You can connect directly with your chosen provider, discuss finer details, and finalise terms knowing that every option has been pre-screened for quality and alignment with your goals.",
      },
      {
        heading: "Our Support",
        text: "We remain available throughout this stage to answer questions, assist with clarifications, and ensure your transition into the working relationship is seamless.",
      },
      {
        heading: "Your Outcome",
        text: "By the end of this step, you'll have the right partner on board, ready to deliver results, and complete clarity on timelines, expectations, and deliverables. It's a confident start built on trust and precision.",
      },
    ],
  },
];

// Home — "Why Choose Us" value props
export const whyChoose = [
  {
    icon: "/images/Ellipse-1.png",
    title: "Unbiased Recommendations",
    text: "We're not tied to any one provider. Every recommendation is based on your needs, ensuring transparency and objectivity at every stage.",
  },
  {
    icon: "/images/Ellipse-2.png",
    title: "Trusted Professionals",
    text: "Our connections are built on trust. We only refer you to partners who have a proven track record of professionalism and results.",
  },
  {
    icon: "/images/Ellipse-3.png",
    title: "Tailored Solutions",
    text: "No two clients are the same, and neither are our referrals. We take the time to understand your goals and match you with experts who can provide the right solutions.",
  },
] as const;

// About page — Values / Vision / Mission
export const aboutValues = [
  {
    icon: "/images/Ellipse-1.png",
    title: "Our Values",
    text: "At the heart of Endless Global Point are two guiding principles: Honesty and Transparency. These values shape how we operate, make decisions, and engage with our partners across industries and borders.",
  },
  {
    icon: "/images/Ellipse-2.png",
    title: "Our Vision",
    text: "To be the safe and effective connecting point between businesses, individuals, investors, and governments, creating opportunities that drive global progress and prosperity.",
  },
  {
    icon: "/images/Ellipse-3.png",
    title: "Our Mission",
    text: "At Endless Global Point, our mission is to empower growth by matching the right people, resources, and solutions across industries and regions.",
  },
] as const;

// About page — leadership team
export const team = [
  { name: "Phillip Okoh", role: "President / Chairman", photo: "/images/PhillipOkoh.png" },
  { name: "Anwar Inglis", role: "Vice President", photo: "/images/fill.png" },
  { name: "Almero Dreyer", role: "Creative & Research Director", photo: "/images/AlmeroDreyer.png" },
  { name: "Katlego Thobajne", role: "Financial Director", photo: "/images/KatlegoThobajne.png" },
  { name: "Patricia Richards", role: "Project Director", photo: "/images/PatriciaRichards.png" },
] as const;
