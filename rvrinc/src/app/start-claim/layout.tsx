import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Start Your RAF Claim",
    description: "Begin your Road Accident Fund claim with Roets & Van Rensburg Inc. Complete our secure online form and our team will assess your case within 24 hours.",
    alternates: { canonical: "/start-claim" },
};

export default function StartClaimLayout({ children }: { children: React.ReactNode }) {
    return children;
}
