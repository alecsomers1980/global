import { PageHeader } from "@/components/layout/page-header";
import { ProductListing } from "@/components/products/product-listing";
import { products } from "@/lib/data";

export const metadata = {
    title: "Our Products | Spanslab",
    description: "Browse our range of high-quality concrete products including Rib & Block slabs and Paving in Nelspruit.",
};

export default function ProductsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader
                title="Industrial Grade Solutions"
                description="Engineered for strength, durability, and efficiency. Explore our full range of construction products."
                image="https://images.unsplash.com/photo-1542889601-399c4f3a8402?q=80&w=2670&auto=format&fit=crop"
            />
            <ProductListing products={products} />
        </div>
    );
}
