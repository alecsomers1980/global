import { products } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Award, Factory, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { TechnicalSpecsTable } from "@/components/products/specs-table";
import { QuickQuoteForm } from "@/components/products/quick-quote-form";

interface ProductPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export function generateStaticParams() {
    return products.map((product) => ({
        slug: product.slug,
    }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);

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

            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                        {/* Left Column: Product Info & Specs */}
                        <div className="lg:w-3/5 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-DEFAULT mb-6">Product Overview</h2>
                                <p className="text-slate-light text-lg leading-relaxed mb-8">
                                    {product.description}
                                </p>

                                {product.usage && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                        {product.usage.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <CheckCircle2 className="h-5 w-5 text-orange-DEFAULT shrink-0" />
                                                <span className="text-sm font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Why Choose Spanslab / Advantages */}
                            <div className="bg-slate-900 text-white p-8 lg:p-10 rounded-2xl shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ShieldCheck className="w-32 h-32" />
                                </div>
                                <h3 className="text-2xl font-bold mb-8 flex items-center">
                                    <Award className="mr-3 text-orange-DEFAULT h-8 w-8" />
                                    Why Choose Spanslab?
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {product.advantages?.map((adv, index) => (
                                        <div key={index} className="space-y-2">
                                            <h4 className="text-lg font-bold text-orange-DEFAULT">{adv.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{adv.description}</p>
                                        </div>
                                    ))}
                                    {!product.advantages && (
                                        <>
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-bold text-orange-DEFAULT">Quality Guaranteed</h4>
                                                <p className="text-slate-400 text-sm">All our construction materials are manufactured to meet or exceed national standards.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-lg font-bold text-orange-DEFAULT">Direct Manufacturer</h4>
                                                <p className="text-slate-400 text-sm">Cut out the middleman and save with bulk pricing direct from our Nelspruit factory.</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 uppercase tracking-widest">
                                    <span className="flex items-center"><ShieldCheck className="mr-2 h-4 w-4" /> Industrial Grade</span>
                                    <span className="flex items-center"><Factory className="mr-2 h-4 w-4" /> Direct Pricing</span>
                                </div>
                            </div>

                            {/* Technical Specs Table */}
                            <TechnicalSpecsTable specs={product.specs} />
                        </div>

                        {/* Right Column: Visuals & Quote Form */}
                        <div className="lg:w-2/5 space-y-10">
                            {/* Gallery Feature */}
                            <div className="space-y-4">
                                <div className="relative h-[350px] w-full rounded-2xl overflow-hidden border border-border shadow-md">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                {product.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {product.images.map((img, index) => (
                                            <div key={index} className="relative h-20 rounded-xl overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-orange-DEFAULT transition-all">
                                                <Image
                                                    src={img}
                                                    alt={`${product.name} shadow ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quote Form */}
                            <QuickQuoteForm productName={product.name} />

                            {/* WhatsApp Support */}
                            <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex items-center space-x-4">
                                <div className="bg-green-500 p-3 rounded-full">
                                    <MessageCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-900 text-sm">Need a faster response?</h4>
                                    <p className="text-green-700 text-xs">Chat with an expert on WhatsApp for instant pricing.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
