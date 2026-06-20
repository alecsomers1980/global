import { company } from "@/lib/site/company";

/** Emits BreadcrumbList structured data. Pass items in order (Home is added automatically). */
export default function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const all = [{ name: "Home", path: "/" }, ...items];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${company.url}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
