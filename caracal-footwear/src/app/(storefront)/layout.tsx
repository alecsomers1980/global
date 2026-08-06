import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

/**
 * Storefront chrome (header + footer), scoped to this route group so it
 * never wraps /admin or the bare auth screens (forgot-password,
 * reset-password), which live outside the group. A route group doesn't
 * appear in the URL -- this only affects which layout applies.
 */
export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
