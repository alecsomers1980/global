import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Home",
  description:
    "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga — minutes from the Kruger National Park.",
};

const FACILITIES = [
  { name: "Swimming Pool", desc: "Cool off after a day on the Panorama Route.", icon: "/images/facility-swimming.png" },
  { name: "Braai Area", desc: "Fire up an evening braai under the bushveld sky.", icon: "/images/facility-braai.png" },
  { name: "Jumping Castle", desc: "Kept the kids happy on the old site — kept here too.", icon: "/images/facility-jumping-castle.png" },
  { name: "Parking", desc: "Secure on-site parking for every guest.", icon: "/images/facility-parking.png" },
];

export default async function HomePage() {
  const rooms = await getRooms();
  const featured = rooms.slice(0, 3);

  return (
    <main>
      {/* Hero — full-bleed real property photo. Booking widget stays inside the
          hero's own flow (not absolutely overlapped into the next section)
          because its rendered height varies a lot: a short fallback card when
          NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID is unset vs a 420px iframe once
          it's set. Revisit this sizing once the real widget is live. */}
      <section className="relative min-h-[640px] h-[85vh] flex flex-col items-center justify-end pb-16">
        <Image
          src="/images/home-hero.webp"
          alt="Woodpecker Guesthouse, Hazyview"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <div className="relative z-10 text-center text-white px-6 mb-10">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-4">Hazyview, Mpumalanga</p>
          <h1 className="font-display text-4xl md:text-6xl mb-4 max-w-3xl mx-auto">
            A home away from home, minutes from the Kruger.
          </h1>
          <p className="text-white/85 max-w-xl mx-auto">
            Affordable, family-friendly accommodation, conferencing and a restaurant serving homely meals — built for
            guests who live for serene spaces and the outdoors.
          </p>
        </div>
        <div className="relative z-10 w-full max-w-md px-6">
          <NightsbridgeWidget />
        </div>
      </section>

      {/* Welcome — asymmetric real-photo pairing */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-terracotta text-sm tracking-widest uppercase mb-3">Boutique Guesthouse</p>
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-5">Serene spaces, real character</h2>
          <p className="text-muted mb-8">
            Perfectly located in the outskirts of Nelspruit, in the quiet town of Hazyview, Woodpecker Guesthouse
            boasts a homely feel away from home. With the best yet affordable accommodation, events and conferencing
            facilities, and outdoor activities, enjoy the value-for-money experience in style and class.
          </p>
          <Link
            href="/accommodation"
            className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
          >
            Find A Room
          </Link>
        </div>
        <div className="relative h-[420px] md:h-[480px]">
          <div className="absolute top-0 right-0 w-[70%] h-[75%] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/home-pool.webp"
              alt="Pool and courtyard at Woodpecker Guesthouse"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 70vw, 35vw"
            />
          </div>
          <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-2xl overflow-hidden shadow-lg border-4 border-paper">
            <Image
              src="/images/home-room-styled.webp"
              alt="A styled room at Woodpecker Guesthouse"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 55vw, 28vw"
            />
          </div>
        </div>
      </section>

      {/* Dark contrast band — real facility icons over a dimmed real photo */}
      <section className="relative bg-ink text-white py-20 overflow-hidden">
        <Image src="/images/facilities-band.webp" alt="" fill className="object-cover opacity-20" sizes="100vw" />
        <div className="relative max-w-6xl mx-auto px-6">
          <p className="text-terracotta text-sm tracking-widest uppercase mb-3">On The Property</p>
          <h2 className="font-display text-3xl mb-10 max-w-lg">Everything you need for a relaxed stay</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {FACILITIES.map((f) => (
              <div key={f.name}>
                <div className="w-12 h-12 relative mb-4">
                  <Image src={f.icon} alt="" fill className="object-contain" />
                </div>
                <p className="font-display text-lg mb-1">{f.name}</p>
                <p className="text-white/60 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured rooms — large image-forward cards, real photos */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-terracotta text-sm tracking-widest uppercase mb-3">Rest Like Royalty</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink">Featured Rooms</h2>
            </div>
            <Link href="/accommodation" className="text-terracotta text-sm hover:underline hidden sm:block">
              View all rooms →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((room) => (
              <Link
                key={room.id}
                href={`/accommodation/${room.slug}`}
                className="group relative block h-[420px] rounded-2xl overflow-hidden"
              >
                {room.hero_image && (
                  <Image
                    src={room.hero_image}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 card-scrim" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="font-display text-xl mb-1">{room.name}</p>
                  <p className="text-white/75 text-sm line-clamp-2 mb-3">{room.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/70">
                    <span>
                      {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span>{room.max_guests} guests</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/accommodation" className="text-terracotta text-sm hover:underline sm:hidden mt-6 inline-block">
            View all rooms →
          </Link>
        </section>
      )}

      {/* Restaurant teaser — asymmetric real-photo pairing, reversed */}
      <section className="bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[420px] md:h-[480px] order-2 md:order-1 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/home-garden.webp"
              alt="Woodpecker Guesthouse grounds"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-terracotta text-sm tracking-widest uppercase mb-3">Enjoy Our Homely Meals</p>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-5">New Restaurant in Town</h2>
            <p className="text-muted mb-8">
              Come tantalise your tastebuds at our newest facility addition. Taste the most scrumptious,
              mouthwatering African cuisine and exotic dishes prepared to perfection by our highly trained chefs —
              the relaxed ambience? That&apos;s a plus.
            </p>
            <Link
              href="/restaurant"
              className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
            >
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-olive text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl mb-3">Ready to book your stay?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get in touch and we&apos;ll help you find the right room for your visit.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-white text-olive-deep px-8 py-3 font-semibold hover:bg-sand transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}