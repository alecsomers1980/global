export const SITE_URL = "https://execair.co.za";

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  "@id": `${SITE_URL}/#org`,
  name: "Exec-Air Air Conditioning",
  alternateName: "Exec-Air",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logos/exec-air-logo.png`,
  image: `${SITE_URL}/images/hero/Exec-Air_BrandedFleet_HeaderImage.jpg`,
  telephone: "+27114773920",
  email: "info@execair.co.za",
  foundingDate: "1989",
  priceRange: "$$",
  description:
    "South African HVAC specialists since 1989. Commercial, industrial and residential heating, ventilation and air-conditioning across Krugersdorp, Johannesburg and Gauteng.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "296 Voortrekker Road",
    addressLocality: "Krugersdorp",
    addressRegion: "Gauteng",
    postalCode: "1739",
    addressCountry: "ZA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -26.0925,
    longitude: 27.7895,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:30",
      closes: "17:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Krugersdorp" },
    { "@type": "City", name: "Johannesburg" },
    { "@type": "AdministrativeArea", name: "Gauteng" },
    { "@type": "AdministrativeArea", name: "West Rand" },
  ],
  brand: ["Jet-Air", "LG", "Daikin", "Samsung", "Hisense", "Midea", "York", "Alliance", "DB"],
  sameAs: [
    "https://www.facebook.com/ExecAirAC",
    "https://www.instagram.com/exec_air_pty_ltd/",
    "https://www.linkedin.com/company/exec-air-airconditioning/",
    "https://www.youtube.com/@execairair-conditioners7773",
  ],
};

export const faqs = [
  {
    q: "How long has Exec-Air been operating?",
    a: "Exec-Air Air Conditioning was founded in 1989 and has over 35 years of HVAC experience.",
  },
  {
    q: "Where is Exec-Air based and what areas do you service?",
    a: "Our head office is at 296 Voortrekker Road, Krugersdorp, Gauteng 1739. We service Krugersdorp, Johannesburg, the West Rand, greater Gauteng, and projects across Southern Africa.",
  },
  {
    q: "What HVAC brands does Exec-Air install?",
    a: "We install and service Jet-Air, LG, Daikin, Samsung, Hisense, Midea, York, Alliance and DB systems — covering high-wall splits, cassettes, ducted, VRV/Multi-V, rooftop, evaporative and industrial floor-standing units.",
  },
  {
    q: "Who are some of Exec-Air's notable clients?",
    a: "We've delivered HVAC installations and maintenance for SARS, the Gautrain, the University of Johannesburg, Broll, Builders Warehouse, Hyundai, Land Rover, Checkers and Planet Fitness.",
  },
  {
    q: "Does Exec-Air handle residential, commercial and industrial work?",
    a: "Yes. We service single homes and estates through to shopping centres, hotels, mines, factories, server rooms and government infrastructure.",
  },
  {
    q: "Is Exec-Air B-BBEE compliant?",
    a: "Yes. Exec-Air is a Proudly Level 3 B-BBEE Contributor (2023 verification).",
  },
  {
    q: "What's the difference between an inverter and non-inverter air conditioner?",
    a: "Inverter units modulate compressor speed for roughly 30–50% lower running costs and quieter operation; non-inverter units cycle on and off and cost less upfront.",
  },
  {
    q: "Does Exec-Air offer maintenance contracts?",
    a: "Yes. We offer comprehensive HVAC maintenance and repair contracts for commercial and industrial clients to keep systems at peak performance year-round.",
  },
];

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
