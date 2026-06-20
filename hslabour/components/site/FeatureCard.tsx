import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      {/* Icon tile */}
      <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" aria-hidden />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>

      {href && (
        <>
          {/* Full‑card stretched link (invisible) */}
          <Link
            href={href}
            className="absolute inset-0 z-10"
            aria-label={title}
          >
            <span className="sr-only">{title}</span>
          </Link>

          {/* Decorative “Learn more” text – sits above the link but passes clicks through */}
          <span className="relative z-20 mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 pointer-events-none">
            Learn more
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </>
      )}
    </div>
  );
}