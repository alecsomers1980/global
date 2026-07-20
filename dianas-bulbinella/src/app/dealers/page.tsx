import {
  getPublicDealers,
  matchesDealer,
  groupByProvince,
  whatsappNumber,
  telHref,
  PROVINCES,
  COUNTRIES,
  SOUTH_AFRICA,
} from "@/lib/dealers";
import PageBanner from "@/components/site/PageBanner";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // The root layout appends "| Diana's Bulbinella" — don't repeat the brand.
  title: "Find a Dealer",
  description:
    "Find a trusted Diana's Bulbinella agent near you — across South Africa, Namibia, Botswana and Mozambique.",
};

type SearchParams = { q?: string; country?: string; province?: string };

/** Chip/link href that keeps the current search and swaps country/province.
 *  Changing country always drops the province filter — a Western Cape filter
 *  makes no sense once you're looking at Namibia. */
function dealersHref(country: string, province: string, q: string) {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (province) params.set("province", province);
  if (q) params.set("q", q);
  const search = params.toString();
  return search ? `/dealers?${search}` : "/dealers";
}

export default async function DealersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "", country = "", province = "" } = await searchParams;
  const dealers = await getPublicDealers();

  let filtered = dealers;
  if (country) filtered = filtered.filter((d) => d.country === country);
  if (province) filtered = filtered.filter((d) => d.province === province);
  if (q) filtered = filtered.filter((d) => matchesDealer(d, q));

  const grouped = groupByProvince(filtered);
  const total = filtered.length;

  // Country counts for the top-level chips.
  const countryCounts = COUNTRIES.map((c) => ({
    country: c,
    count: dealers.filter((d) => d.country === c).length,
  })).filter((c) => c.count > 0);
  const totalAll = dealers.length;

  // Province sub-chips only make sense once South Africa is the active
  // filter — Namibia/Botswana/Mozambique have no provinces in Diana's list.
  const showProvinceChips = country === SOUTH_AFRICA;
  const saDealers = dealers.filter((d) => d.country === SOUTH_AFRICA);
  const provinceCounts = PROVINCES.map((p) => ({
    province: p,
    count: saDealers.filter((d) => d.province === p).length,
  }));

  const locationLabel = province || country || "";

  return (
    // relative + z-10 keeps the squiggle painted behind the content, as on
    // every other secondary page.
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <PageBanner
          video="/videos/lavender-banner.mp4"
          eyebrow="DEALERS"
          title="Find a dealer"
          accent="near you"
          subtitle="A trusted network of agents across Southern Africa."
        />

        <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
          {/* Search */}
          <form action="/dealers" className="flex items-center gap-3 mb-6">
            <input type="hidden" name="country" value={country} />
            <input type="hidden" name="province" value={province} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, town, province or country…"
              className="flex-1 rounded-full px-6 py-4 glass text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-forest px-8 py-4 text-paper text-sm font-medium hover:bg-moss transition-colors"
            >
              Search
            </button>
          </form>

          {/* Country chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href={dealersHref("", "", q)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                !country ? "bg-forest text-paper" : "glass text-ink hover:bg-surface-2"
              }`}
            >
              All <span className="ml-1 text-xs opacity-75">({totalAll})</span>
            </Link>
            {countryCounts.map((c) => (
              <Link
                key={c.country}
                href={dealersHref(c.country, "", q)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                  country === c.country
                    ? "bg-forest text-paper"
                    : "glass text-ink hover:bg-surface-2"
                }`}
              >
                {c.country} <span className="ml-1 text-xs opacity-75">({c.count})</span>
              </Link>
            ))}
          </div>

          {/* Province sub-chips, South Africa only */}
          {showProvinceChips && (
            <div className="flex flex-wrap gap-2 mb-8 pl-1">
              <Link
                href={dealersHref(SOUTH_AFRICA, "", q)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  !province ? "bg-moss text-paper" : "glass text-ink hover:bg-surface-2"
                }`}
              >
                All provinces
              </Link>
              {provinceCounts.map((p) => (
                <Link
                  key={p.province}
                  href={dealersHref(SOUTH_AFRICA, p.province, q)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    province === p.province
                      ? "bg-moss text-paper"
                      : "glass text-ink hover:bg-surface-2"
                  }`}
                >
                  {p.province} <span className="ml-1 opacity-75">({p.count})</span>
                </Link>
              ))}
            </div>
          )}

          <p className="text-sm text-muted mb-12">
            {total} agent{total !== 1 ? "s" : ""}{" "}
            {q ? `matching "${q}"` : locationLabel ? `in ${locationLabel}` : "across Southern Africa"}
          </p>

          {grouped.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center">
              {q || country || province ? (
                <>
                  <p className="text-ink text-lg mb-4">
                    No agents found for that search.
                  </p>
                  <Link href="/dealers" className="text-forest hover:underline">
                    Clear search
                  </Link>
                </>
              ) : (
                // No filters and still nothing: the list is unavailable rather
                // than empty. Give people Diana's number instead of a dead end.
                <p className="text-ink text-lg">
                  Our agent list is being updated. Please contact Diana on{" "}
                  <a href="tel:+27741110315" className="text-forest hover:underline">
                    074 111 0315
                  </a>
                  .
                </p>
              )}
            </div>
          ) : (
            grouped.map(({ country: groupCountry, provinces }) => (
              <section
                key={groupCountry}
                id={groupCountry.toLowerCase().replace(/\s+/g, "-")}
                className="mb-16"
              >
                <h2 className="text-2xl font-semibold text-ink mb-2">{groupCountry}</h2>
                {provinces.map(({ province: groupProvince, regions }) => (
                  <div key={groupProvince || groupCountry}>
                    {groupProvince && (
                      <h3 className="text-lg font-medium text-ink mt-6 mb-1">
                        {groupProvince}
                      </h3>
                    )}
                    {regions.map(({ region, dealers: regionDealers }) => (
                      <div key={region || groupProvince || groupCountry}>
                        {region && (
                          <h4 className="text-sm uppercase tracking-wider text-muted mt-8 mb-3">
                            {region}
                          </h4>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                          {regionDealers.map((d) => {
                            const wa = whatsappNumber(d.phone, d.country);
                            return (
                              <div
                                key={d.id}
                                className="glass rounded-3xl p-5 flex flex-col gap-2 transition-transform hover:-translate-y-0.5"
                              >
                                <div className="text-base font-medium text-ink">
                                  {d.areas.length > 0 ? d.areas.join(" · ") : d.name}
                                </div>
                                <div className="text-sm text-muted">
                                  {d.areas.length > 0 ? d.name : d.country}
                                  {d.business && (
                                    <div className="text-xs mt-0.5">{d.business}</div>
                                  )}
                                </div>
                                {d.isDepot && (
                                  <span className="inline-block self-start rounded-full bg-amber-soft text-amber-deep px-2.5 py-1 text-xs font-medium">
                                    Depot & sales leader
                                  </span>
                                )}
                                <div className="mt-auto pt-3 flex flex-wrap gap-2">
                                  {d.phone && (
                                    <a
                                      href={telHref(d.phone)}
                                      className="rounded-full border border-line bg-white/60 px-3 py-1.5 text-xs text-ink hover:bg-surface-2 transition-colors"
                                    >
                                      {d.phone}
                                    </a>
                                  )}
                                  {wa && (
                                    <a
                                      href={`https://wa.me/${wa}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-full border border-line bg-white/60 px-3 py-1.5 text-xs text-ink hover:bg-surface-2 transition-colors"
                                    >
                                      WhatsApp
                                    </a>
                                  )}
                                  {d.email && (
                                    <a
                                      href={`mailto:${d.email}`}
                                      className="rounded-full border border-line bg-white/60 px-3 py-1.5 text-xs text-ink hover:bg-surface-2 transition-colors"
                                    >
                                      Email
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))
          )}

          <div className="text-center text-sm text-muted mt-16 mb-6">
            Can&apos;t reach an agent? Contact Diana on{" "}
            <a href="tel:+27741110315" className="text-forest hover:underline">
              074 111 0315
            </a>{" "}
            or{" "}
            <a href="mailto:diana.dhd@gmail.com" className="text-forest hover:underline">
              diana.dhd@gmail.com
            </a>
          </div>

          <div className="glass-deep rounded-3xl p-8 mt-16 text-center">
            <h2 className="text-2xl font-semibold text-ink mb-2">Become a dealer</h2>
            <p className="text-muted mb-6">Love the products? Join the network.</p>
            <Link
              href="/dealers/apply"
              className="btn-glow rounded-full bg-forest px-8 py-3.5 text-sm font-medium text-paper inline-block hover:bg-moss transition-colors"
            >
              Apply to become a dealer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
