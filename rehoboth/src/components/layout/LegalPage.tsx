import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/** Shared shell for the policy pages so they read as one document set. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[760px] px-6 py-16 md:px-16 md:py-24">
        <h1 className="font-display text-4xl text-ink md:text-[52px]">{title}</h1>
        <p className="mt-4 text-[13px] text-ink-mute">Last updated {updated}</p>
        <div className="mt-10 flex flex-col gap-8 text-[16px] leading-relaxed text-ink-soft [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_section]:flex [&_section]:flex-col [&_section]:gap-3">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
