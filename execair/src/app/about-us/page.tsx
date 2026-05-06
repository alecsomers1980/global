import type { Metadata } from "next";
import Image from "next/image";
import PageBanner from "@/components/PageBanner";
import BrandPartners from "@/components/BrandPartners";
import BottomCTA from "@/components/BottomCTA";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Exec-Air is a proudly South African company specialising in HVAC since 1989. Learn about our 35+ years of heating, ventilation, and air conditioning expertise.",
};

const marketSectors = [
  {
    title: "Commercial",
    image: "https://execair.co.za/wp-content/uploads/2023/07/Exec-Air_AboutUs_2023_-2.png",
    items: [
      "Shopping Centres",
      "Server Rooms",
      "Office Developments",
      "Hotels",
      "Healthcare",
      "Educational Institutions",
    ],
  },
  {
    title: "Industrial",
    image: "https://execair.co.za/wp-content/uploads/2023/07/Exec-Air_Aboutus_2023_1.png",
    items: [
      "Mining",
      "Transportation Hubs",
      "Food Supply Chain",
      "Government Infrastructure",
      "Factories",
      "Warehouses",
    ],
  },
  {
    title: "Residential",
    image: "https://execair.co.za/wp-content/uploads/2023/07/Exec-Air_AboutUs_2023_3.png",
    items: [
      "Single Residences",
      "Estates",
      "Complexes",
      "Social Developments",
      "Gyms, Recreational & Travel Nodes",
    ],
  },
];

const services = [
  {
    title: "Installations, Repairs & Services",
    description:
      "Full HVAC solutions for commercial, industrial, and residential properties — from single units to large-scale systems.",
  },
  {
    title: "Design, Build & Installation",
    description:
      "Custom ventilation and extraction systems engineered to your exact requirements for optimal airflow and air quality.",
  },
  {
    title: "Maintenance & Repair Contracts",
    description:
      "Comprehensive HVAC maintenance and repair contracts for commercial and industrial clients, ensuring peak system performance year-round.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="35+ YEARS"
        subtitle="A proudly South African based company that specialises in HVAC (Heating, Ventilation and Air-Conditioning). Founded in 1989, we have provided HVAC solutions to some of Southern Africa's leading brands."
      />

      {/* The Right Stuff */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            {/* Image */}
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="https://execair.co.za/wp-content/uploads/2023/07/AIR-CONDITIONER-BEING-INSTALLED-1-1024x576.png"
                alt="Air conditioner being installed"
                width={800}
                height={800}
                className="aspect-square w-full object-cover"
              />
            </div>

            {/* Text */}
            <div>
              <p className="section-label mb-4">The Right Stuff</p>
              <h2 className="section-heading mb-6">Experience you can trust</h2>
              <p className="text-lg leading-relaxed text-brand-navy/70">
                Over 35 years, Exec-Air has built up knowledge and industry-specific expertise,
                offering a fresh approach in a field plagued by sub-standard workmanship. Our
                commitment to quality and customer satisfaction sets us apart from the competition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Best */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="section-label mb-4">What We Do Best</p>
            <h2 className="section-heading">
              Full range of services including but not limited to
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex rounded-xl bg-brand-teal/10 p-3">
                  <svg className="h-6 w-6 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-lg font-bold text-brand-navy">{service.title}</h3>
                <p className="leading-relaxed text-brand-navy/60">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Sectors */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="section-label mb-4">Market Sectors</p>
            <h2 className="section-heading">Industries we serve</h2>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {marketSectors.map((sector) => (
              <div
                key={sector.title}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={sector.image}
                    alt={sector.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/30 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                    {sector.title}
                  </h3>
                </div>
                <ul className="space-y-2 p-6">
                  {sector.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-brand-navy/70">
                      <svg className="h-4 w-4 flex-shrink-0 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Showcase */}
      <section className="bg-brand-navy py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="section-label mb-4 text-white/60">See Us in Action</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Watch our team at work
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/60">
              Get a behind-the-scenes look at how we deliver professional HVAC solutions
              across South Africa.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {/* Video 1 */}
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/VArLefoMXZE"
                  title="EXEC-AIR AIR CONDITIONING - HVAC SOLUTIONS"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>

            {/* Video 2 */}
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div className="relative aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/wgxQV4ryiVI"
                  title="Complete installation of Evaporative Cooling Systems"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Partners */}
      <BrandPartners />

      <BottomCTA />
    </>
  );
}
