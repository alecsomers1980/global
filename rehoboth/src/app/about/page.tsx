import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBlock } from "@/components/layout/DisclaimerBlock";
import { ClipBand } from "@/components/home/ClipBand";
import { Reveal } from "@/components/motion/Reveal";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Our Story";
const DESCRIPTION =
  "Rehoboth Farm at Low's Creek, Mpumalanga — where the plants are grown, dried, milled and packed, and how every purchase backs rural training through Foundations for Farming.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/about"),
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageBanner
        eyebrow="Genesis 26:22"
        title={
          <>
            He called it Rehoboth,
            <br />
            for now there is room.
          </>
        }
      />
      <main>
        <section className="mx-auto max-w-[820px] px-6 py-16 md:px-16 md:py-20">
          <div className=" flex flex-col gap-5 text-[17px] leading-relaxed text-ink-soft">
            <p>
              Isaac dug three wells. The first two were fought over and taken. The
              third nobody contested, and he named it Rehoboth — <em>room</em>.
            </p>
            <p>
              It is a fair name for a farm that takes the unhurried route. Everything
              we sell is grown at Rehoboth Farm on Portion 21 of Farm 277JU Lovedale,
              Honeybird, at Low&rsquo;s Creek in Mpumalanga. It is picked by hand,
              dried under shade on the same ground it grew in, milled here, and packed
              here.
            </p>
          </div>
        </section>

        <ClipBand
          clip="drying"
          alt="Rehoboth farm workers laying harvested leaf out on drying racks"
          caption="Harvested leaf, laid out to dry under shade."
        />

        <section className="mx-auto max-w-[820px] px-6 py-16 md:px-16 md:py-24">
          <Reveal>
            <h2 className="font-display text-3xl text-ink md:text-[42px]">
              One plant, and nothing else
            </h2>
            <div className="mt-7 flex flex-col gap-5 text-[17px] leading-relaxed text-ink-soft">
              <p>
                Every bottle holds one plant. No blends, no bulking agents, nothing
                added to help a powder pour more easily through a machine. What the
                label names is what is inside, and the ingredient list is one line long
                because there is only one ingredient.
              </p>
              <p>
                The leaf is milled in small batches and filled by hand, in gloves and
                masks, in the room where it was dried. Every size carries its own
                barcode.
              </p>
            </div>
          </Reveal>
        </section>

        <ClipBand
          clip="milling"
          focus="center 28%"
          alt="Milled herb being weighed and jarred at Rehoboth Farm"
          caption="Milled, weighed and jarred on the farm."
        />

        <section className="mx-auto max-w-[820px] px-6 py-16 md:px-16 md:py-24">
          <Reveal>
            <h2 className="font-display text-3xl text-ink md:text-[42px]">
              Your purchase trains a farmer
            </h2>
            <div className="mt-7 flex flex-col gap-5 text-[17px] leading-relaxed text-ink-soft">
              <p>
                Rehoboth works with{" "}
                <strong className="font-medium text-ink">Foundations for Farming</strong>,
                which trains people in rural communities to farm their own land
                sustainably. Every order placed here helps fund a place on that
                training.
              </p>
              <p>
                It is the part of this business that does not show up on a label, and
                it is the reason the farm exists in the shape it does.
              </p>
            </div>
          </Reveal>
        </section>

        <ClipBand
          clip="capsules"
          alt="Capsules being filled by hand at Rehoboth Farm"
          caption="Filled by hand, in the room where the leaf was dried."
        />

        <section className="mx-auto max-w-[820px] px-6 py-16 md:px-16">
          <DisclaimerBlock />
        </section>
      </main>
      <Footer />
    </>
  );
}
