import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mv-navy flex flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-up">
        <Logo className="h-12 sm:h-16 w-auto mx-auto" href={null} />
        <h1 className="mt-8 text-3xl sm:text-4xl font-heading text-mv-cream">
          Festival Operations
        </h1>
        <p className="mt-3 text-mv-cream/70 max-w-lg mx-auto font-sans">
          Manage performances, complimentary tickets, and more — all in one
          place.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10 mb-8">
          <div className="h-px flex-1 bg-mv-mint/30" />
          <span className="text-mv-mint text-xl">✦</span>
          <div className="h-px flex-1 bg-mv-mint/30" />
        </div>
        <Link
          href="/staff-login"
          className="inline-block px-8 py-3 bg-mv-mint text-mv-navy font-semibold rounded hover:brightness-110 transition"
        >
          Staff sign-in
        </Link>
      </div>
      <p className="mt-16 text-mv-cream/50 text-sm font-sans">
        Maynardville Open-Air Festival
      </p>
    </div>
  );
}