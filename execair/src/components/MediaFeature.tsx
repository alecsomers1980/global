import Image from "next/image";

export default function MediaFeature() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-3">
          {/* OnbytSAKE TV Feature */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-block rounded-2xl bg-brand-sky/20 p-6">
              <Image
                src="/images/icons/ontbytsake_logo.webp"
                alt="OnbytSAKE S12 E4"
                width={200}
                height={100}
                className="h-auto w-48"
              />
            </div>
            <h2 className="mb-3 text-xl font-bold text-brand-navy">As Seen on TV</h2>
            <p className="mb-6 leading-relaxed text-brand-navy/60">
              Watch our feature on OnbytSAKE Season 12 Episode 4, showcasing our HVAC expertise in action.
            </p>
            <a
              href="https://youtu.be/Gj2-lHS7RQ8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              View Now!
            </a>
          </div>

          {/* Residential AC */}
          <div className="text-center">
            <div className="mb-4 inline-block rounded-2xl bg-brand-sky/10 p-8">
              <Image
                src="/images/icons/residential-air-conditioner.webp"
                alt="Residential Air Conditioning"
                width={180}
                height={180}
                className="h-auto w-44"
              />
            </div>
            <p className="font-semibold text-brand-navy">Residential HVAC</p>
          </div>

          {/* Industrial HVAC */}
          <div className="text-center">
            <div className="mb-4 inline-block rounded-2xl bg-brand-sky/10 p-8">
              <Image
                src="/images/icons/Heavy-industrial-hvac-system.webp"
                alt="Heavy Industrial HVAC"
                width={180}
                height={180}
                className="h-auto w-44"
              />
            </div>
            <p className="font-semibold text-brand-navy">Industrial HVAC</p>
          </div>
        </div>
      </div>
    </section>
  );
}
