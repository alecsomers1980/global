import Image from "next/image";
import Link from "next/link";

export default function BottomCTA() {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6 text-center">
        {/* 35 Years Badge */}
        <Image
          src="/images/icons/OVER-35-YEARS-OF-EXPERIENCE.png"
          alt="Over 35 Years of Experience"
          width={200}
          height={200}
          className="mx-auto mb-6 h-auto w-48"
        />

        <h2 className="section-heading mb-4">See our latest work</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-brand-navy/60">
          With over three decades of industry expertise, we continue to deliver exceptional HVAC
          solutions to businesses and homes across South Africa.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/our-work" className="btn-primary text-lg">
            VIEW OUR WORK
          </Link>
          <Link
            href="/docs/EAMC-COMPANY-PROFILE-2025.pdf"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-teal px-8 py-3 font-semibold text-brand-teal transition-all duration-300 hover:bg-brand-teal hover:text-white active:scale-95"
          >
            Download Company Profile
          </Link>
        </div>
      </div>
    </section>
  );
}
