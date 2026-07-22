const SPECIALISMS = [
  { title: "Drafting Of Wills", href: "/wills-estates/drafting-of-wills" },
  { title: "Trusts", href: "/wills-estates/setting-up-trusts-appointment-of-trustees" },
  { title: "Antenuptial Contracts", href: "/law-of-contract/antenuptial-contracts" },
  { title: "Conveyancing", href: "/property-law/conveyancing" },
  { title: "Deceased Estates", href: "/wills-estates/administration-of-deceased-estates" },
  { title: "Power of Attorney", href: "/property-law/power-of-attorney" },
  { title: "Divorces", href: "/litigation/divorces" },
  { title: "Notary", href: "/notary" },
];

export default function SpecialismsGrid() {
  return (
    <section className="bg-surface py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-heading text-3xl text-center text-ink mb-10">We specialise in</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIALISMS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="block bg-white border border-line rounded-2xl p-6 text-center hover:border-maroon hover:shadow-md transition-all"
            >
              <span className="font-heading text-ink">{s.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
