import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Homely African cuisine at Woodpecker Guesthouse restaurant, Hazyview.",
};

export default function RestaurantPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Restaurant</h1>
      <p className="text-muted mb-10">
        Taste homely, scrumptious African cuisine at the Woodpecker Guesthouse restaurant — breakfast, dinner and a
        dedicated kids' menu.
      </p>
      <div className="rounded-xl border border-line bg-surface p-6">
        <p className="text-ink font-medium mb-2">Full menus coming from our updated kitchen</p>
        <p className="text-muted text-sm">
          Breakfast, dinner and kids' menu items are being migrated from our current printed menus — check back soon,
          or ask our team directly when you enquire.
        </p>
      </div>
    </main>
  );
}