import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/data";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      {/* Project Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={project.image}
          alt={project.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent" />
        {project.location && (
          <span className="absolute bottom-3 left-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {project.location}
          </span>
        )}
      </div>

      {/* Project Info */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 text-lg font-bold text-brand-navy">{project.name}</h3>
        <p className="mb-5 flex-1 text-sm leading-relaxed text-brand-navy/60">
          {project.description}
        </p>
        <Link
          href={`/our-work/${project.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-teal transition-colors hover:text-brand-teal/80"
        >
          Find out more
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
