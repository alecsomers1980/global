import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";
import { vehicleCategories } from "@/data/site";

export const metadata: Metadata = {
  title: "Vehicles",
};

export default function VehiclesPage() {
  return (
    <>
      <PageBanner
        eyebrow="WHAT WE OFFER"
        title="Vehicles"
        image="/images/vehiclesBanner.jpg"
      />

      {vehicleCategories.map((cat, i) => (
        <section
          key={cat.title}
          className={`${i % 2 === 0 ? "bg-cream" : "bg-white"} py-16 md:py-20`}
        >
          <div className="el-container grid lg:grid-cols-2 gap-10 items-center">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <span className="el-eyebrow">OUR FLEET</span>
              <h2 className="font-heading text-navy font-bold text-3xl md:text-4xl mt-3">
                {cat.title}
              </h2>
              <p className="text-muted mt-4">{cat.description}</p>
              <Link
                href="/talk-to-us"
                className="bg-gold text-white uppercase text-sm tracking-wide font-heading rounded-[10px] px-7 py-3 inline-block mt-6 hover:bg-gold-dark transition"
              >
                Contact Us →
              </Link>
            </div>

            <div
              className={`grid grid-cols-2 gap-4 ${i % 2 === 1 ? "lg:order-1" : ""}`}
            >
              {cat.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] rounded-[10px] overflow-hidden bg-white shadow-[0_1px_10px_rgba(18,25,97,0.08)]"
                >
                  <Image
                    src={img}
                    alt={cat.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
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
    </>
  );
}
