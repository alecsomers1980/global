import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { StockistForm } from "./StockistForm";

export const metadata: Metadata = {
  title: "Become a Stockist",
  description:
    "Apply to stock Rehoboth Herbal Co. — grown, dried, milled and packed on one farm at Low's Creek, Mpumalanga. Wholesale from 10 units a line.",
};

export default function StockistsPage() {
  return (
    <>
      <Header />
      <PageBanner
        eyebrow="Wholesale"
        title={
          <>
            Room on your shelf
            <br />
            for something grown slowly.
          </>
        }
      />
      <main>
        <div className="mx-auto max-w-[900px] px-6 py-16 md:px-16 md:py-20">
          <div className=" flex flex-col gap-5 text-[17px] leading-relaxed text-ink-soft">
            <p>
              Everything we sell is grown, dried, milled and packed on one farm at
              Low&rsquo;s Creek in Mpumalanga. One plant to a bottle, picked by hand
              and filled in the room it was dried in. We supply independent shops,
              farm stalls, pharmacies and wellness practices around South Africa.
            </p>
            <p>
              Wholesale starts at ten units a line. Trade prices are shared once an
              application is approved, so we can talk properly about what suits your
              shelf before you commit to anything.
            </p>
          </div>

          <div className="mt-14 grid gap-8 border-t border-hairline pt-10 sm:grid-cols-3">
            <div>
              <h2 className="font-display text-lg text-ink">1. Apply</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                Tell us about your shop using the form below. It takes a minute.
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">2. We call you</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                A short conversation about your customers and which lines fit them.
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg text-ink">3. Prices and first order</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                Once approved you get the trade list and we pack your first order.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="font-display text-3xl text-ink md:text-[38px]">
              Apply to stock Rehoboth
            </h2>
            <div className="mt-8">
              <StockistForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
