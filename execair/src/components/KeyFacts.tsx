export default function KeyFacts() {
  return (
    <section className="bg-white py-20" aria-labelledby="key-facts-heading">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl">
          <p className="section-label mb-4 text-center">Exec-Air at a Glance</p>
          <h2 id="key-facts-heading" className="section-heading mb-8 text-center">
            Krugersdorp's HVAC specialists since 1989
          </h2>
          <p className="text-lg leading-relaxed text-brand-navy/70 md:text-xl">
            Founded in <strong>1989</strong>, <strong>Exec-Air Air Conditioning</strong> is a
            Krugersdorp-based HVAC specialist with over 35 years of experience designing, building,
            installing and maintaining heating, ventilation and air-conditioning systems across
            Johannesburg, the West Rand and Southern Africa. We are a Proudly Level 3 B-BBEE
            Contributor and accredited installers for{" "}
            <strong>Jet-Air, LG, Daikin, Samsung, Hisense, Midea, York, Alliance and DB</strong>.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-brand-navy/70 md:text-xl">
            Our work spans commercial sites (shopping centres, offices, hotels, healthcare and
            server rooms), industrial environments (mining, factories, warehouses, food supply
            chain and transportation hubs), and residential properties (estates, complexes and
            single homes). Notable clients include <strong>SARS</strong>, the{" "}
            <strong>Gautrain</strong>, the <strong>University of Johannesburg</strong>,{" "}
            <strong>Broll</strong>, <strong>Builders Warehouse</strong>,{" "}
            <strong>Hyundai</strong>, <strong>Land Rover</strong>, <strong>Checkers</strong> and{" "}
            <strong>Planet Fitness</strong>.
          </p>

          <dl className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-2xl bg-brand-sky/20 p-6 text-center">
              <dt className="text-sm uppercase tracking-wider text-brand-navy/60">Founded</dt>
              <dd className="mt-2 text-3xl font-bold text-brand-teal">1989</dd>
            </div>
            <div className="rounded-2xl bg-brand-sky/20 p-6 text-center">
              <dt className="text-sm uppercase tracking-wider text-brand-navy/60">Experience</dt>
              <dd className="mt-2 text-3xl font-bold text-brand-teal">35+ yrs</dd>
            </div>
            <div className="rounded-2xl bg-brand-sky/20 p-6 text-center">
              <dt className="text-sm uppercase tracking-wider text-brand-navy/60">B-BBEE</dt>
              <dd className="mt-2 text-3xl font-bold text-brand-teal">Level 3</dd>
            </div>
            <div className="rounded-2xl bg-brand-sky/20 p-6 text-center">
              <dt className="text-sm uppercase tracking-wider text-brand-navy/60">Head Office</dt>
              <dd className="mt-2 text-xl font-bold text-brand-teal">Krugersdorp</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
