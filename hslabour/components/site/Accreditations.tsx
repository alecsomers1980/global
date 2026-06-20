import Image from "next/image";
import Container from "@/components/site/Container";

const accreditations = [
  {
    src: "/images/acc/DEP-Emp-Labour-300x300.png",
    alt: "Verified & certified by the Department of Employment and Labour, Republic of South Africa — registered Private Employment Agency (PEA) / Temporary Employment Agency (TES)",
  },
  {
    src: "/images/acc/1.png",
    alt: "Proud member of APSO, the Federation of African Professional Staffing Organisations",
  },
  {
    src: "/images/acc/3.png",
    alt: "H&S Labour Brokers is a proud B-BBEE Level One contributor",
  },
];

export default function Accreditations() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-dark">
            Accreditations
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            Registered, accredited and compliant
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            We operate within South Africa&apos;s labour framework — registered
            with the Department of Employment and Labour, a proud APSO member,
            and a B-BBEE Level One contributor.
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-1 items-center gap-8 sm:grid-cols-3">
          {accreditations.map((acc) => (
            <li
              key={acc.src}
              className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-6"
            >
              <Image
                src={acc.src}
                alt={acc.alt}
                width={180}
                height={180}
                className="h-auto w-40 object-contain"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
