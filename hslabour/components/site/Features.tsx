import { UserCheck, ShieldCheck, FileSearch } from "lucide-react";
import Container from "@/components/site/Container";
import FeatureCard from "@/components/site/FeatureCard";

const features = [
  {
    icon: UserCheck,
    title: "Specialist Recruitment",
    description:
      "Permanent & contract placements across sectors, backed by a guaranteed replacement period.",
    href: "/services/recruitment",
  },
  {
    icon: ShieldCheck,
    title: "Compliant TES & Payroll",
    description:
      "We carry the labour-broking compliance load — s198A, payroll, UIF/PAYE and IR — so you don’t have to.",
    href: "/services/tes",
  },
  {
    icon: FileSearch,
    title: "Vetting & Screening",
    description:
      "Criminal, credit, qualification and psychometric checks before anyone joins your team.",
    href: "/services/vetting",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            Why H&S
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 text-balance sm:text-4xl">
            Built to hire faster — and stay compliant
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From permanent placements to large-scale TES, every engagement is
            backed by our replacement guarantee and deep compliance expertise.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              href={feature.href}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}