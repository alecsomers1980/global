import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose-sm">
      <h1 className="font-display text-3xl text-ink mb-6">Privacy Policy</h1>
      <p className="text-muted mb-4">
        It is Woodpecker Guesthouse policy to respect your privacy and comply with any applicable laws and
        regulations regarding any personal information we may collect, including on this website.
      </p>
      <p className="text-muted">
        Full policy text is being migrated from our previous website and will be published here verbatim once
        confirmed — contact us directly with any privacy questions in the meantime.
      </p>
    </main>
  );
}