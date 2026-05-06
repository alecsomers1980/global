import Image from "next/image";

const workImages = [
  {
    src: "/images/icons/hvac_floorplan.png",
    alt: "HVAC floorplan and ductwork design",
    label: "System Design",
  },
  {
    src: "/images/icons/AIR-CONDITIONER-BEING-INSTALLED-1.png",
    alt: "HVAC installation worksite",
    label: "Expert Installation",
  },
  {
    src: "/images/icons/residential_air_conditioner.png",
    alt: "Residential air conditioning unit",
    label: "Residential Units",
  },
  {
    src: "/images/icons/heavy_industrial_hvac-system.png",
    alt: "Heavy industrial HVAC system",
    label: "Industrial Systems",
  },
];

export default function Workmanship() {
  return (
    <section id="workmanship" className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="section-label mb-4">Workmanship</p>
          <h2 className="section-heading mb-4">Quality you can see</h2>
          <p className="text-lg leading-relaxed text-brand-navy/60">
            Our attention to detail and commitment to quality is evident in every project we complete,
            from initial design through to final installation.
          </p>
        </div>

        {/* 2x2 Image Grid — matching old site style */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {workImages.map((item) => (
            <div
              key={item.label}
              className="group overflow-hidden rounded-2xl bg-gray-50 shadow-md transition-all duration-500 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-bold text-white">{item.label}</h3>
                </div>
              </div>
              {/* Static label below for non-hover */}
              <div className="px-6 py-4 group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-sm font-semibold text-brand-navy">{item.label}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
