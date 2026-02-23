import Image from "next/image";

export default function Home() {
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
                Instantly Value My Car
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search Widget */}
      <div className="relative z-30 -mt-16 w-full px-4 lg:px-12">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Make</label>
              <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-8 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Any Make</option>
                <option>BMW</option>
                <option>Mercedes-Benz</option>
                <option>Audi</option>
                <option>Toyota</option>
              </select>
              <div className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400">
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </div>
            </div>
            <div className="relative">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Model</label>
              <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-8 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option>Any Model</option>
              </select>
              <div className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400">
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </div>
            </div>
            <div className="relative">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Max Price</label>
              <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 pr-8 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option>No Limit</option>
                <option>R 200,000</option>
                <option>R 500,000</option>
                <option>R 1,000,000</option>
              </select>
              <div className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400">
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </div>
            </div>
            <div className="flex items-end">
              <button className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-primary font-bold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark" type="button">
                <span className="material-symbols-outlined">search</span> Search Vehicles
              </button>
            </div>
          </form>
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

            {/* Car Card 1 */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,102,255,0.1)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <div className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase text-slate-900 backdrop-blur-sm">Used</div>
                <img alt="BMW" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2670&auto=format&fit=crop" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">2021 • Automatic</div>
                <h4 className="mb-2 text-lg font-bold text-slate-900">BMW 320d M Sport</h4>
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-xs font-medium text-slate-500">45,000 km</span>
                    <span className="block text-xs font-medium text-slate-500">Diesel</span>
                  </div>
                  <div className="text-xl font-bold text-primary">R 649,900</div>
                </div>
              </div>
            </div>

            {/* Car Card 2 */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,102,255,0.1)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <div className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase text-slate-900 backdrop-blur-sm">Demo</div>
                <div className="absolute top-3 left-3 z-10 rounded bg-red-500 px-2 py-1 text-xs font-bold uppercase text-white shadow-lg animate-pulse">🔥 High Interest</div>
                <img alt="Mercedes" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2670&auto=format&fit=crop" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">2023 • Automatic</div>
                <h4 className="mb-2 text-lg font-bold text-slate-900">Mercedes-Benz C200</h4>
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-xs font-medium text-slate-500">12,500 km</span>
                    <span className="block text-xs font-medium text-slate-500">Petrol Hybrid</span>
                  </div>
                  <div className="text-xl font-bold text-primary">R 895,000</div>
                </div>
              </div>
            </div>

            {/* Car Card 3 */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,102,255,0.1)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <div className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase text-slate-900 backdrop-blur-sm">Used</div>
                <img alt="Toyota" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1581540222194-0def2dda95b8?q=80&w=2670&auto=format&fit=crop" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">2020 • Automatic</div>
                <h4 className="mb-2 text-lg font-bold text-slate-900">Toyota Fortuner 2.8 GD-6</h4>
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-xs font-medium text-slate-500">88,000 km</span>
                    <span className="block text-xs font-medium text-slate-500">Diesel</span>
                  </div>
                  <div className="text-xl font-bold text-primary">R 589,900</div>
                </div>
              </div>
            </div>

            {/* Car Card 4 */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(0,102,255,0.1)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <div className="absolute right-3 top-3 z-10 rounded bg-white/90 px-2 py-1 text-xs font-bold uppercase text-slate-900 backdrop-blur-sm">Used</div>
                <img alt="Audi" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=2674&auto=format&fit=crop" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">2022 • Automatic</div>
                <h4 className="mb-2 text-lg font-bold text-slate-900">Audi A5 Sportback 40TFSI</h4>
                <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="block text-xs font-medium text-slate-500">32,000 km</span>
                    <span className="block text-xs font-medium text-slate-500">Petrol</span>
                  </div>
                  <div className="text-xl font-bold text-primary">R 725,000</div>
                </div>
              </div>
            </div>

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
          <form className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row">
            <input className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Enter Registration Number" type="text" />
            <input className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Current Mileage" type="text" />
            <button className="rounded-xl bg-primary px-8 py-4 font-bold text-white transition-colors hover:bg-primary-dark shadow-lg shadow-primary/30">Get Valuation</button>
          </form>
          <p className="mt-4 text-sm text-slate-500 uppercase tracking-wider font-bold">Safe • Secure • Instant Cash</p>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Don&apos;t miss the perfect deal.</h2>
          <p className="mb-8 text-blue-100">Subscribe to our weekly alerts and be the first to know about new arrivals.</p>
          <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <input className="flex-1 rounded-lg border-0 bg-white px-5 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300" placeholder="Enter your email address" type="email" />
            <button className="rounded-lg bg-slate-900 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-800">Subscribe</button>
          </form>
        </div>
      </section>

    </>
  );
}
