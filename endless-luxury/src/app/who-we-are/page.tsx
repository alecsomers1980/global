import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/ui/PageBanner";

export const metadata = {
  title: "Who We Are",
};

export default function WhoWeArePage() {
  return (
    <>
      <PageBanner
        eyebrow="ENDLESS LUXURY"
        title="Who We Are"
        image="/images/whowearebanner.jpg"
      />

      {/* SECTION 1 */}
      <section className="bg-cream py-20 md:py-24">
        <div className="el-container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="el-eyebrow">ABOUT US</span>
            <h2 className="font-heading text-navy font-bold text-3xl md:text-5xl leading-tight mt-3">
              Redefining the way you travel in style
            </h2>
            <p className="text-muted mt-5">
              At Endless Luxury, we redefine what it means to travel in style. With seamless access to an exclusive fleet of vehicles, professional chauffeurs, and bespoke experiences, we make every journey memorable.
            </p>
            <Link
              href="/vehicles"
              className="bg-gold text-white uppercase text-sm tracking-wide font-heading rounded-[10px] px-7 py-3 inline-block mt-6 hover:bg-gold-dark"
            >
              Browse Vehicles →
            </Link>
          </div>
          <div className="relative rounded-[12px] overflow-hidden h-[420px]">
            <Image
              src="/images/aboutus-1.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="bg-white py-20 md:py-24">
        <div className="el-container">
          <div className="text-center">
            <span className="el-eyebrow">OUR MISSION</span>
            <h2 className="font-heading text-navy font-bold text-3xl md:text-5xl mt-3">
              Excellence in Every Journey
            </h2>
            <p className="text-muted mt-5 max-w-3xl mx-auto">
              Every detail matters. That&apos;s why we partner only with trusted providers and meticulously vet every vehicle and chauffeur. Whether you&apos;re arriving at a milestone celebration or navigating the city in executive style, Endless Luxury ensures a journey that&apos;s smooth, effortless, and truly exceptional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-cream rounded-[10px] p-7 shadow-[0_1px_10px_rgba(18,25,97,0.06)]">
              <h3 className="font-heading text-navy font-semibold text-lg">
                Unmatched Comfort & Class
              </h3>
              <div className="h-0.5 w-14 bg-gold my-3" />
              <p className="text-muted text-sm">
                Every journey with Endless Luxury is designed for distinction. Combining seamless coordination, high-end vehicles, and impeccable presentation to ensure your comfort from the first moment to the last.
              </p>
            </div>
            <div className="bg-cream rounded-[10px] p-7 shadow-[0_1px_10px_rgba(18,25,97,0.06)]">
              <h3 className="font-heading text-navy font-semibold text-lg">
                Tailored for Every Occasion
              </h3>
              <div className="h-0.5 w-14 bg-gold my-3" />
              <p className="text-muted text-sm">
                From corporate transfers and red-carpet events to film shoots, weddings, and private functions, our services adapt to your needs – ensuring sophistication and reliability wherever you go.
              </p>
            </div>
            <div className="bg-cream rounded-[10px] p-7 shadow-[0_1px_10px_rgba(18,25,97,0.06)]">
              <h3 className="font-heading text-navy font-semibold text-lg">
                Driven by Precision & Care
              </h3>
              <div className="h-0.5 w-14 bg-gold my-3" />
              <p className="text-muted text-sm">
                We believe true luxury lies in the details. Each experience is shaped with precision, professionalism, and genuine care, transforming every trip into something more than transport – it&apos;s a statement of style.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-navy font-heading text-lg md:text-xl max-w-3xl mx-auto">
              At Endless Luxury, it&apos;s not just about getting from A to B, it&apos;s about experiencing the journey in absolute refinement.
              <Link
                href="/talk-to-us"
                className="text-gold hover:underline ml-1"
              >
                Get in Touch →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
