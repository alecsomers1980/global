import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import Faq from "@/components/home/Faq";
import { services } from "@/data/site";

export const metadata: Metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <>
      <PageBanner
        eyebrow="HIRING"
        title="Services"
        image="/images/servicesBanner.jpg"
      />

      {services.map((s, i) => (
        <section
          key={s.anchor}
          id={s.anchor}
          className={`${
            i % 2 === 0 ? "bg-cream" : "bg-white"
          } py-16 md:py-20 scroll-mt-24`}
        >
          <div className="el-container grid lg:grid-cols-2 gap-10 items-center">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="relative h-[340px] rounded-[10px] overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <span className="el-eyebrow">SERVICES</span>
              <h2 className="font-heading text-navy font-bold text-3xl md:text-4xl mt-3">
                {s.title}
              </h2>
              <p className="text-muted mt-4">{s.body}</p>
              <ul className="mt-6 space-y-3">
                {s.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-navy text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 flex-shrink-0 text-gold"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-navy py-16">
        <div className="el-container text-center">
          <p className="text-white font-heading text-lg md:text-xl max-w-3xl mx-auto">
            At Endless Luxury, it&apos;s not just about getting from A to B,
            it&apos;s about experiencing the journey in absolute refinement.
            <Link
              href="/talk-to-us"
              className="text-gold hover:underline ml-1"
            >
              Get in Touch →
            </Link>
          </p>
        </div>
      </section>

      <Faq />
    </>
  );
}
