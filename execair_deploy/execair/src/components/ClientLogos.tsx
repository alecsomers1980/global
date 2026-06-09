import Image from "next/image";

const clients = [
  { name: "SARS", src: "/images/clients/Exec-Air_Clientlogos_SARS_2023.jpg" },
  { name: "Broll", src: "/images/clients/Exec-Air_Clientlogos_Broll_2023.jpg" },
  { name: "Builders Warehouse", src: "/images/clients/Exec-Air_Clientlogos_BuildersWharehouse_2023.jpg" },
  { name: "Hyundai", src: "/images/clients/Exec-Air_Clientlogos_Hyndai_2023.jpg" },
  { name: "Land Rover", src: "/images/clients/Exec-Air_ClientLogos_Land-Rover_2023.jpg" },
  { name: "UJ", src: "/images/clients/Exec-Air_Clientlogos_UJ_2023.jpg" },
  { name: "Planet Fitness", src: "/images/clients/Exec-Air_ClientLogo_PlanetFitness_2023.jpeg" },
  { name: "Checkers", src: "/images/clients/Exec-Air_ClientLogos_Checkers_2023.jpg" },
  { name: "Gautrain", src: "/images/clients/Exec-Air_ClientLogos_Gautrain_2023.jpg" },
];

export default function ClientLogos() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="section-label mb-4">Trusted By</p>
          <h2 className="section-heading">Clients who rely on us</h2>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-3">
          {clients.map((client) => (
            <div
              key={client.name}
              className="flex items-center justify-center rounded-xl bg-white px-3 py-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <Image
                src={client.src}
                alt={client.name}
                width={240}
                height={100}
                className="h-24 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-28"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
