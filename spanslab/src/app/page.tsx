import { HeroSection } from "@/components/layout/hero";
import { ProductCategories } from "@/components/layout/product-categories";
import { Features } from "@/components/layout/features";
import { Testimonials } from "@/components/layout/testimonials";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <Features />
      <ProductCategories />
      <Testimonials />
    </div>
  );
}
