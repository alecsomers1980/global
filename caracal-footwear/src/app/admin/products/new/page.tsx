import ProductForm from '@/components/admin/products/ProductForm';

export const metadata = {
  title: 'New Product',
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="display text-3xl text-text mb-6">NEW PRODUCT</h1>
      <ProductForm />
    </div>
  );
}