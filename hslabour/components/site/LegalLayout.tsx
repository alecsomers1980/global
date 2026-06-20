import PageHeader from "@/components/site/PageHeader";
import Container from "@/components/site/Container";

type LegalLayoutProps = {
  title: string;
  intro?: string;
  updated: string;
  children: React.ReactNode;
};

/** Shared chrome for legal/policy pages: page header + readable prose column. */
export default function LegalLayout({
  title,
  intro,
  updated,
  children,
}: LegalLayoutProps) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} intro={intro} />
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-slate-500">Last updated: {updated}</p>
            <div className="mt-8 space-y-5 text-slate-700 [&_a]:font-medium [&_a]:text-green-dark hover:[&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-navy [&_li]:leading-relaxed [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
              {children}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
