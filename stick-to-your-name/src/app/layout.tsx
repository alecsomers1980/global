import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stick to Your Name — Self-adhesive name labels",
  description:
    "Personalised vinyl name labels for school stationery, lunchboxes, bottles and more. R150 per set, courier across South Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
