import { PageHeader } from "@/components/layout/page-header";
import { projects } from "@/lib/data";
import Image from "next/image";
import { MapPin } from "lucide-react";

export const metadata = {
    title: "Projects Gallery | Spanslab",
    description: "View our portfolio of successful construction projects using Spanslab concrete products across Nelspruit and Mpumalanga.",
};

export default function ProjectsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader
                title="Our Portfolio"
                description="Showcasing excellence in construction across residential, commercial, and civil projects."
                image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2670&auto=format&fit=crop"
            />

            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="group relative overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-64 md:h-80 w-full overflow-hidden">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    <div className="absolute top-4 left-4">
                                        <span className="bg-orange-DEFAULT text-white text-xs font-bold px-3 py-1 rounded-full">
                                            {project.category}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                        <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                                        <div className="flex items-center text-slate-300 mb-2">
                                            <MapPin className="h-4 w-4 mr-1 text-orange-DEFAULT" />
                                            <span className="text-sm font-medium">{project.location}</span>
                                        </div>
                                        <p className="text-slate-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
