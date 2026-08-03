import Image from "next/image";
import Link from "next/link";
import { whyChooseUs } from "@/data/site";

export default function WhyChooseUs() {
  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="el-container">
        <span className="el-eyebrow">WHY CHOOSE US</span>
        <h2 className="font-heading text-navy font-bold text-3xl md:text-5xl leading-tight mt-3 max-w-lg mb-12">
          The difference is in the detail
        </h2>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div>
            <div className="relative rounded-[12px] overflow-hidden h-[380px]">
              <Image
                src="/images/home-3.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <Link
              href="/who-we-are"
              className="inline-block mt-5 text-gold uppercase text-xs tracking-wide font-heading hover:underline"
            >
              Learn More About Us →
            </Link>
          </div>

          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-6">
              {whyChooseUs.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[10px] p-6 shadow-[0_1px_10px_rgba(18,25,97,0.08)]"
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={46}
                    height={46}
                    className="h-11 w-11 object-contain"
                  />
                  <h3 className="font-heading text-navy font-semibold text-lg mt-4">
                    {item.title}
                  </h3>
                  <div className="h-0.5 w-14 bg-gold my-3" />
                  <p className="text-muted text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
