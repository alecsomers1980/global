/**
 * Renders one JSON-LD block. The object is always ours — built in lib/seo.ts
 * from data already screened by lib/compliance.ts — never user-supplied
 * markup, so JSON.stringify into a script tag is the standard, safe pattern.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
