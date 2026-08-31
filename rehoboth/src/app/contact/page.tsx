import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { SocialRow } from "@/components/layout/SocialRow";
import { getSocialLinks } from "@/lib/social";
import { ContactForm } from "./ContactForm";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Contact";
const DESCRIPTION =
  "Talk to Rehoboth Herbal Co. — phone, email, or a message to the farm at Low's Creek, Mpumalanga.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/contact"),
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function ContactPage() {
  const social = await getSocialLinks();
  const hasSocial = Object.values(social).some(Boolean);

  return (
    <>
      <Header />
      <PageBanner
        eyebrow="Get in touch"
        title={
          <>
            There is someone
            <br />
            on the other end.
          </>
        }
        lead={
          <>
            A question about a plant, an order on its way, or a shop that would
            like to stock us — it all comes to the same farm at Low&rsquo;s Creek,
            and a person reads it.
          </>
        }
      />
      <main>
        <div className="mx-auto max-w-[1100px] px-6 py-16 md:px-16 md:py-20">
          <div className=" grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl text-ink">Phone</h2>
                <a
                  href="tel:+27828249023"
                  className="text-[15px] leading-relaxed text-ink-soft underline hover:text-brand"
                >
                  082 824 9023
                </a>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  Weekdays, farm hours.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl text-ink">Email</h2>
                <a
                  href="mailto:friedsgrobler@gmail.com"
                  className="break-all text-[15px] leading-relaxed text-ink-soft underline hover:text-brand"
                >
                  friedsgrobler@gmail.com
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-display text-xl text-ink">The farm</h2>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  Rehoboth Farm, Portion 21 of Farm 277JU Lovedale, Honeybird,
                  Low&rsquo;s Creek, Mpumalanga.
                </p>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  Visits are by arrangement — please phone first.
                </p>
              </div>

              {hasSocial && (
                <div className="flex flex-col gap-3">
                  <h2 className="font-display text-xl text-ink">Follow along</h2>
                  <SocialRow links={social} />
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-2xl text-ink">Send us a message</h2>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
