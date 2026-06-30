// Site content for East Lake Drilling — single source of truth for copy.

export const company = {
  name: "East Lake Drilling",
  tagline: "Your Borehole Specialists",
  phone: "+27 83 200 1581",
  phoneHref: "tel:+27832001581",
  whatsapp: "27832001581",
  whatsappMessage:
    "Hi East Lake Drilling, I'd like a free quote for a borehole / water solution.",
  email: "info@eastlakedrilling.co.za",
  location: "Randburg, Gauteng",
  serviceArea: "Johannesburg & surrounds",
};

// wa.me deep link with a pre-filled enquiry message
export const whatsappHref = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
  company.whatsappMessage,
)}`;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Boreholes", href: "/boreholes" },
  { label: "Gallery", href: "/gallery" },
  { label: "Services", href: "/services" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const aboutText =
  "Eastlake Drilling is a borehole drilling company. We have many years of experience in drilling and bring highly trained staff and quality machinery to your property. We are situated in Johannesburg. Our main aim is to provide both domestic and commercial customers with a professional service. We offer the customer a one-stop-shop from drilling to pump installation to water purification. Our equipment is unique in that we can access smaller areas and reduce damage to the property (paving, gate rails etc). The safety of our team and clients is of paramount importance when we are drilling. Eastlake Drilling has the requisite safety protocols in place and complies on all levels with the Occupational Health and Safety Act and its regulations.";

export type Service = {
  slug: string;
  number: string;
  title: string;
  // lucide-react icon name, resolved in the UI
  icon: string;
  image: string;
  // one-line summary for cards
  short: string;
  // intro paragraph for the detail page hero/lead
  body: string;
  // longer SEO/GEO body paragraphs for the detail page
  sections: string[];
  // bullet highlights
  features: string[];
};

export const services: Service[] = [
  {
    slug: "borehole-drilling",
    number: "01",
    title: "Borehole Drilling",
    icon: "Hammer",
    image: "/images/services/drilling.jpg",
    short:
      "Air-percussion borehole drilling for homes, estates, farms and industry across Johannesburg.",
    body: "East Lake Drilling drills boreholes for the reliable extraction of groundwater across Johannesburg, Randburg and greater Gauteng. Our compact, low-impact rig uses high-pressure air and a down-the-hole hammer to drill cleanly through the hard rock and varied strata typical of the Highveld — whether you need water for domestic, commercial, agricultural or industrial use.",
    sections: [
      "Our rig is significantly smaller and lighter than most rigs on the market (just 2.4 m wide), so we can access tight suburban driveways, courtyards and back gardens while keeping disruption to paving, walls and gate rails to a minimum. The average borehole on the Highveld is 60–80 m deep and we can drill to a maximum of 150 m, typically completing 60–70 m a day.",
      "Every project starts with a recommended third-party water survey to pinpoint the most viable drilling position, followed by drilling, steel casing installation and — where the geology calls for it — perforated uPVC casing to stabilise the hole and protect your pump. The safety of our team and your property is paramount: we operate in full compliance with the Occupational Health and Safety Act and its regulations.",
    ],
    features: [
      "Compact rig for tight-access suburban sites",
      "Drilling to a maximum depth of 150 m",
      "Steel & uPVC casing supply and installation",
      "Domestic, commercial, agricultural & industrial",
    ],
  },
  {
    slug: "pump-installation",
    number: "02",
    title: "Pump Installation",
    icon: "Gauge",
    image: "/images/services/pump.jpg",
    short:
      "Submersible & booster pump supply, installation and repairs, correctly sized to your borehole.",
    body: "A borehole only delivers water once the right pump is installed. East Lake Drilling supplies, installs and repairs submersible borehole pumps and booster (pressure) pumps for properties throughout Gauteng, sizing every system to your borehole's yield, depth and intended application.",
    sections: [
      "We select your pump on hard data, not guesswork: the water yield from your yield test sets the required flow, the depth of the borehole sets the pressure capacity, and your available power supply (single-phase, three-phase or solar) determines the motor. The submersible pump is lowered on a safety rope and hung roughly 5 m off the bottom of the hole to protect it from sediment.",
      "From there we connect the borehole to your storage tank and, via a booster pump, to the home or office for consistent pressure at every tap. We also carry out pump repairs, replacements and maintenance to extend the longevity of your installation. Back-to-back one-year manufacturer warranties apply on pumps and tanks.",
    ],
    features: [
      "Submersible & booster (pressure) pumps",
      "Single-phase, three-phase or solar-ready",
      "Correctly sized to yield, depth & application",
      "Pump repairs, replacement & maintenance",
    ],
  },
  {
    slug: "water-filtration-storage",
    number: "03",
    title: "Water Filtration & Storage",
    icon: "Droplets",
    image: "/images/services/storage.jpg",
    short:
      "JoJo tank storage and tailored filtration so your borehole water is safe for the home.",
    body: "Clean, stored water completes the system. East Lake Drilling installs water storage tanks and filtration systems matched to your borehole's water quality, giving your household a buffer against load-shedding, water shedding and municipal outages.",
    sections: [
      "Water is pumped from the borehole into a storage tank (JoJo, Roto or similar). A float switch stops pumping once the tank is full, and water is then distributed to the property — purified water to the house through the filtration system, and unfiltered water to the garden and irrigation lines. Storing water this way also preserves the life of your pump.",
      "Your filtration requirements are determined by laboratory water-test results, so you only pay for the treatment you actually need. Solutions range from sediment and carbon filtration for irrigation and washing through to multi-stage and reverse-osmosis systems for safe drinking water, treating the iron, hardness and contaminants common in Gauteng groundwater.",
    ],
    features: [
      "JoJo / Roto tank supply & installation",
      "Float-switch automation & booster distribution",
      "Sediment, carbon & reverse-osmosis filtration",
      "Filtration matched to your lab results",
    ],
  },
  {
    slug: "water-analysis",
    number: "04",
    title: "Water Analysis & Testing",
    icon: "FlaskConical",
    image: "/images/services/analysis.jpg",
    short:
      "Accredited-laboratory water analysis to SANS 241, so you know exactly what you're drinking.",
    body: "Before you drink it or design a filtration system, your borehole water should be tested. East Lake Drilling arranges accredited-laboratory water analysis so you have a clear, objective picture of your water quality against the South African National Standard for drinking water (SANS 241).",
    sections: [
      "Once a borehole is drilled we collect a sample and send it to a laboratory (we recommend Set Point Laboratories) for analysis. The results reveal microbiological and chemical characteristics — bacteria, pH, hardness, iron, nitrates, total dissolved solids and more — that determine whether the water is potable and what treatment, if any, is required.",
      "Because every borehole is different, this testing is the foundation of a right-sized filtration and treatment plan. We recommend periodic re-testing for any borehole connected to the home, so your water stays safe over time rather than just on day one.",
    ],
    features: [
      "Sampling & accredited-lab analysis",
      "Tested against SANS 241 drinking-water standard",
      "Microbiological & chemical results",
      "Informs the right filtration & treatment",
    ],
  },
  {
    slug: "water-treatment",
    number: "05",
    title: "Water Treatment & Chemicals",
    icon: "Beaker",
    image: "/images/services/treatment.jpg",
    short:
      "Chemical dosing and treatment to remove iron, hardness, staining and biological contaminants.",
    body: "Some borehole water needs more than a filter. East Lake Drilling provides water treatment and chemical-dosing solutions that target the specific impurities found in your water test — turning raw groundwater into water that's safe and pleasant to use.",
    sections: [
      "Water treatment removes undesired chemical compounds, organic and inorganic materials and biological contaminants. We combine physical filtration (straining particles through fine media and membranes) with chemical treatment and dosing to address issues such as iron and manganese staining, hard water, unpleasant taste or odour, and bacterial contamination.",
      "Treatment programmes are designed around your laboratory results and reviewed as your water changes over the seasons, so the dosing stays effective and economical. Where required we integrate disinfection and reverse-osmosis stages for the highest drinking-water quality.",
    ],
    features: [
      "Iron, manganese & hardness removal",
      "Chemical dosing & disinfection",
      "Taste, odour & staining correction",
      "Programmes based on lab results",
    ],
  },
  {
    slug: "solar-solutions",
    number: "06",
    title: "Off-Grid Solar Solutions",
    icon: "Sun",
    image: "/images/services/solar.jpg",
    short:
      "Solar-powered borehole pumps for water independence with no reliance on the grid.",
    body: "Pair your borehole with the sun. East Lake Drilling installs off-grid and hybrid solar-powered pumping systems that run your borehole directly from solar panels — eliminating reliance on Eskom, cutting running costs and keeping water flowing right through load-shedding.",
    sections: [
      "Solar pumping is ideal for Gauteng's high-sunshine climate and for properties, smallholdings and farms where grid power is unreliable, expensive or simply unavailable. The pump runs during daylight hours to fill your storage tanks, which then gravity-feed or booster-feed the property — so you bank water by day and use it any time.",
      "We design each system around your daily water demand, borehole depth and yield, specifying the correct solar array, controller and DC or hybrid pump. Hybrid configurations can switch seamlessly between solar and grid or generator power for guaranteed supply, giving you true water and energy independence.",
    ],
    features: [
      "Solar-direct & hybrid pump systems",
      "Keeps water flowing through load-shedding",
      "Lower running costs, no grid reliance",
      "Sized to your demand, depth & yield",
    ],
  },
];

// Sectors served — strong local-intent SEO content
export const sectors = [
  { icon: "Home", title: "Residential", body: "Boreholes, pumps, storage and filtration for homes across the northern suburbs — water security and lower municipal bills." },
  { icon: "Building2", title: "Commercial", body: "Reliable bulk water and backup supply for offices, retail, schools, guesthouses and business parks in Gauteng." },
  { icon: "Sprout", title: "Agricultural", body: "Irrigation and livestock water for smallholdings and farms, with solar pumping options for off-grid sites." },
  { icon: "Building", title: "Estates & Complexes", body: "Shared boreholes, booster systems and bulk storage that keep pressure consistent across residential estates." },
  { icon: "Factory", title: "Industrial", body: "High-yield boreholes and water solutions for factories, warehouses and industrial process water." },
  { icon: "Cross", title: "Healthcare & Essential", body: "Dependable, tested water supply and backup storage for clinics and essential-service facilities." },
];

// Service areas — local GEO targeting
export const serviceAreas = [
  "Randburg", "Sandton", "Fourways", "Bryanston", "Roodepoort", "Midrand",
  "Honeydew", "Northcliff", "Krugersdorp", "Centurion", "Johannesburg North", "West Rand",
];

// Trust stats drawn from real, factual capabilities (no fabricated figures)
export const stats = [
  { value: "150 m", label: "Maximum drilling depth" },
  { value: "60–70 m", label: "Drilled per day" },
  { value: "2.4 m", label: "Compact low-impact rig" },
  { value: "OHS Act", label: "Fully compliant & safe" },
];

export const whyChooseUs = [
  { icon: "Truck", title: "Compact, low-impact rig", body: "Our small rig reaches tight suburban sites with minimal damage to paving, walls and gates." },
  { icon: "ShieldCheck", title: "One-stop water solution", body: "From survey and drilling to pumps, storage, filtration and solar — handled by one team." },
  { icon: "FlaskConical", title: "Lab-tested water quality", body: "Accredited-laboratory analysis to SANS 241 means filtration is right-sized to your water." },
  { icon: "HardHat", title: "Safety-first & compliant", body: "Full compliance with the Occupational Health and Safety Act on every site we drill." },
];

export const boreholeIntro = {
  what: {
    title: "What is a borehole?",
    body: "A borehole is a hole drilled deep into the ground to access the water below. By installing steel casing and a pumping system into the borehole, natural water can then be extracted directly from the ground.",
  },
  yield: {
    title: "How much water will I get from my borehole?",
    body: "This is all-important. Each borehole is different and varies in depth and water yield. A borehole's water yield is the amount of water that can be extracted from the borehole in an hour. To establish this, a water yield test is conducted. Once the borehole is drilled, a test pump is placed in it and monitored for 4 to 5 hours. The test reading assists in determining the water yield of the borehole. If the water yield is high, the borehole pump can supply water for a specific requirement directly. If the water yield is low, the borehole pump will supply water to a storage tank which serves as a reservoir.",
  },
};

export const boreholeSteps = [
  "A water survey is conducted by a third party to establish the most viable location on the site for drilling.",
  "The borehole is drilled into the ground through the use of a heavy-duty 'hammer' and high-pressure air.",
  "A test is conducted to determine the water yield of the borehole.",
  "The borehole pump is selected based on water yield, depth of the borehole, the available electrical power (three phase or single phase), and the intended application of the borehole.",
  "The borehole pump is dropped into the borehole using the safety rope and hung about 5 meters from the bottom of the borehole.",
  "Borehole water is sent to the laboratory for testing.",
  "The storage tank is positioned on the property.",
  "The submersible borehole pump pumps water from the borehole to the storage tank.",
  "The water is distributed from the storage tank with the use of a booster / pressure pump.",
  "The garden line is not usually filtered, while the line to the house / office is usually filtered.",
  "The filtration of the water is determined by the water results received from the laboratory.",
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  { q: "What is a borehole?", a: "Boreholes are holes that are drilled into the earth's crust in order to access ground water. Boreholes vary in depth, diameter and water yield." },
  { q: "If there is no water-strike do I still have to pay?", a: "Yes, the drilling invoice will have to be paid in full. We are contracted to drill, not to find water." },
  { q: "Do you guarantee a water-strike?", a: "No, we cannot guarantee a water-strike. We are not diviners, geophysicists or geologists. We are drillers and, although we will help where we can, we are not responsible for where the peg/stake/marker has been placed." },
  { q: "What is the size of your machinery? Can you access my property?", a: "Our rig is significantly smaller and lighter than other rigs in the market. Our rig dimensions are: Width – 2.4 metres, Height – 2.5 metres, Length – 5 metres. Please make sure we can access your property." },
  { q: "Who is responsible for facilitating rig access to the property?", a: "The customer is responsible for this. Should the removal of walls, fences, overhead cables or any other obstruction be required to accommodate the drilling rig, the costs of such removal and subsequent replacement shall be for the customer's account." },
  { q: "Can my borehole collapse?", a: "Although all efforts will be made by the company to ensure a successful hole is drilled, this cannot be guaranteed and the hole can collapse at any time." },
  { q: "Why would I need PVC casing?", a: "Your borehole may require perforated uPVC casing. This plastic sleeve goes on the inside of the mild steel casing. It may be required for stabilising the hole below the mild steel casing and avoiding a collapse, for additional filtration of dirty water, or to protect the pump impellers where the bottom of the hole is sandy. The uPVC is at an additional charge as per the quote. If the client is advised to install the uPVC casing and chooses not to, East Lake will not take responsibility for a collapsing hole or a damaged pump." },
  { q: "Will my borehole need a pump?", a: "Most definitely. A suitable pump is required to pump the water to the surface. The size of the pump is determined by the depth of the borehole (the deeper the hole the bigger the pump), the water yield of the borehole, and the availability and type of electrical power (three phase, single phase or solar)." },
  { q: "Will my borehole require maintenance?", a: "Yes, with regular maintenance you will extend the longevity of your borehole." },
  { q: "Will my paving or grass be damaged when drilling?", a: "Although all the necessary precautions will be taken, we cannot guarantee the weight of the machinery will not damage the paving or the grass. We do not replace or repair paving or grass — this is a specialised trade for which we are not trained." },
  { q: "Who is responsible for cleaning, and what is the definition of cleaning?", a: "The cleaning of the site is the responsibility of the customer. This includes the removal of the mud, rock chips or dust. We do however facilitate, at a cost of R750 / load, the removal of the sand and stone and a light / surface clean at the customer's request." },
  { q: "Can the borehole drilling process damage my property?", a: "Although this is unlikely it is possible. Please make sure you have the necessary homeowner's insurance in place." },
  { q: "How will a dispute be handled?", a: "All disputes will be handled by a nominated competent professional in the borehole industry." },
  { q: "What warranty is offered?", a: "No warranty is offered on the borehole itself. A back-to-back one-year manufacturer's warranty is offered on all pumps and tanks. This does not include East Lake labour — you will be invoiced separately for this. The installation warranty is valid for 3 months." },
  { q: "What happens if the rig cannot access the designated drilling spot?", a: "Best efforts will be made to drill on the exact mark, but East Lake reserve the right, unless otherwise agreed, to drill within a 1-meter radius of the peg / mark. Please make sure the necessary measurements have been done to ensure the rig is able to access the marker. The company reserve the right not to drill in inaccessible / dangerous positions." },
  { q: "Once the borehole is drilled, how do you cover it?", a: "This depends on where the hole is drilled. If the borehole is drilled in the driveway, a steel borehole cover is used. If we drill in the garden, a standard plastic irrigation cover is used." },
  { q: "How long does it take to drill a borehole?", a: "This depends on how deep we drill. Under normal conditions you can expect us to drill 60 to 70 meters a day." },
  { q: "Must I inform my neighbours about the noise and dust?", a: "As the drilling process is dusty and noisy, it is advisable to inform your neighbours." },
  { q: "How deep is the average borehole?", a: "The average borehole is 60 to 80 meters deep." },
  { q: "How deep can you drill?", a: "Our company can drill to a maximum of 150 meters." },
  { q: "Do I need a filtration system?", a: "If you want to connect the borehole water to the house, it is advisable to filter the water. If the water is only being used for irrigation, it is probably not required. To confirm your water is potable, please have it tested at Set Point Laboratories frequently." },
  { q: "What is a water diviner (dowsing) and do I need one to locate the drill point?", a: "This is a difficult decision. We outsource this service and will refer various diviners if you request. Water divining (dowsing) is a methodology employed in an attempt to locate ground water. Dowsing is considered a pseudoscience and there is no scientific evidence that it is any more effective than random chance. Dowsers often achieve good results because random chance has a high probability of finding water in favourable terrain." },
  { q: "Will my water be dirty?", a: "This will only be determined after drilling has taken place. If the water is dirty, we have various ways to treat and filter the water." },
  { q: "How deep should my borehole be?", a: "The depth of any new borehole will be determined by local known precedent — i.e. the depth of other boreholes in your area and the recommendations of your diviner. We stop drilling when we have sufficient water and a sufficient sump." },
  { q: "How much does a borehole cost?", a: "The cost depends on the driller and the geology, but on average a borehole costs around R380 per meter, which usually excludes site establishment, transport, steel casing, pumps and a yield test. A yield estimate will be provided by the driller." },
  { q: "Can I drink my borehole water?", a: "The water will have to be tested by a laboratory. We recommend Set Point Laboratories. This will indicate what water treatment is required (if any). The company has various filtration and reverse osmosis products on offer." },
  { q: "What happens if, for a variety of reasons, you can't complete the drilling?", a: "Although all efforts will be made to ensure a successful hole is drilled, this cannot be guaranteed. In the event of unsuccessful drilling (including but not limited to cavities, boulders, clay) the customer is still liable for the monies due as per the signed quote. The price per meter in the event of a dry hole remains as quoted and is not reduced. The customer confirms acceptance of this." },
  { q: "Will I need tanks to store the water?", a: "It is advisable to store the water in tanks as this preserves the pump." },
  { q: "What happens if you encounter abnormally hard rock?", a: "If we encounter abnormally hard rock (including but not limited to Dolerite, Quartzite, Basalt) during drilling there will be a R220 per meter surcharge. If the type of rock is in question, the rock will be sent for an offsite evaluation and the costs shared equally between client and contractor." },
  { q: "Must I sign the quote and terms and conditions?", a: "Yes, the terms and conditions must be signed before we start drilling on your property. If East Lake start the drilling process on your property, it is deemed that you have accepted and read the terms and conditions." },
];

export const galleryImages = [
  "1-1", "5", "6", "7", "8", "9", "14", "15", "16", "17", "18", "19-1",
  "21-1", "22", "23", "24", "25", "26", "27", "29", "30", "31", "33", "36",
].map((n) => `/images/gallery/${n}.jpg`);
