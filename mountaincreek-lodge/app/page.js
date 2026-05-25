"use client";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-[url('/images/accommodation/IMG_8185.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-4">
            Experience the Lowveld Differently
          </h1>
          <p className="font-serif italic text-2xl md:text-3xl text-white/90 mb-6">
            Stay. Explore. Unwind.
          </p>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Boutique lodge stays, curated safari escapes, and authentic farm-style hospitality near Kruger National Park.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#packages"
              className="bg-[var(--color-terracotta)] text-white px-8 py-3.5 font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity"
            >
              EXPLORE PACKAGES
            </a>
            <a
              href="#book"
              className="border border-white text-white px-8 py-3.5 font-semibold tracking-widest text-sm hover:bg-white hover:text-primary transition-colors"
            >
              BOOK YOUR ESCAPE
            </a>
          </div>
        </div>
      </section>

      {/* Choose Your Experience Section */}
      <section id="packages" className="bg-linen py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-[var(--color-terracotta)] text-xs uppercase tracking-[0.3em] text-center mb-3">
            CURATED ESCAPES
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-center text-primary mb-4">
            Choose Your Experience
          </h2>
          <p className="font-sans text-primary/60 text-center text-lg max-w-2xl mx-auto mb-14">
            From wildlife safaris to romantic getaways — find the escape that speaks to you.
          </p>

          {/* Experience Cards Grid — 3 columns, premium overlay */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {[
              {
                title: "Sunrise Safari Escape",
                slug: "sunrise-safari-escape",
                img: "/images/accommodation/IMG_8185.jpg",
                desc: "Guided game drives and bush walks through the heart of the Lowveld.",
                tag: "MOST POPULAR",
              },
              {
                title: "The Adventure Weekend",
                slug: "adventure-weekend",
                img: "/images/accommodation/IMG_8191.jpg",
                desc: "Thrilling outdoor activities from zip-lining to river rafting.",
                tag: null,
              },
              {
                title: "Romantic Creekside Retreat",
                slug: "romantic-creekside-retreat",
                img: "/images/accommodation/IMG_8188.jpg",
                desc: "Intimate dinners under the stars and couples' spa treatments.",
                tag: null,
              },
              {
                title: "Full Lowveld Experience",
                slug: "full-lowveld-experience",
                img: "/images/accommodation/IMG_8197.jpg",
                desc: "The ultimate all-inclusive escape with everything taken care of.",
                tag: null,
              },
              {
                title: "Farm Café Experience",
                slug: "sunrise-safari-escape",
                img: "/images/Red Litchi/1.jpg",
                desc: "Farm-to-table dining with freshly baked goods and local coffee.",
                tag: null,
              },
            ].map((card, i) => (
              <a
                key={i}
                href={`/packages/${card.slug}`}
                className={`group relative overflow-hidden block ${
                  i >= 3 ? "md:col-span-1 lg:col-span-1" : ""
                } ${i === 3 ? "lg:col-span-2" : ""}`}
                style={{ minHeight: "420px" }}
              >
                {/* Background Image */}
                <img
                  src={card.img}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Tag */}
                {card.tag && (
                  <span className="absolute top-5 left-5 bg-[var(--color-terracotta)] text-white text-[10px] font-bold tracking-widest px-3 py-1.5 uppercase z-10">
                    {card.tag}
                  </span>
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-8">
                  <h3 className="font-serif text-white text-2xl md:text-3xl mb-2 leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-sm">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[var(--color-terracotta)] text-sm font-semibold tracking-wider group-hover:gap-3 transition-all">
                    EXPLORE
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                label: "CURATED EXPERIENCES",
                desc: "Not just accommodation - fully planned escapes tailored to you."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                label: "NEAR KRUGER & PANORAMA ROUTE",
                desc: "The perfect base for exploring wildlife, waterfalls and scenic wonders."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                ),
                label: "AUTHENTIC LOWVELD HOSPITALITY",
                desc: "Warm, personal service that makes you feel right at home."
              },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="text-primary">{feature.icon}</div>
                <span className="font-semibold tracking-widest text-xs text-primary">
                  {feature.label}
                </span>
                <p className="text-sm text-gray-600 max-w-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moments at Mountain Creek Gallery */}
      <section className="bg-primary pt-20 pb-0">
        <h2 className="font-serif text-4xl md:text-5xl text-center text-white mb-14 px-6">
          Moments at Mountain Creek
        </h2>
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
            {[
              "/images/moments/1.jpg",
              "/images/moments/4.jpg",
              "/images/moments/Dam .JPG",
              "/images/moments/IMG_4003.JPG",
              "/images/moments/IMG_4101.JPG",
            ].map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
              >
                <img
                  src={src}
                  alt={`Gallery image ${i + 1}`}
                  className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Call to Action Banner */}
      <section id="book" className="relative text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/accommodation/IMG_8197.jpg" 
            alt="Mountain Creek Lodge" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-primary/95 mix-blend-multiply" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-6xl mb-4">
            Unwind. Explore. Experience.
          </h2>
          <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
            This is more than a stay — it&apos;s a memory in the making.
          </p>
          <a
            href="#book"
            className="inline-block bg-[var(--color-terracotta)] text-white px-8 py-3 font-semibold tracking-widest text-sm hover:opacity-90 transition-opacity"
          >
            BOOK YOUR ESCAPE
          </a>

          {/* Amenity Icons Row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-14">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.375M5.25 14.25V3.375M5.25 14.25L3.375 14.25M21 14.25h-3.375m0 0V3.375m3.375 0H8.25m13.5 10.875V14.25a1.125 1.125 0 00-1.125-1.125h-4.5a1.125 1.125 0 00-1.125 1.125v4.875" />
                  </svg>
                ),
                label: "Free Parking",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                  </svg>
                ),
                label: "Wi-Fi at Café",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ),
                label: "Swimming Pool",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                ),
                label: "On-site Cafe",
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                label: "Secure Property",
              },
            ].map((amenity, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-white/80">
                {amenity.icon}
                <span className="text-xs tracking-wider font-medium">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
