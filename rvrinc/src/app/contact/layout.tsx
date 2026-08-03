import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with Roets & Van Rensburg Inc. — visit our Pretoria or Marble Hall office, call, WhatsApp, or send us a message about your legal matter.",
    alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
