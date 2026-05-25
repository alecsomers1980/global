"use client";

import { useState } from "react";
import Image from "next/image";
import HeroHeader from "@/components/HeroHeader";

const allImages = [
  "IMG_8185.jpg", "IMG_8186.jpg", "IMG_8187.jpg", "IMG_8188.jpg", "IMG_8191.jpg", "IMG_8193.jpg", "IMG_8195.jpg", "IMG_8197.jpg",
  "IMG_8198.jpg", "IMG_8200.jpg", "IMG_8203.jpg", "IMG_8205.jpg", "IMG_8206.jpg", "IMG_8208.jpg", "IMG_8210.jpg", "IMG_8212.jpg",
  "IMG_8214.jpg", "IMG_8217.jpg", "IMG_8219.jpg", "IMG_8222.jpg", "IMG_8225.jpg", "IMG_8231.jpg", "IMG_8232.jpg",
  "IMG_8234.jpg", "IMG_8236.jpg", "IMG_8239.jpg", "IMG_8241.jpg", "IMG_8243.jpg", "IMG_8244.jpg", "IMG_8246.jpg",
  "IMG_8249.jpg", "IMG_8252.jpg", "IMG_8253.jpg", "IMG_8255.jpg", "IMG_8257.jpg", "IMG_8261.jpg", "IMG_8263.jpg",
  "IMG_8267.jpg", "IMG_8270.jpg", "IMG_8272.jpg", "IMG_8275.jpg", "IMG_8278.jpg", "IMG_8279.jpg", "IMG_8281.jpg",
  "IMG_8283.jpg", "IMG_8287.jpg", "IMG_8288.jpg", "IMG_8290.jpg", "IMG_8292.jpg", "IMG_8293.jpg", "IMG_8294.jpg"
].map(f => "/images/accommodation/" + f);

const units = [
  {
    id: 1,
    name: "Main House",
    sleeps: 10,
    tagline: "The Crown Jewel",
    description:
      "Spacious bedrooms, expansive deck overlooking indigenous gardens, full kitchen, private braai area",
    features: ["Expansive Deck", "Full Kitchen", "Private Braai", "Garden Views"],
    size: "premium",
    span: "col-span-2",
    images: allImages.slice(0, 8),
  },
  {
    id: 2,
    name: "Main House 2",
    sleeps: 6,
    tagline: "Creek-Side Comfort",
    description:
      "Modern open-plan kitchen, large lounge, outdoor patio facing the creek",
    features: ["Open-Plan Kitchen", "Large Lounge", "Creek Patio", "Modern Finish"],
    size: "large",
    span: "col-span-1",
    images: allImages.slice(8, 15),
  },
  {
    id: 3,
    name: "Chalet 1",
    sleeps: 3,
    tagline: "Thatched Charm",
    description:
      "Cozy thatched roof, kitchen corner, private garden views",
    features: ["Thatched Roof", "Kitchen Corner", "Garden Views", "Cozy Interiors"],
    size: "medium",
    span: "col-span-1",
    images: allImages.slice(15, 22),
  },
  {
    id: 4,
    name: "Chalet 2",
    sleeps: 2,
    tagline: "Romantic Retreat",
    description:
      "Romantic studio layout, bathroom en-suite, direct pathway to pool",
    features: ["Studio Layout", "En-Suite Bath", "Pool Access", "Romantic Setting"],
    size: "intimate",
    span: "col-span-1",
    images: allImages.slice(22, 29),
  },
  {
    id: 5,
    name: "Chalet 3",
    sleeps: 2,
    tagline: "Rustic Elegance",
    description:
      "Rustic cottage charm, river stone finishes, private braai corner",
    features: ["River Stone Finishes", "Private Braai", "Cottage Charm", "Natural Textures"],
    size: "intimate",
    span: "col-span-1",
    images: allImages.slice(29, 36),
  },
  {
    id: 6,
    name: "Chalet 4",
    sleeps: 4,
    tagline: "Family Loft",
    description:
      "Loft bedroom, ideal for small families, fully equipped self-catering setup",
    features: ["Loft Bedroom", "Family Ideal", "Self-Catering", "Fully Equipped"],
    size: "medium",
    span: "col-span-1",
    images: allImages.slice(36, 43),
  },
  {
    id: 7,
    name: "Cottage",
    sleeps: 4,
    tagline: "Secluded Haven",
    description:
      "Secluded valley setting, fire pit, perfect for absolute privacy",
    features: ["Secluded Valley", "Fire Pit", "Total Privacy", "Nature Immersed"],
    size: "medium",
    span: "col-span-2",
    images: allImages.slice(43, 51),
  },
];

function PeopleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
      <path d="M12 8v4" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  );
}

function SizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
      <path d="M3 15h18" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22v-7" />
      <path d="M7 15h10" />
      <path d="M9 8h6" />
      <path d="M12 2l5 6H7l5-6z" />
      <path d="M7 15l5-7 5 7" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function getSizeLabel(size) {
  const map = {
    premium: "Premium",
    large: "Large",
    medium: "Medium",
    intimate: "Intimate",
  };
  return map[size] || "Standard";
}

function UnitCard({ unit, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? unit.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === unit.images.length - 1 ? 0 : prev + 1));
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Mountaincreek Lodge, I would like to enquire about ${unit.name}...`
  );
  const whatsappUrl = `https://wa.me/27829594643?text=${whatsappMessage}`;
  const bookingUrl = "https://www.nightsbridge.co.za/bridge/book?bbid=27902";

  const cardOrdinal = String(unit.id).padStart(2, "0");

  return (
    <article
      className={`
        group relative bg-white rounded-sm border border-primary/10 overflow-hidden
        transition-all duration-500 ease-out
        hover:border-primary/25 hover:shadow-[0_8px_40px_-12px_rgba(26,47,35,0.15)]
        ${unit.span === "col-span-2" ? "md:col-span-2" : "md:col-span-1"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Slider */}
      {unit.images && unit.images.length > 0 && (
        <div 
          className="relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] lg:aspect-[16/9] w-full overflow-hidden bg-primary/5 cursor-pointer group/img"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors z-[5] pointer-events-none flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <Image
            src={unit.images[currentImageIndex]}
            alt={`${unit.name} - Image ${currentImageIndex + 1}`}
            fill
            quality={100}
            unoptimized={true}
            className="object-cover transition-transform duration-700 group-hover/img:scale-105"
          />

          {unit.images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-[10] bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {unit.images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {unit.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10] flex gap-1.5 bg-black/20 px-2 py-1.5 rounded-full backdrop-blur-sm">
              {unit.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`block w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top accent bar */}
      <div className="h-1 bg-primary w-full" />

      <div className="p-6 md:p-8 lg:p-10">
        {/* Card header with ordinal */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="font-serif text-5xl md:text-6xl text-primary/10 leading-none select-none">
              {cardOrdinal}
            </span>
            <div className="pt-1">
              <p className="text-accent font-sans text-xs uppercase tracking-[0.2em] font-medium mb-1">
                {unit.tagline}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl text-primary leading-tight">
                {unit.name}
              </h3>
            </div>
          </div>
          <div
            className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${isHovered ? "bg-primary text-linen" : "bg-primary/5 text-primary"}
          `}
          >
            <TreeIcon />
          </div>
        </div>

        {/* Description */}
        <p className="font-sans text-primary/70 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
          {unit.description}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 bg-linen/60 px-3 py-2 rounded-sm">
            <span className="text-primary/60">
              <PeopleIcon />
            </span>
            <span className="font-sans text-sm text-primary font-medium">
              Sleeps {unit.sleeps}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-linen/60 px-3 py-2 rounded-sm">
            <span className="text-primary/60">
              <BedIcon />
            </span>
            <span className="font-sans text-sm text-primary font-medium">
              {unit.sleeps <= 2
                ? "Studio"
                : unit.sleeps <= 4
                ? `${Math.ceil(unit.sleeps / 2)} Bedrooms`
                : `${Math.ceil(unit.sleeps / 2)} Bedrooms`}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-linen/60 px-3 py-2 rounded-sm">
            <span className="text-primary/60">
              <SizeIcon />
            </span>
            <span className="font-sans text-sm text-primary font-medium">
              {getSizeLabel(unit.size)}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-8">
          {unit.features.map((feature, i) => (
            <span
              key={i}
              className="font-sans text-xs uppercase tracking-wider text-accent border border-accent/30 px-3 py-1.5 rounded-sm"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-primary/10 mb-6" />

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center gap-2
              bg-primary text-linen font-sans text-sm font-medium
              px-5 py-3 rounded-sm
              transition-all duration-300
              hover:bg-primary/90 hover:shadow-lg
              active:scale-[0.98]
            "
          >
            <BookIcon />
            Book Direct
            <ArrowIcon />
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center justify-center gap-2
              bg-transparent text-primary font-sans text-sm font-medium
              border border-primary/20 px-5 py-3 rounded-sm
              transition-all duration-300
              hover:bg-primary/5 hover:border-primary/40
              active:scale-[0.98]
            "
          >
            <WhatsAppIcon />
            Enquire on WhatsApp
          </a>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div
        className={`
        absolute top-1 right-0 w-20 h-20 overflow-hidden pointer-events-none
        transition-opacity duration-500
        ${isHovered ? "opacity-100" : "opacity-0"}
      `}
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-accent/10 to-transparent" />
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {unit.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevImage(e); }}
              className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full max-w-6xl h-[80vh] mx-4 md:mx-24" onClick={(e) => e.stopPropagation()}>
            <Image
              src={unit.images[currentImageIndex]}
              alt={`${unit.name} - Image ${currentImageIndex + 1} (Fullscreen)`}
              fill
              quality={100}
              unoptimized={true}
              className="object-contain"
            />
          </div>

          {unit.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNextImage(e); }}
              className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-16 md:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 font-sans tracking-widest text-sm">
            {currentImageIndex + 1} / {unit.images.length}
          </div>
        </div>
      )}
    </article>
  );
}

export default function AccommodationPage() {
  const totalGuests = units.reduce((sum, u) => sum + u.sleeps, 0);

  return (
    <main className="bg-linen min-h-screen">
      <HeroHeader
        eyebrow="Mountaincreek Lodge — Hazyview"
        title={
          <>
            Our Spaces — <span className="italic text-accent">Tailored for Rest</span>
            <br className="hidden sm:block" />{" "}
            <span className="sm:hidden"> </span>&amp; Adventure
          </>
        }
        description={`With 7 unique self-catering units accommodating up to ${totalGuests} guests, Mountaincreek Lodge offers the perfect base for family gatherings, couples' retreats, or solo nature walks in Hazyview.`}
      >
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 bg-linen/10 border border-linen/15 text-linen/80 font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-sm">
            <PeopleIcon />
            {totalGuests} Guests
          </span>
          <span className="inline-flex items-center gap-2 bg-linen/10 border border-linen/15 text-linen/80 font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-sm">
            <BedIcon />
            7 Units
          </span>
          <span className="inline-flex items-center gap-2 bg-linen/10 border border-linen/15 text-linen/80 font-sans text-xs uppercase tracking-wider px-4 py-2 rounded-sm">
            <TreeIcon />
            Self-Catering
          </span>
        </div>
      </HeroHeader>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        {/* Section intro */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px bg-primary/20 flex-1" />
            <span className="font-sans text-accent text-xs uppercase tracking-[0.25em]">
              Accommodation Catalog
            </span>
            <div className="h-px bg-primary/20 flex-1" />
          </div>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Row 1: Main House spans 2, Main House 2 spans 1 */}
          <UnitCard unit={units[0]} index={0} />
          <UnitCard unit={units[1]} index={1} />

          {/* Row 2: Chalet 1 spans 1, Chalet 2 spans 1, Chalet 3 spans 1 on lg */}
          <UnitCard unit={units[2]} index={2} />
          <UnitCard unit={units[3]} index={3} />
          <UnitCard unit={units[4]} index={4} />

          {/* Row 3: Chalet 4 spans 1, Cottage spans 2 */}
          <UnitCard unit={units[5]} index={5} />
          <UnitCard unit={units[6]} index={6} />
        </div>
      </section>

      {/* Bottom CTA Band */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 text-center">
          <h2 className="font-serif text-primary text-2xl md:text-3xl mb-3">
            Ready to Escape?
          </h2>
          <p className="font-sans text-primary/60 text-sm md:text-base max-w-lg mx-auto mb-6">
            Book your stay at Mountaincreek Lodge and experience the beauty of
            Hazyview, Mpumalanga.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.nightsbridge.co.za/bridge/book?bbid=27902"
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center justify-center gap-2
                bg-primary text-linen font-sans text-sm font-medium
                px-6 py-3.5 rounded-sm
                transition-all duration-300
                hover:bg-primary/90 hover:shadow-lg
                active:scale-[0.98]
              "
            >
              <BookIcon />
              Book All Units
              <ArrowIcon />
            </a>
            <a
              href={`https://wa.me/27829594643?text=${encodeURIComponent(
                "Hi Mountaincreek Lodge, I would like to enquire about availability..."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center justify-center gap-2
                bg-transparent text-primary font-sans text-sm font-medium
                border border-primary/20 px-6 py-3.5 rounded-sm
                transition-all duration-300
                hover:bg-primary/5 hover:border-primary/40
                active:scale-[0.98]
              "
            >
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
