/**
 * Central content model for the Endless Luxury site.
 * Presentational components consume this data so copy stays exact and in one place.
 */

export const site = {
  name: "Endless Luxury",
  phone: "083 372 7295",
  phoneHref: "tel:0833727295",
  email: "philipokoh24@gmail.com",
  emailHref: "mailto:philipokoh24@gmail.com",
  tagline: "Seamless access to cars, chauffeurs, and experiences that matter.",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "Services", href: "/services" },
  { label: "Talk To Us", href: "/talk-to-us" },
];

/** Service types used in the enquiry / contact form dropdowns. */
export const serviceTypes = [
  "Chauffeur Driven Car",
  "Executive Car",
  "Armoured Vehicle",
  "Film Shoots Car",
  "Matric Dance Car",
  "Wedding Car",
  "VIP Protection Security",
  "Point to Point Transfers",
  "Yacht Charter",
  "Private Aircraft",
];

/** Home + footer service anchor links. */
export const serviceLinks = [
  { label: "Chauffeur Driven Car", anchor: "chauffeur-driven-car" },
  { label: "Executive Car", anchor: "executive-car" },
  { label: "Armoured Vehicle", anchor: "armoured-vehicle" },
  { label: "Film Shoots Car", anchor: "film-shoots-car" },
  { label: "Matric Dance Car", anchor: "matric-dance-car" },
  { label: "Wedding Car", anchor: "wedding-car" },
  { label: "VIP Protection Security", anchor: "vip-protection-security" },
  { label: "Point To Point Transfers", anchor: "point-to-point-transfers" },
  { label: "Yacht Charter", anchor: "yacht-charter" },
  { label: "Private Aircraft", anchor: "private-aircraft" },
];

/** Fleet carousel on the home page. */
export const fleet = [
  {
    title: "Convertibles",
    image: "/images/carousel-1.png",
    description:
      "We connect you with convertibles that combine performance and freedom, perfect for events, shoots, or making a lasting impression.",
  },
  {
    title: "Sedans",
    image: "/images/carousel-2.png",
    description:
      "Executive sedans arranged with discretion and style, ideal for corporate transfers or seamless point-to-point travel.",
  },
  {
    title: "SUVs",
    image: "/images/carousel-3.png",
    description:
      "We arrange premium SUVs that balance space, safety, and sophistication which is the ideal choice for family travel, VIP transfers, or business on the move.",
  },
  {
    title: "Supercars",
    image: "/images/carousel-4.png",
    description:
      "From Ferrari to Lamborghini, we secure statement-making supercars designed for impact and thrill.",
  },
  {
    title: "People Carriers",
    image: "/images/carousel-5.png",
    description:
      "Arranged for larger parties, our people carriers ensure everyone arrives together in comfort and style.",
  },
];

/** "Why Choose Us" cards. */
export const whyChooseUs = [
  {
    title: "Curated Connections",
    icon: "/images/carKyeIcon.png",
    description:
      "We partner with only trusted providers, giving you access to vehicles and services that meet the highest standards.",
  },
  {
    title: "Seamless Service",
    icon: "/images/serviceIcon.png",
    description:
      "From your first enquiry to the final drop-off, every detail is managed with precision and ease.",
  },
  {
    title: "Tailored Experience",
    icon: "/images/gearIcon.png",
    description:
      "Whether it's a wedding, film shoot, or milestone celebration, we arrange vehicles that perfectly match your occasion.",
  },
  {
    title: "Trusted Standards",
    icon: "/images/standardsIcon.png",
    description:
      "Every vehicle and partner is thoroughly vetted, guaranteeing reliability and lasting peace of mind.",
  },
];

/** "Make every moment unforgettable" showcase cards. */
export const showcase = [
  {
    title: "Executive Cars",
    description: "Eye-catching vehicles to showcase your brand in style.",
  },
  {
    title: "Film Shoots",
    description: "Stand-out cars sourced for advertising, music videos, and feature films.",
  },
  {
    title: "Matric Dance Hire",
    description: "Statement arrivals arranged for your once-in-a-lifetime night.",
  },
  {
    title: "Wedding Hire",
    description: "Classic and modern vehicles tailored to your perfect entrance.",
  },
];

/** FAQ accordion (home + services pages). */
export const faqs = [
  {
    q: "How does Endless Luxury work?",
    a: "We act as your connector to premium vehicle providers. Tell us what you need, and we'll arrange the perfect vehicle and service through our trusted partners.",
  },
  {
    q: "Can I request a specific car model?",
    a: "Yes. If the exact model isn't available, we'll recommend the closest option that meets your expectations.",
  },
  {
    q: "How far in advance should I book?",
    a: "For events and special occasions, a week or more is recommended. For point-to-point transfers or short-notice bookings, we'll do our best to arrange availability.",
  },
  {
    q: "Is pricing fixed?",
    a: "Prices depend on the vehicle, service type, and duration. We provide a tailored quote upfront so you know exactly what to expect.",
  },
  {
    q: "Do you provide chauffers?",
    a: "Yes. Many of our arrangements include professional chauffeurs, ensuring your journey is handled with discretion and care.",
  },
];

/** Vehicle categories on the /vehicles page (each has a 2x2 image grid). */
export const vehicleCategories = [
  {
    title: "Convertibles",
    description:
      "We connect you with convertibles that combine performance and freedom, perfect for events, shoots, or making a lasting impression.",
    images: [
      "/images/Mercedes-Benz-C-Class-Cabriolet.png",
      "/images/BMW-4-Series-Convertible.png",
      "/images/Mini-Cooper-Convertible.png",
      "/images/audi-a5-cabriolet.png",
    ],
  },
  {
    title: "Sedans",
    description:
      "Executive sedans arranged with discretion and style, ideal for corporate transfers or seamless point-to-point travel.",
    images: [
      "/images/mercedes-benz-s-class.png",
      "/images/BMW-7-Series-1.png",
      "/images/Audi-A6-1.png",
      "/images/Lexus-ES-300h-1.png",
    ],
  },
  {
    title: "SUVs",
    description:
      "We arrange premium SUVs that balance space, safety, and sophistication which is the ideal choice for family travel, VIP transfers, or business on the move.",
    images: [
      "/images/Range-Rover-Vogue-Sport-1.png",
      "/images/Mercedes-Benz-GLE-GLS-1.png",
      "/images/BMW-X5-X7-1.png",
      "/images/Toyota-Land-Cruiser-300-1.png",
    ],
  },
  {
    title: "Supercars",
    description:
      "From Ferrari to Lamborghini, we secure statement-making supercars designed for impact and thrill.",
    images: [
      "/images/Lamborghini-Huracan-1.png",
      "/images/Ferrari-Portofino.png",
      "/images/Porsche-911-Carrera-S.png",
      "/images/McLaren-570S.png",
    ],
  },
  {
    title: "People Carriers",
    description:
      "Arranged for larger parties, our people carriers ensure everyone arrives together in comfort and style.",
    images: [
      "/images/Mercedes-Benz-V-Class.png",
      "/images/Hyundai-Staria-Executive.png",
      "/images/volkswagen-Caravelle.png",
      "/images/Toyota-Quantum-VX.png",
    ],
  },
  {
    title: "Yachts",
    description:
      "Whether anchored off Cape Town's iconic shoreline or gliding through serene waters, our yachts are designed to deliver unforgettable moments of comfort, privacy, and style.",
    images: [
      "/images/yach1.png",
      "/images/yach2.png",
      "/images/yach3.png",
      "/images/yacht4.png",
    ],
  },
  {
    title: "Aircrafts",
    description:
      "From agile business jets to elegant long-range aircraft, every flight is defined by efficiency, discretion, and comfort.",
    images: [
      "/images/aircraft1.png",
      "/images/aircraft2.png",
      "/images/aircraft3.png",
      "/images/aircraft4.png",
    ],
  },
];

/** Full service detail sections on the /services page. */
export const services = [
  {
    anchor: "chauffeur-driven-car",
    title: "Chauffeur-Driven Car",
    image: "/images/chauffeur-driven-car.png",
    body:
      "Experience sophistication and comfort with our Chauffeur-Driven Car service. Every journey is more than just transport; it's a tailored experience defined by elegance, punctuality, and discretion. Our professional chauffeurs are meticulously trained to ensure your travel is smooth, safe, and stress-free, allowing you to focus on what truly matters. Sit back and let Endless Luxury take care of every detail.",
    points: [
      "Professionally trained chauffeurs ensuring seamless travel",
      "Discreet, punctual, and reliable service for any occasion",
      "Luxury vehicles maintained to the highest standard",
    ],
  },
  {
    anchor: "executive-car",
    title: "Executive Car",
    image: "/images/executive-car.png",
    body:
      "Command attention and travel in style with our Executive Car service. Designed for professionals who value both comfort and class, our premium fleet offers the perfect blend of refinement and performance. Whether it's an important meeting, airport transfer, or corporate event, we ensure you arrive poised and on time. Endless Luxury sets the standard for business travel done right.",
    points: [
      "Tailored for corporate meetings, events, and airport transfers",
      "Combines comfort, class, and performance in every ride",
      "Guaranteed punctuality and professionalism for business travel",
    ],
  },
  {
    anchor: "armoured-vehicle",
    title: "Armoured Vehicle",
    image: "/images/armoured-vehicle.png",
    body:
      "When safety is paramount, our armoured vehicle service provides uncompromising protection without sacrificing luxury. Ideal for high-profile individuals and executives, these vehicles combine state-of-the-art security technology with discreet comfort. Every journey is managed with precision and confidentiality, giving you absolute peace of mind wherever your destination lies.",
    points: [
      "Advanced ballistic protection and safety-certified interiors",
      "Ideal for high-profile clients and sensitive assignments",
      "Discreet, confidential service managed by trained professionals",
    ],
  },
  {
    anchor: "film-shoots-car",
    title: "Film Shoots Car",
    image: "/images/film-shoots-car.png",
    body:
      "Bring cinematic flair to your production with our Film Shoots Car service. We provide a diverse selection of pristine, high-end vehicles suitable for feature films, commercials, and music videos. Our dedicated team works seamlessly with production crews to ensure every car meets the visual and logistical needs of your shoot on time, on set, and on point.",
    points: [
      "Wide selection of pristine luxury vehicles for on-screen use",
      "Experienced coordination with production crews and schedules",
      "Reliable delivery and presentation for film, TV, and commercial shoots",
    ],
  },
  {
    anchor: "matric-dance-car",
    title: "Matric Dance Car",
    image: "/images/matric-dance-car.png",
    body:
      "Make your matric farewell truly unforgettable with our Matric Dance Car service. Arrive in luxury and style with a vehicle that complements the occasion perfectly. From sleek sports cars to timeless classics, we provide an experience that adds the finishing touch to your big night because at Endless Luxury, we believe every milestone deserves to be celebrated in style.",
    points: [
      "Arrive in sophistication with a show-stopping vehicle",
      "Choice of luxury sports, convertible, or classic cars",
      "Chauffeur ensures punctual arrivals and smooth coordination",
    ],
  },
  {
    anchor: "wedding-car",
    title: "Wedding Car",
    image: "/images/wedding-car.png",
    body:
      "Turn your wedding day into a timeless memory with our Wedding Car service. Choose from a curated collection of luxury vehicles that reflect your unique style and theme. From elegant vintage models to modern masterpieces, each car is immaculately prepared for your special day. Our chauffeurs ensure everything runs flawlessly, from the first arrival to your grand exit.",
    points: [
      "Curated fleet of modern and vintage luxury vehicles",
      "Professional chauffeurs dedicated to flawless timing",
      "Custom ribbons, décor, and presentation available on request",
    ],
  },
  {
    anchor: "vip-protection-security",
    title: "VIP Protection Security",
    image: "/images/vip-protection-security.png",
    body:
      "Your safety is our highest priority. Our VIP Protection Security service combines professional drivers with elite, discreet security personnel for high-profile clients and events. Every team member is trained in advanced protection and threat assessment, ensuring a seamless balance of comfort, confidentiality, and security. Travel with confidence, you're in expert hands.",
    points: [
      "Professionally trained protection drivers and security personnel",
      "Discreet, confidential operations for peace of mind",
      "Integrated travel planning for secure, efficient movement",
    ],
  },
  {
    anchor: "point-to-point-transfers",
    title: "Point to Point Transfers",
    image: "/images/point-to-point-transfers.png",
    body:
      "Simplify your travel with our Point to Point Transfers. Whether it's an airport pick-up, hotel transfer, or private meeting, we make sure every leg of your journey is handled with precision and care. Expect punctual arrivals, pristine vehicles, and a smooth, uninterrupted ride from one destination to the next. Endless Luxury ensures every journey feels effortless.",
    points: [
      "Efficient and reliable transfers for any route or destination",
      "Always on time — every pickup, every drop-off",
      "Smooth, private, and stress-free travel experience",
    ],
  },
  {
    anchor: "yacht-charter",
    title: "Yacht Charter",
    image: "/images/yachtCharter.png",
    body:
      "Set sail in absolute luxury with our bespoke Yacht Charter service. Whether it's a private celebration, a corporate retreat, or a weekend escape along South Africa's stunning coastline, Endless Luxury delivers an experience defined by privacy, indulgence, and personalised service.",
    points: [
      "Exclusive access to luxury yachts and private charters",
      "Professional crew and onboard hospitality tailored to your preferences",
      "Custom routes, catering, and event planning on request",
    ],
  },
  {
    anchor: "private-aircraft",
    title: "Private Aircraft",
    image: "/images/private-aircraft.png",
    body:
      "Take control of your time and privacy with our Private Aircraft service, designed for discerning clients who value exclusivity, flexibility, and speed. Whether it's a business trip, international event, or weekend getaway, Endless Luxury ensures your journey is seamless from takeoff to landing.",
    points: [
      "Flexible scheduling and private air travel across South Africa and beyond",
      "VIP terminals, priority boarding, and discreet handling",
      "End-to-end coordination with ground transport and concierge support",
    ],
  },
];
