// ============================================================
// Product images use local paths from public/images/products/
// ============================================================

export interface Product {
  name: string;
  btu: string;
  image: string;
  features: string[];
  tags?: string[];
  description?: string;
}

export interface ProductCategory {
  title: string;
  description?: string;
  products: Product[];
}

// Helper — returns the product image URL. Original sources were .png but all have
// been converted to .webp; this swaps the extension automatically so call sites can
// keep their original .png filenames as a stable identifier.
const P = (name: string) => `/images/products/${name.replace(/\.png$/i, ".webp")}`;

export const productCategories: ProductCategory[] = [
  {
    title: "High Wall Split Air Conditioners",
    description:
      "Our most popular residential and light commercial solution. High wall split units offer whisper-quiet operation, rapid cooling and heating, and advanced inverter technology for maximum energy efficiency. Ideal for bedrooms, living areas, offices, and retail spaces across South Africa.",
    products: [
      {
        name: "Jet Air J-Smart Inverter",
        btu: "9,000 – 24,000 BTU",
        image: P("jet_air_j_smart_white_inverter_high_wall_split.png"),
        features: ["Built-in WiFi (2.4GHz only)", "Heating & Cooling", "5-year compressor warranty"],
        tags: ["Best Seller", "WiFi Enabled", "Inverter"],
      },
      {
        name: "Jet Air Q-Plus Inverter",
        btu: "9,000 – 36,000 BTU",
        image: P("jet_air_q_plus_inverter_high_wall_split.png"),
        features: ["7 indoor fan speed modes", "Energy-saving design", "10-year inverter compressor warranty"],
        tags: ["Premium", "Ultra Efficient", "10 Year Warranty"],
      },
      {
        name: "Jet Air Q-Plus X Inverter",
        btu: "9,000 – 36,000 BTU",
        image: P("jet_air_products1.png"),
        features: ["Built-in WiFi (2.4GHz only)", "Uses R32 refrigerant gas", "Heating & Cooling", "5-year compressor warranty"],
        tags: ["WiFi Enabled", "Eco-Friendly", "Inverter"],
      },
      {
        name: "Jet Air J-Smart Non-Inverter",
        btu: "9,000 – 30,000 BTU",
        image: P("jet_air_j_smart_white_non_inverter_high_wall_split.png"),
        features: ["Built-in WiFi (2.4GHz only)", "Heating & Cooling", "5-year compressor warranty"],
        tags: ["WiFi Enabled", "Value Choice"],
      },
      {
        name: "Jet Air Q-Plus Wine Inverter",
        btu: "9,000 – 36,000 BTU",
        image: P("jet_air_q_plus_red_inverter_high_wall_split.png"),
        features: ["7 indoor fan speed modes", "Energy-saving operation", "10-year inverter compressor warranty"],
        tags: ["Inverter", "Design Edition", "10 Year Warranty"],
      },
      {
        name: "Jet Air J-Smart Mirror Inverter",
        btu: "9,000 – 24,000 BTU",
        image: P("jet_air_j_smart_mirror_inverter_high_wall.png"),
        features: ["Built-in WiFi (2.4GHz only)", "Heating & Cooling", "5-year compressor warranty"],
        tags: ["WiFi Enabled", "Mirror Finish", "Inverter"],
      },
      {
        name: "Jet Air Q-Plus Non-Inverter",
        btu: "9,000 – 36,000 BTU",
        image: P("jet_air_q_plus_non_inverter.png"),
        features: ["7 indoor fan speed modes", "Hidden LED on indoor unit", "5-year compressor warranty"],
        tags: ["Budget Friendly", "Reliable"],
      },
    ],
  },
  {
    title: "Cassette Air Conditioners",
    description:
      "Designed for suspended ceilings in commercial and open-plan spaces. Cassette units provide 4-way airflow distribution for uniform temperature control across large areas. Perfect for offices, retail stores, restaurants, and conference venues requiring discreet, ceiling-integrated climate control.",
    products: [
      {
        name: "Jet Air Cassette ASI Inverter",
        btu: "12,000 – 60,000 BTU",
        image: P("jet_air_cassetteasi_inverter.png"),
        features: ["BMS connection available on request", "4-way airflow", "5-year compressor warranty"],
        tags: ["Commercial Grade", "Inverter"],
      },
      {
        name: "Jet Air Cassette Non-Inverter",
        btu: "12,000 – 60,000 BTU",
        image: P("jet_air_cassette_non_inverter.png"),
        features: ["BMS connection available on request", "4-way airflow", "5-year compressor warranty"],
        tags: ["Commercial Grade", "4-Way Airflow"],
      },
    ],
  },
  {
    title: "Under Ceiling / Floor Air Conditioners",
    description:
      "Versatile units that can be mounted near the ceiling or close to the floor — ideal for spaces where wall or ceiling cavity installation isn't practical. Commonly used in server rooms, workshops, studios, and older buildings undergoing retrofits.",
    products: [
      {
        name: "Jet Air Underceiling ASI Inverter",
        btu: "12,000 – 60,000 BTU",
        image: P("jet_air_underceiling_inverter_asi.png"),
        features: ["Power-off memory function", "3D airflow system for even room circulation", "5-year compressor warranty"],
        tags: ["Inverter", "Flexible Mount"],
      },
      {
        name: "Jet Air Underceiling Non-Inverter",
        btu: "12,000 – 60,000 BTU",
        image: P("jet_air_underceiling_non_inverter.png"),
        features: ["Self-diagnosis function", "Sleep mode", "5-year compressor warranty"],
        tags: ["Reliable", "Flexible Mount"],
      },
    ],
  },
  {
    title: "Hide Away / Ducted Air Conditioners",
    description:
      "The ultimate discreet climate solution. Ducted systems are concealed above ceilings or in service cavities, with only elegant grilles visible. Ideal for luxury homes, hotels, boutique retail, and premium commercial fit-outs where aesthetics are paramount.",
    products: [
      {
        name: "Jet Air Hide Away ASI Inverter",
        btu: "12,000 – 60,000 BTU",
        image: P("jet_air_hide_away_ducted_Inverter.png"),
        features: ["BMS connection available on request", "Fresh air intake", "5-year compressor warranty"],
        tags: ["Discreet", "Luxury Grade", "Inverter"],
      },
      {
        name: "Jet Air Hide Away Non-Inverter",
        btu: "12,000 – 60,000 BTU",
        image: P("Jet_air_hide_away_ducted_non_inverter.png"),
        features: ["Auto restart function", "Fresh air intake", "Self-diagnosis function", "5-year compressor warranty"],
        tags: ["Discreet", "Fresh Air"],
      },
      {
        name: "Jet Air Large Hide Away Inverter",
        btu: "20KW – 60KW",
        image: P("jet_air_hide_away_ducted_large.png"),
        features: ["Intelligent defrosting", "Optimum energy conservation", "High static units", "3-year compressor warranty"],
        tags: ["High Capacity", "Commercial", "Inverter"],
      },
    ],
  },
  {
    title: "Industrial Evaporative Coolers",
    description:
      "Heavy-duty cooling engineered for factories, warehouses, and large industrial facilities. Evaporative coolers use water evaporation to deliver energy-efficient cooling at a fraction of the running cost of conventional air conditioning — ideal for high-volume spaces with open doors and high heat loads.",
    products: [
      {
        name: "Jet Air KD18 Evaporative Cooler",
        btu: "18,000 m³/h",
        image: P("jet_air_kd_evaporative_cooler.png"),
        features: ["High-performance cooling pads", "LCD display wired remote", "9 adjustable fan speeds", "1-year warranty on spares"],
        tags: ["Energy Saver", "Industrial"],
      },
      {
        name: "KT40/KT60 Evaporative Cooler",
        btu: "40,000 & 60,000 m³/h",
        image: P("jet_air_kt_evaporative-cooler_40000m3h.png"),
        features: ["High-performance cooling pads", "LED display wired remote", "High-quality air pre-filter", "1-year warranty on spares"],
        tags: ["High Capacity", "Industrial", "Energy Saver"],
      },
      {
        name: "Jet Air KD25 Evaporative Cooler",
        btu: "25,000 m³/h",
        image: P("jet_air_kd_evaporative_cooler.png"),
        features: ["High-performance cooling pads", "LED display wired remote", "16 adjustable fan speeds", "1-year warranty on spares"],
        tags: ["Industrial", "Energy Saver"],
      },
      {
        name: "Jet Air KM35 Evaporative Cooler",
        btu: "22,000 m³/h",
        image: P("jet_air_evap_cooler_km_series.png"),
        features: ["High-performance cooling pads", "LED display wired remote", "High-quality air pre-filter", "1-year warranty on spares"],
        tags: ["Industrial", "Energy Saver"],
      },
    ],
  },
  {
    title: "Portable Units",
    description:
      "Flexible, plug-and-play cooling that moves where you need it. No installation required — simply position, plug in, and enjoy immediate relief. Perfect for temporary spaces, events, server rooms, spot cooling on factory floors, or as a supplementary cooling solution during peak summer months.",
    products: [
      {
        name: "Jet Air Q-Plus Portable AC",
        btu: "12,000 BTU",
        image: P("jet_air_portable_air_conditioner_q_plus_heating_cooling.jpg"),
        features: ["Heating & Cooling", "Suitable for rooms up to 25m²", "2.5M exhaust hose included"],
        tags: ["Portable", "Plug & Play"],
      },
      {
        name: "Jet Air Kreen Portable Evap Cooler",
        btu: "40,000 m³/h",
        image: P("jet_air_products.jpg"),
        features: ["Cooling only", "200L water tank", "Suitable for outdoor settings"],
        tags: ["High Capacity", "Outdoor", "Portable"],
      },
      {
        name: "Jet Air Portable Evap Cooler 9K",
        btu: "9,000 m³/h",
        image: P("jet_air_portableevap_9000m3h.png"),
        features: ["Cooling only", "125L water tank", "Suitable for outdoor settings"],
        tags: ["Compact", "Outdoor", "Portable"],
      },
      {
        name: "Jet Air Portable Evap Cooler 18K",
        btu: "18,000 m³/h",
        image: P("jet_air_kf_evap_cooler_18000m3h.png"),
        features: ["Cooling only", "125L water tank", "Suitable for outdoor settings"],
        tags: ["Outdoor", "Portable"],
      },
    ],
  },
  {
    title: "Window Wall Units",
    description:
      "Compact, cost-effective air conditioning that fits directly into a window opening or through a wall sleeve. A practical choice for small apartments, cottages, site offices, and budget-conscious projects where simplicity and reliability matter most.",
    products: [
      {
        name: "Jet Air Window Wall Inverter",
        btu: "9,000 – 24,000 BTU",
        image: P("jet_air_window_wall_heating_cooling.png"),
        features: ["Cooling only", "Timer mode (up to 24 hours)", "Auto swing mode"],
        tags: ["Inverter", "Compact"],
      },
      {
        name: "Jet Air Window Wall Non-Inverter (H&C)",
        btu: "9,000 – 24,000 BTU",
        image: P("jet_air_products.png"),
        features: ["Heating & Cooling", "Timer mode (up to 24 hours)", "Auto swing mode"],
        tags: ["Heat & Cool", "Compact"],
      },
      {
        name: "Jet Air Window Wall Non-Inverter (Cool)",
        btu: "9,000 – 24,000 BTU",
        image: P("jet_air_products-1.png"),
        features: ["Cooling only", "Auto fan mode", "Auto swing mode"],
        tags: ["Budget Friendly", "Compact"],
      },
    ],
  },
  {
    title: "Air Curtains",
    description:
      "Create an invisible barrier of air across doorways and entrances to maintain indoor temperature, reduce energy loss, and block dust, insects, and odours. Essential for retail stores, cold rooms, restaurants, and any commercial space with high foot traffic and frequent door openings.",
    products: [
      {
        name: "Jet Air Air Curtain (Grid)",
        btu: "900 / 1200 / 1500mm",
        image: P("jet_air_air_curtain_grid.png"),
        features: ["Blocks heat from entering", "Prevents cold from escaping", "Blocks dust, odours, insects"],
        tags: ["Grid Style", "Energy Saver"],
      },
      {
        name: "Jet Air Air Curtain (Smooth)",
        btu: "900 / 1200 / 1500mm",
        image: P("jet_air_air_curtain_smooth.png"),
        features: ["Blocks heat from entering", "Prevents cold from escaping", "Blocks dust, odours, insects"],
        tags: ["Smooth Style", "Energy Saver"],
      },
    ],
  },
  {
    title: "Rooftop Package Units",
    description:
      "All-in-one packaged HVAC systems installed on rooftops, freeing up interior mechanical space. Designed for medium to large commercial buildings, these self-contained units handle both cooling and heating with high-capacity performance. Ideal for shopping centres, office blocks, and institutional buildings.",
    products: [
      {
        name: "Jet Air Rooftop Package Inverter",
        btu: "22 – 108 KW",
        image: P("jet_air_rooftop_inverter.png"),
        features: ["Heating & Cooling of large areas", "Filter service notification", "Power-off memory function"],
        tags: ["High Capacity", "All-in-One", "Inverter"],
      },
      {
        name: "Jet Air Large Package",
        btu: "105 – 365 KW",
        image: P("jet_air_large_rooftop_package.png"),
        features: ["Heating & Cooling of large areas", "Filter service notification", "Power-off memory function"],
        tags: ["Max Capacity", "All-in-One", "Commercial"],
      },
    ],
  },
  {
    title: "Floor Standing Units",
    description:
      "Powerful, freestanding air conditioners designed for large open areas where wall or ceiling mounting isn't feasible. With high airflow capacity and robust construction, these units excel in lobbies, auditoriums, banquet halls, and open-plan offices requiring substantial heating and cooling output.",
    products: [
      {
        name: "Jet Air Floor Standing Non-Inverter",
        btu: "24,000 & 60,000 BTU",
        image: P("Jet_Air_Floorstanding_Non_inverter2460btu.png"),
        features: ["Heating & Cooling", "Auto restart", "Wide voltage range"],
        tags: ["Value Choice", "Dual BTU Size"],
      },
      {
        name: "Jet Air Floor Standing Inverter",
        btu: "36,000 BTU",
        image: P("jet_air_floorstanding_inverter_36000btu.png"),
        features: ["Heating & Cooling", "Auto restart", "Wide voltage range"],
        tags: ["High Output", "Commercial"],
      },
      {
        name: "Jet Air Shine Floor Standing Inverter",
        btu: "24,000 BTU",
        image: P("jet_air_shine_floorstanding_inverter.png"),
        features: ["Heating & Cooling", "Auto restart", "Wide voltage range"],
        tags: ["Inverter", "Design Edition"],
      },
      {
        name: "Jet Air Industrial Floor Standing Inverter",
        btu: "96,000 BTU",
        image: P("jet_air_floorstanding_inverter_96000btu.png"),
        features: ["Heating & Cooling", "Auto restart", "Wide voltage range"],
        tags: ["Max Output", "Industrial", "Inverter"],
      },
    ],
  },
];

// ============================================================
// Our Work / Portfolio Data — with local project images
// ============================================================

export interface Project {
  name: string;
  slug: string;
  image: string;
  gallery?: string[];
  description: string;
  location?: string;
  year?: string;
  equipment?: string;
  client?: string;
}

export interface PortfolioSection {
  title: string;
  projects: Project[];
}

const PJ = (name: string) => `/images/projects/${name}`;

export const portfolioData: PortfolioSection[] = [
  {
    title: "Commercial",
    projects: [
      {
        name: "Ford & VW (Mokopane)",
        slug: "ford-vw-mokopane",
        image: PJ("WhatsApp-Image-2024-03-12-at-08.04.32.jpeg"),
        description: "LG Multi DVM systems, individual LG splits, and ducted units, plus fresh air and extraction systems for airflow and ventilation across both dealerships.",
        location: "Mokopane, Limpopo",
        year: "2023",
        equipment: "LG Multi DVM, LG High Wall Splits, Ducted Units, Fresh Air & Extraction Systems",
        client: "Ford & Volkswagen Dealerships",
      },
      {
        name: "Montego Pet Nutrition",
        slug: "montego-pet-nutrition",
        image: PJ("Montego.jpg"),
        description: "A LG Multi-V 5 Pro system plus individual units were supplied and installed across Ground, First, and Second floors at Centurion in 2022.",
        location: "Centurion, Gauteng",
        year: "2022",
        equipment: "LG Multi-V 5 Pro, Individual Split Units",
        client: "Montego Pet Nutrition",
      },
      {
        name: "Planet Fitness Linton Corner",
        slug: "planet-fitness-linton-corner",
        image: PJ("PLANET_FITNESS_LINTON_HVAC.jpeg"),
        description: "Multiple Daikin ducted units and Airco air handling units installed, plus ventilation, toilet extraction, hot water storage tank, heat pump, and inline heater.",
        location: "Linton Corner, Gauteng",
        year: "2022",
        equipment: "Daikin Ducted Units, Airco AHU, Ventilation, Heat Pump, Hot Water Storage",
        client: "Planet Fitness",
      },
      {
        name: "Planet Fitness Irene Link",
        slug: "planet-fitness-irene-link",
        image: PJ("planet_fitness_irene_link.jpeg"),
        description: "Full HVAC installation including air conditioning, ventilation, hot water plant, heat pumps, circulation pumps, hot water tanks, and in-line heater.",
        location: "Irene Link, Centurion",
        year: "2023",
        equipment: "HVAC System, Hot Water Plant, Heat Pumps, Circulation Pumps, In-line Heater",
        client: "Planet Fitness",
      },
      {
        name: "Medicross Clinics",
        slug: "medicross-clinics",
        image: PJ("Montego.jpg"),
        description: "Across the Gauteng area, we maintain, service, and repair the air conditioning equipment for all the Medicross Clinics, ensuring optimal climate control for healthcare environments.",
        location: "Multiple Locations, Gauteng",
        year: "Ongoing",
        equipment: "Various Split & Ducted Air Conditioning Systems",
        client: "Medicross Clinics",
      },
      {
        name: "Habsburg Capital",
        slug: "habsburg-capital",
        image: PJ("habsburg_capital.jpg"),
        description: "Trane chilled water fan coil units with water piping, ducting, and diffusers installed for a premium commercial office fit-out.",
        location: "Gauteng",
        year: "2022",
        equipment: "Trane Chilled Water Fan Coil Units, Water Piping, Ducting, Diffusers",
        client: "Habsburg Capital",
      },
      {
        name: "Fochville Abattoir",
        slug: "fochville-abattoir",
        image: PJ("fochville_abattoir.jpg"),
        description: "Fresh air via evaporative cooling to cool introduced air and assist with odour removal for this large-scale abattoir facility.",
        location: "Fochville, Gauteng",
        year: "2021",
        equipment: "Evaporative Cooling Systems, Fresh Air Intake, Extraction Systems",
        client: "Fochville Abattoir",
      },
      {
        name: "Lebone Litho Printers",
        slug: "lebone-litho-printers",
        image: PJ("lebone_printers.webp"),
        description: "LG Multi V System with ducted split units installed for one of South Africa's largest printing companies, providing precise climate control for print production.",
        location: "Gauteng",
        year: "2022",
        equipment: "LG Multi V System, Ducted Split Units",
        client: "Lebone Litho Printers",
      },
      {
        name: "Bophelong Psychiatric Hospital",
        slug: "bophelong-psychiatric-hospital",
        image: PJ("New-Bophelong-Psychiatric-Hospital.jpg"),
        description: "Working with Group 5 — 132 fan coil units, 79 split units, and 47 extraction systems supplied and installed for this major healthcare facility.",
        location: "Gauteng",
        year: "2020",
        equipment: "132 Fan Coil Units, 79 Split Units, 47 Extraction Systems",
        client: "Group 5 / Department of Health",
      },
      {
        name: "Natalspruit Hospital",
        slug: "natalspruit-hospital",
        image: PJ("natalspruit-hospital.jpg"),
        description: "Samsung VRV system installed in the living quarters, training centre, and daycare facility for doctors and nurses at Natalspruit Hospital.",
        location: "Natalspruit, Gauteng",
        year: "2021",
        equipment: "Samsung VRV System",
        client: "Department of Health",
      },
      {
        name: "Essellen Street Clinic",
        slug: "essellen-street-clinic",
        image: PJ("Essellen-Steet-Clinic.jpg"),
        description: "Comprehensive refurbishment of the Chiller Plant and Air Handling units at Esselen Park clinic, restoring full climate control capabilities.",
        location: "Esselen Park, Gauteng",
        year: "2021",
        equipment: "Chiller Plant, Air Handling Units",
        client: "Department of Health",
      },
      {
        name: "Crawford International School",
        slug: "crawford-international-school",
        image: PJ("crawford-school.jpg"),
        description: "Air conditioning equipment supplied and installed for both the primary and high school campuses, including ongoing maintenance and service support.",
        location: "Gauteng",
        year: "2022",
        equipment: "Split Units, Ducted Systems",
        client: "Crawford International School",
      },
    ],
  },
  {
    title: "Industrial",
    projects: [
      {
        name: "Builders Warehouse Strubensvalley",
        slug: "builders-warehouse-strubensvalley",
        image: PJ("CENTURION-SYSTEM.jpg"),
        description: "In 2021, 39 evaporative coolers were installed for the Massmart group to keep the store cool via water evaporation — a cost-effective industrial cooling solution for large retail spaces.",
        location: "Strubensvalley, Gauteng",
        year: "2021",
        equipment: "39 Evaporative Coolers",
        client: "Massmart / Builders Warehouse",
      },
      {
        name: "Cullinan Library",
        slug: "cullinan-library",
        image: PJ("cullinan-library.jpg"),
        description: "Comprehensive HVAC system including rooftop package units, VRF units, fresh air and extraction systems, evaporative coolers, plus plumbing and fire systems for this community library.",
        location: "Cullinan, Gauteng",
        year: "2022",
        equipment: "Rooftop Package Units, VRF Units, Evaporative Coolers, Fresh Air & Extraction",
        client: "Department of Infrastructure",
      },
      {
        name: "Abram Hlophe Primary School",
        slug: "abram-hlophe-primary-school",
        image: PJ("Exec-Air_AbramHlophePrimarySchool_2023.jpg"),
        description: "Part of the Department of Infrastructure development — ventilation systems installed for administration, laboratories, storerooms, and kitchen facilities.",
        location: "Gauteng",
        year: "2023",
        equipment: "Ventilation Systems, Extraction Systems",
        client: "Department of Infrastructure",
      },
      {
        name: "Centurion Systems",
        slug: "centurion-systems",
        image: PJ("CENTURION-SYSTEM.jpg"),
        description: "LG Electronics Multi-V systems installed at Production Park, Northriding. Over 35 Hide-Away and Cassette units providing climate control across the manufacturing facility.",
        location: "Production Park, Northriding",
        year: "2022",
        equipment: "LG Multi-V Systems, 35+ Hide-Away & Cassette Units",
        client: "Centurion Systems",
      },
    ],
  },
  {
    title: "Residential",
    projects: [
      {
        name: "Former CEO of First Rand Limited",
        slug: "former-ceo-first-rand",
        image: PJ("HOUSE-SIZWE.webp"),
        description: "LG Electronics Multi-V Sync II system installed for the former CEO of First Rand Limited at their private residence — a premium, whisper-quiet whole-home climate solution.",
        location: "Johannesburg, Gauteng",
        year: "2022",
        equipment: "LG Multi-V Sync II System",
        client: "Private Residence",
      },
      {
        name: "Sabuti Simbithi Eco Estate",
        slug: "sabuti-simbithi-eco-estate",
        image: PJ("sabuti.jpg"),
        description: "More than 1,000 midwall split air conditioning units installed across this prestigious eco estate, ensuring comfort across all residences while maintaining energy efficiency.",
        location: "Simbithi, KwaZulu-Natal",
        year: "2021",
        equipment: "1,000+ Midwall Split Units",
        client: "Sabuti Simbithi Eco Estate",
      },
      {
        name: "Fabulous Homes (Farhill Manor)",
        slug: "fabulous-homes-farhill-manor",
        image: PJ("Farhills-8.jpg"),
        description: "76 Jet Air high wall split units installed in a boutique hotel-inspired residential complex, delivering reliable and efficient climate control for every unit.",
        location: "Farhill Manor, Gauteng",
        year: "2023",
        equipment: "76 Jet Air High Wall Split Units",
        client: "Fabulous Homes",
      },
      {
        name: "University of Johannesburg (Student Residences)",
        slug: "uj-student-residences",
        image: PJ("uj.jpg"),
        description: "Air conditioning systems plus hot and cold-water systems installed for UJ student residences, ensuring comfortable living conditions for thousands of students.",
        location: "Johannesburg, Gauteng",
        year: "2022",
        equipment: "Air Conditioning Systems, Hot & Cold Water Systems",
        client: "University of Johannesburg",
      },
    ],
  },
];

// ============================================================
// Brand Partners
// ============================================================

export const brandPartners = [
  { name: "Jet-Air", image: "/images/logos/jet-air-logo.png" },
  { name: "LG", image: "/images/partners/Exec-Air_PartnerLogo_LG_2023.jpg" },
  { name: "Daikin", image: "/images/partners/Exec-Air_PartnerLogo_Daikin_2023.jpg" },
  { name: "Hisense", image: "/images/partners/Exec-Air_PartnerLogo_Hisense_2023.jpg" },
  { name: "Alliance", image: "/images/partners/Exec-Air_PartnerLogo_Alliance_2023.jpg" },
  { name: "DB", image: "/images/partners/Exec-Air_PartnerLogo_DB_2023.jpg" },
  { name: "Samsung", image: "/images/partners/Exec-Air_PartnerLogo_Samsung_2023.jpg" },
  { name: "Midea", image: "/images/partners/Exec-Air_PartnerLogo_Midea_2023.jpg" },
  { name: "York", image: "/images/partners/Exec-Air_PartnerLogo_York_2023.jpg" },
];
