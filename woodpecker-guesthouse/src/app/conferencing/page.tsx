import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conferencing",
  description: "Conference and events venue at Woodpecker Guesthouse, Hazyview — for board meetings, launches and private dinners.",
};

export default function ConferencingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Conferencing</h1>
      <p className="text-muted mb-6">
        Our conference and events centre is the ideal venue for conferences, launches, promotions, board meetings,
        private dinners and other intimate events — set against the quiet, natural surrounds of Hazyview.
      </p>
      <p className="text-muted mb-10">
        Combine your day of meetings with a stay in one of our rooms and a meal at the restaurant for a complete,
        convenient package.
      </p>
      <Link
        href="/contact"
        className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
      >
        Enquire About Conferencing
      </Link>
    </main>
  );
}