import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attractions",
  description: "The best attractions near Woodpecker Guesthouse in Hazyview: Kruger National Park, God's Window, Blyde River Canyon, Bourke's Luck Potholes.",
};

const ATTRACTIONS = [
  {
    name: "Kruger National Park",
    desc: "One of Africa's largest game reserves, a short drive from Hazyview — the reason most guests visit this part of Mpumalanga.",
  },
  {
    name: "God's Window",
    desc: "A viewpoint on the Panorama Route with sweeping views over the Lowveld escarpment.",
  },
  {
    name: "Blyde River Canyon",
    desc: "One of the largest green canyons in the world, and a highlight of any Panorama Route day trip.",
  },
  {
    name: "Bourke's Luck Potholes",
    desc: "Striking water-carved rock formations where the Treur and Blyde rivers meet.",
  },
];

export default function AttractionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Attractions</h1>
      <p className="text-muted mb-10">
        Woodpecker Guesthouse is perfectly placed for exploring the Kruger National Park and the Panorama Route —
        here's what's worth the drive.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {ATTRACTIONS.map((a) => (
          <div key={a.name} className="rounded-xl border border-line bg-white p-5">
            <p className="text-ink font-medium mb-1">{a.name}</p>
            <p className="text-muted text-sm">{a.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}