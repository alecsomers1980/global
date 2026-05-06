import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "The Design",
    description:
      "We begin with a thorough assessment of your space and requirements. Our engineers design a custom HVAC solution tailored to your specific needs, ensuring optimal efficiency and performance.",
  },
  {
    number: "02",
    title: "The Build",
    description:
      "Using premium materials and industry-leading components, our skilled technicians manufacture and prepare every system to exact specifications. Quality control is embedded at every stage.",
  },
  {
    number: "03",
    title: "Installation",
    description:
      "Our certified installation teams ensure seamless deployment with minimal disruption to your operations. We test, commission, and hand over every system with full training and support.",
  },
];

export default function ThreeStepApproach() {
  return (
    <section id="three-step" className="bg-brand-sky/20 py-20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="section-label mb-4">Our 3 Step Approach</p>
          <h2 className="section-heading">
            How we deliver exceptional HVAC solutions
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group rounded-2xl bg-white p-8 shadow-md transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="mb-4 block text-6xl font-bold text-brand-teal/10 transition-colors group-hover:text-brand-teal/20">
                {step.number}
              </span>
              <h3 className="mb-3 text-xl font-bold text-brand-navy">{step.title}</h3>
              <p className="leading-relaxed text-brand-navy/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Photo - full bleed */}
      <Image
        src="https://execair.co.za/wp-content/uploads/2025/04/exec.png"
        alt="Exec-Air HVAC installation in progress"
        width={1800}
        height={800}
        className="w-full object-cover"
      />
    </section>
  );
}
