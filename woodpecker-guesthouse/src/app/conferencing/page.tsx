import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Conferencing",
  description: "Conference and events venue at Woodpecker Guesthouse, Hazyview — for board meetings, launches and private dinners.",
};

const PILLARS = [
  { name: "Make it Memorable", icon: "/images/conferencing-memorable.png" },
  { name: "Make it Matter", icon: "/images/conferencing-matter.png" },
  { name: "Make it Together", icon: "/images/conferencing-together.png" },
];

const EQUIPMENT = ["Projector", "Stationary", "Aircon", "Recorder", "WiFi", "Coffee / Tea", "White Board"];

const EVENTS = ["Bridal Showers", "Birthday Parties", "Baby Showers"];

export default function ConferencingPage() {
  return (
    <main>
      <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <Image
          src="/images/home-entrance.webp"
          alt="Woodpecker Guesthouse venue"
          fill
          priority
          className="object-cover hero-photo"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <Reveal className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-8 text-white">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-2">Why Us</p>
          <h1 className="font-display text-4xl md:text-5xl">Conferencing</h1>
        </Reveal>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-muted mb-10">
          Our conference and events centre is the ideal venue for all your conferences, launches, promotions, board
          meetings or private dinners and other intimate events. Conveniently the centre is fully equipped with
          modern multimedia technology and can host up to 25 delegates.
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {PILLARS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100} className="rounded-xl border border-line bg-white p-5 text-center">
              <div className="w-12 h-12 relative mx-auto mb-3">
                <Image src={p.icon} alt="" fill className="object-contain" />
              </div>
              <p className="text-ink font-medium">{p.name}</p>
            </Reveal>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="font-display text-xl text-ink mb-4">Equipment Supplied</h2>
            <ul className="space-y-2">
              {EQUIPMENT.map((item) => (
                <li key={item} className="text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl text-ink mb-4">We Also Do Events</h2>
            <ul className="space-y-2">
              {EVENTS.map((item) => (
                <li key={item} className="text-muted flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
        >
          Enquire About Conferencing
        </Link>
      </div>
    </main>
  );
}