import Image from "next/image";
import Link from "next/link";
import HomeSearchWidget from "@/components/HomeSearchWidget";
import NewsletterForm from "@/components/NewsletterForm";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: cars } = await supabase
    .from("cars")
    .select("make")
    .eq("status", "available");

  const uniqueMakes = cars
    ? Array.from(new Set(cars.map(c => c.make).filter(Boolean))).sort()
    : undefined;

  const { data: featuredCars } = await supabase
    .from("cars")
    .select("*")
    .eq("status", "available")
    .order("is_featured", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>

      {/* Hero Section */}
      <section className="relative flex min-h-[600px] w-full items-center justify-center bg-slate-900 px-4 py-20 lg:min-h-[700px]">
        <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent z-10"></div>
          {/* Massive Watermark Logo Behind Everything */}
          <div className="absolute inset-0 z-15 flex items-center justify-center opacity-40 pointer-events-none mix-blend-overlay">
            <img
              src="/images/logo.png"
              alt="Everest Motoring Background Watermark"
              className="h-[120%] w-auto object-contain -translate-x-1/4"
            />
          </div>
          <Image
            alt="Premium pre-owned vehicles"
            src="/images/banner.png"
            fill
            priority
            className="object-cover object-center opacity-60"
            sizes="100vw"
          />
        </div>
        <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-4 lg:px-8">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="mb-4 inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark">
              Premium Pre-Owned Specialists
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white lg:text-6xl">
              We sell cars with <br />
              <span className="text-primary">Integrity & Expertise.</span>
            </h1>
            <p className="mt-6 text-lg font-normal leading-relaxed text-slate-300 lg:text-xl">
              At Everest Motoring, we proudly do things the Everest way. We are highly selective, buying only the absolute best quality pre-loved cars to make your dream vehicle a reality.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:bg-primary-dark">
                View Latest Deals
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-8 py-3.5 text-base font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-slate-800">
                Value my car
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search Widget */}
      <div className="relative z-30 -mt-16 w-full px-4 lg:px-12">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
          <HomeSearchWidget makes={uniqueMakes && uniqueMakes.length > 0 ? uniqueMakes : undefined} />
        </div>
      </div>

      {/* Featured Vehicles */}
      <section className="bg-white py-24 px-4 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-900">Featured Vehicles</h3>
              <p className="mt-2 text-slate-500">Hand-picked premium cars just for you.</p>
            </div>
            <a className="hidden items-center gap-1 font-bold text-primary hover:underline md:flex" href="#">
              View Inventory <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

            {featuredCars && featuredCars.map((car) => (
              <Link key={car.id} href={`/inventory/${car.id}`} className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,102,255,0.1)]">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <div className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase text-slate-900 backdrop-blur-sm">
                    {car.is_featured ? 'Featured' : 'Used'}
                  </div>
                  {car.status !== 'available' && (
                    <div className="absolute top-3 left-3 z-10 rounded bg-red-500 px-2 py-1 text-xs font-bold uppercase text-white shadow-lg animate-pulse">
                      {car.status.toUpperCase()}
                    </div>
                  )}
                  {car.main_image_url ? (
                    <Image
                      src={car.main_image_url}
                      alt={`${car.make} ${car.model}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <span className="material-symbols-outlined text-4xl">directions_car</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{car.year} • {car.transmission}</div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900">{car.make} {car.model}</h4>
                  <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-xs font-medium text-slate-500">{new Intl.NumberFormat('en-ZA').format(car.mileage)} km</span>
                      <span className="block text-xs font-medium text-slate-500">{car.fuel_type || 'Fuel'}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">R {new Intl.NumberFormat('en-ZA').format(car.price)}</div>
                  </div>
                </div>
              </Link>
            ))}

          </div>
          <div className="mt-8 flex justify-center md:hidden">
            <button className="flex w-full items-center justify-center rounded-lg border border-slate-200 px-6 py-3 font-bold text-slate-900">
              View All Inventory
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-background-alt py-24 px-4 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl text-secondary">The Everest Advantage</h2>
            <p className="mt-4 text-lg text-slate-500">We&apos;re fundamentally changing the way people view and buy used cars across South Africa.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md border-t-4 border-primary">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-primary">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Selective Sourcing</h3>
              <p className="text-slate-500 leading-relaxed text-sm">We don&apos;t just buy any vehicle. We are incredibly selective, purchasing only the highest quality, accident-free pre-loved cars for our clients.</p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md border-t-4 border-secondary">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-secondary">
                <span className="material-symbols-outlined text-4xl">account_balance</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Seamless Bank Finance</h3>
              <p className="text-slate-500 leading-relaxed text-sm">We are approved by and offer direct vehicle finance through all top South African banks. Comprehensive insurance options are also managed in-house.</p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md border-t-4 border-primary">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-primary">
                <span className="material-symbols-outlined text-4xl">workspace_premium</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Integrity First</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Doing things the &apos;Everest Way&apos; means complete transparency. From your first digital inquiry to handing over the keys, we prioritize honesty and expertise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value My Car Lead Magnet */}
      <section className="bg-blue-50 py-24 px-4 lg:px-12">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl md:p-12 border border-blue-100 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">Trade in or Sell your car today</h2>
          <p className="mb-8 text-lg text-slate-600">Get an instant, obligation-free valuation for your vehicle. We pay top market rates.</p>
          <div className="mx-auto flex justify-center mt-6">
            <Link href="/value-my-car" className="rounded-xl bg-primary px-12 py-5 text-lg font-bold text-white transition-all hover:bg-primary-dark hover:-translate-y-1 shadow-lg shadow-primary/30 flex items-center gap-3">
              Get Valuation
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-500 uppercase tracking-wider font-bold">Safe • Secure • Instant Cash</p>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Don&apos;t miss the perfect deal.</h2>
          <p className="mb-8 text-blue-100">Subscribe to our weekly alerts and be the first to know about new arrivals.</p>
          <NewsletterForm variant="home" />
        </div>
      </section>

    </>
  );
}
