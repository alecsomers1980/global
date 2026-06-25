"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Admin routes provide their own sidebar/top bar — skip the public site chrome.
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="relative min-h-screen">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}
