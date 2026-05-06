import Image from "next/image";

const partners = [
  { name: "Jet-Air", src: "/images/logos/jet-air-logo.png" },
  { name: "LG", src: "/images/partners/Exec-Air_PartnerLogo_LG_2023.jpg" },
  { name: "Daikin", src: "/images/partners/Exec-Air_PartnerLogo_Daikin_2023.jpg" },
  { name: "Hisense", src: "/images/partners/Exec-Air_PartnerLogo_Hisense_2023.jpg" },
  { name: "Alliance", src: "/images/partners/Exec-Air_PartnerLogo_Alliance_2023.jpg" },
  { name: "Samsung", src: "/images/partners/Exec-Air_PartnerLogo_Samsung_2023.jpg" },
  { name: "Midea", src: "/images/partners/Exec-Air_PartnerLogo_Midea_2023.jpg" },
  { name: "York", src: "/images/partners/Exec-Air_PartnerLogo_York_2023.jpg" },
];

export default function PartnerLogos() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="section-label mb-4">Our Brand Partners</p>
          <h2 className="section-heading">World-class equipment we trust</h2>
          <p className="mt-4 leading-relaxed text-brand-navy/60">
            We partner with the world&apos;s leading HVAC manufacturers to deliver quality you can rely on.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex items-center justify-center rounded-xl bg-gray-50 px-3 py-5 transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              <Image
                src={partner.src}
                alt={partner.name}
                width={200}
                height={80}
                className="h-20 w-auto object-contain opacity-60 transition-all duration-300 group-hover:opacity-100 md:h-24"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
