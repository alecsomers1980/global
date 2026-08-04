/**
 * Placeholder homepage. The cinematic nine-beat homepage lands in Phase 4;
 * this exists so Phase 1 has a verifiable entry point and so the design
 * tokens can be eyeballed against the flyer.
 */
export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-24">
      <p className="text-sm uppercase tracking-[0.35em] text-muted">
        Caracal Footwear
      </p>

      <h1 className="display rule-accent mt-6 text-6xl text-text sm:text-8xl">
        Wild by
        <br />
        Nature
      </h1>

      <div className="mt-8 max-w-md space-y-4 text-muted">
        <p>
          Handcrafted vellies in genuine leather, on a non-slip TPR sole.
          Built to last.
        </p>
        <p>
          Sizes 4 to 15. Free delivery on orders over R1 000.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {[
          { name: "Tan", className: "bg-tan" },
          { name: "Cognac", className: "bg-cognac" },
          { name: "Camel", className: "bg-camel" },
          { name: "Accent", className: "bg-accent" },
          { name: "Surface", className: "bg-surface" },
        ].map((swatch) => (
          <div key={swatch.name} className="flex flex-col items-center gap-2">
            <span
              className={`size-12 rounded-full border border-text/10 ${swatch.className}`}
            />
            <span className="text-xs text-muted">{swatch.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
