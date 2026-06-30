import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import CTASection from "@/components/CTASection";
import { galleryImages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery – East Lake Drilling",
  description:
    "Explore our borehole drilling projects, rigs and installations across Johannesburg.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Our work on site"
        subtitle="Boreholes, rigs and installations across Johannesburg."
        image="/images/gallery/22.jpg"
      />
      <section className="container-px py-20">
        <GalleryGrid images={galleryImages} />
      </section>
      <CTASection />
    </>
  );
}