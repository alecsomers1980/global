import { products } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: {
        slug: string;
    };
}

export function generateStaticParams() {
    return products.map((product) => ({
        slug: product.slug,
    }));
}

export default function ProductDetailPage({ params }: ProductPageProps) {
    const product = products.find((p) => p.slug === params.slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <PageHeader
                title={product.name}
                description={product.category}
                image={product.image}
            />

            <section className="py-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16">

                        {/* Left Column: Gallery */}
                        <div className="lg:w-1/2 space-y-6">
                            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-border shadow-md">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {product.images.map((img, index) => (
                                    <div key={index} className="relative h-24 rounded-lg overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-orange-DEFAULT transition-all">
                                        <Image
                                            src={img}
                                            alt={`${product.name} view ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Info & Specs */}
                        <div className="lg:w-1/2">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-DEFAULT mb-4">Product Overview</h2>
                                <p className="text-slate-light text-lg leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Key Features */}
                            <div className="mb-10">
                                <h3 className="text-lg font-bold text-slate-DEFAULT mb-4">Key Benefits</h3>
                                <ul className="space-y-3">
                                    {product.features.map((feature, index) => (
                                        <li key={index} className="flex items-start space-x-3">
                                            <CheckCircle2 className="h-5 w-5 text-orange-DEFAULT shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Specifications Table */}
                            <div className="mb-10">
                                <h3 className="text-lg font-bold text-slate-DEFAULT mb-4">Technical Specifications</h3>
                                <div className="overflow-hidden rounded-lg border border-border">
                                    <table className="min-w-full divide-y divide-border/50">
                                        <tbody className="divide-y divide-border/50 bg-white">
                                            {product.specs.map((spec, index) => (
                                                <tr key={index} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                                                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                                                        {spec.label}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-500">
                                                        {spec.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-4 p-6 bg-concrete-light rounded-xl border border-border/60">
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-DEFAULT mb-1">Ready to order?</h4>
                                    <p className="text-sm text-slate-light">Contact us for a custom quote specifically for your project.</p>
                                </div>
                                <Link href="/contact">
                                    <Button size="lg" className="w-full sm:w-auto bg-orange-DEFAULT hover:bg-orange-hover text-white">
                                        Request Quote <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
