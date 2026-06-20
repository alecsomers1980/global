import Container from "@/components/site/Container";

const stats = [
  { value: "1998", label: "Established" },
  { value: "25+", label: "Years' experience" },
  { value: "6", label: "Service lines" },
  { value: "National", label: "Footprint" },
];

export default function Stats() {
  return (
    <section className="bg-navy py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-green">Why H&S Labour</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl text-balance">
            Forging lasting partnerships since 1998
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-extrabold text-green sm:text-5xl">{stat.value}</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-wider text-slate-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}