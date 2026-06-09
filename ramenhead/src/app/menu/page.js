import React from 'react';

const menuData = [
  {
    title: 'OTSUMAMI',
    subtitle: 'SNACKS FOR DRINKS',
    items: [
      { name: 'EDAMAME', desc: 'Chilli & garlic salt', price: '70' },
      { name: 'RAMEN CHIP', desc: 'Seasonal vegetable spicy dip', price: '70' },
      { name: 'PORK CHASHU BITES', desc: 'Pickled ginger, spring onion', price: '75' },
    ],
  },
  {
    title: 'GYOZA',
    subtitle: null,
    items: [
      { name: 'AUBERGINE & SWEETCORN', desc: 'Crispy chilli & garlic, fresh basil, spring onion', price: '115' },
      { name: 'OSTRICH & WAGYU', desc: 'Danja & apricot chutney, coriander dressing', price: '135' },
    ],
  },
  {
    title: 'SMALL PLATES',
    subtitle: 'These Izakaya style small plates are for sharing before your ramen.',
    items: [
      { name: 'FRESH CABBAGE SALAD', desc: 'Ponzu, crispy onion, smoked chilli', price: '85' },
      { name: 'OKONOMIYAKI FRIES', desc: 'Spring onion, nori, katsuobushi', price: '75' },
      { name: 'TUNA TARTARE', desc: 'Spicy sour dressing, wasabi, fresh daikon', price: '125' },
      { name: 'SAKE STEAMED MUSSELS', desc: 'Umami garlic butter, shiso', price: '125' },
      { name: 'KARAAGE', desc: 'Tokyo fried chicken, tomato chutney, curry sauce', price: '130' },
    ],
  },
  {
    title: 'RAMEN BOWLS',
    subtitle: 'Med / Large',
    items: [
      { name: 'TONKOTSU', desc: 'Rich pork bone broth, Tokyo noodles, pork belly chashu, pickled ginger, ajitamago, mayu, rayu, kikurage', price: '150 / 220' },
      { name: 'TOFU SESAME ABURA SOBA', desc: 'SOUPLESS — Sesame & mala spice, kitakata noodles, smoked tofu, shiitake, menma, rayu', price: '150 / 225' },
      { name: 'TORCHED CAPE WAGYU', desc: 'Wagyu ms9+, Tokyo noodles, beef broth, shoyu tare, spring onions, truffled kikurage, shiitake, menma', price: '420' },
      { name: 'TORI PAITAN', desc: 'Rich and creamy chicken broth, Tokyo style noodles, shoyu tare, chicken wonton, chicken chashu, spring onion, chilli oil', price: '160 / 230' },
      { name: 'KAROO LAMB TANTANMEN', desc: 'Spicy roast mince, Japanese curry broth, kitakata noodles, coriander, raita, roast tomato, garlic oil', price: '150 / 225' },
    ],
  },
  {
    title: 'ADD ONS / EXTRAS',
    subtitle: null,
    items: [
      { name: 'Ajitamago egg', desc: null, price: '22' },
      { name: 'Chicken wonton', desc: null, price: '18' },
      { name: 'Noodles', desc: null, price: '32' },
      { name: 'Chicken chashu', desc: null, price: '30' },
      { name: 'Pork chashu', desc: null, price: '32' },
    ],
  },
  {
    title: 'DEZĀTO',
    subtitle: null,
    items: [
      { name: 'OKINAWA DANGO', desc: 'Sweet dumpling, matcha sugar, dark chocolate', price: '70' },
      { name: 'KONBINI SANDO', desc: 'Strawberries & cream sandwich', price: '75' },
    ],
  },
];

export default function MenuPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        .menu-page {
          background-color: #000;
          color: #a6a39f;
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          padding: 80px 24px 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .menu-hero {
          text-align: center;
          margin-bottom: 72px;
          position: relative;
        }

        .menu-hero::after {
          content: '';
          display: block;
          width: 60px;
          height: 2px;
          background: #EE3526;
          margin: 28px auto 0;
        }

        .menu-hero-title {
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #EE3526;
          margin-bottom: 16px;
        }

        .menu-hero-heading {
          font-family: 'Poppins', sans-serif;
          font-size: clamp(42px, 7vw, 72px);
          font-weight: 700;
          color: #ebe3d7;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .menu-hero-tagline {
          font-size: 15px;
          font-weight: 300;
          color: #a6a39f;
          margin-top: 20px;
          letter-spacing: 0.08em;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
          max-width: 1100px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .menu-grid {
            grid-template-columns: 1fr 1fr;
            gap: 64px 80px;
          }

          .menu-page {
            padding: 100px 48px 120px;
          }

          .menu-section--full {
            grid-column: 1 / -1;
          }
        }

        @media (min-width: 1024px) {
          .menu-page {
            padding: 120px 64px 140px;
          }
        }

        .menu-section {
          position: relative;
        }

        .menu-section-title {
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #ebe3d7;
          margin-bottom: 6px;
          position: relative;
          display: inline-block;
        }

        .menu-section-title::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(235, 227, 215, 0.15);
        }

        .menu-section-subtitle {
          font-size: 12px;
          font-weight: 300;
          color: rgba(166, 163, 159, 0.7);
          letter-spacing: 0.06em;
          margin-top: 10px;
          margin-bottom: 28px;
          line-height: 1.6;
          text-transform: uppercase;
        }

        .menu-section-subtitle--italic {
          font-style: italic;
          text-transform: none;
          font-size: 13px;
          letter-spacing: 0.02em;
        }

        .menu-item {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(166, 163, 159, 0.08);
          transition: background-color 0.3s ease;
        }

        .menu-item:last-child {
          border-bottom: none;
        }

        .menu-item:hover {
          background-color: rgba(235, 227, 215, 0.02);
        }

        .menu-item-left {
          flex: 1;
          min-width: 0;
        }

        .menu-item-name {
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #ebe3d7;
          letter-spacing: 0.04em;
          line-height: 1.4;
        }

        .menu-item-name--small {
          font-size: 14px;
          font-weight: 400;
          color: #a6a39f;
          letter-spacing: 0.02em;
        }

        .menu-item-desc {
          font-size: 12.5px;
          font-weight: 300;
          color: rgba(166, 163, 159, 0.65);
          line-height: 1.55;
          margin-top: 4px;
          letter-spacing: 0.01em;
        }

        .menu-item-price {
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #EE3526;
          letter-spacing: 0.02em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .menu-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(235, 227, 215, 0.12), transparent);
          margin: 8px 0 0 0;
        }

        .addons-section .menu-item {
          padding: 10px 0;
        }

        .addons-section .menu-item-name {
          font-size: 14px;
          font-weight: 400;
          color: #a6a39f;
        }

        .addons-section .menu-item-price {
          font-size: 13px;
          font-weight: 500;
        }

        .dezato-section .menu-item-name {
          font-size: 15px;
          font-weight: 500;
          color: #ebe3d7;
        }

        .soupless-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #EE3526;
          border: 1px solid rgba(238, 53, 38, 0.4);
          padding: 2px 8px;
          margin-left: 8px;
          vertical-align: middle;
          text-transform: uppercase;
        }

        .wagyu-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #EE3526;
          border: 1px solid rgba(238, 53, 38, 0.4);
          padding: 2px 8px;
          margin-left: 8px;
          vertical-align: middle;
          text-transform: uppercase;
        }

        .menu-footer-note {
          text-align: center;
          margin-top: 64px;
          font-size: 11px;
          font-weight: 300;
          color: rgba(166, 163, 159, 0.4);
          letter-spacing: 0.1em;
          line-height: 1.8;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-hero {
          animation: fadeInUp 0.8s ease-out both;
        }

        .menu-section {
          animation: fadeInUp 0.6s ease-out both;
        }

        .menu-section:nth-child(1) { animation-delay: 0.2s; }
        .menu-section:nth-child(2) { animation-delay: 0.3s; }
        .menu-section:nth-child(3) { animation-delay: 0.4s; }
        .menu-section:nth-child(4) { animation-delay: 0.5s; }
        .menu-section:nth-child(5) { animation-delay: 0.6s; }
        .menu-section:nth-child(6) { animation-delay: 0.7s; }
      `}</style>

      <div className="menu-page">
        <div className="menu-hero">
          <div className="menu-hero-title">Ramenhead</div>
          <h1 className="menu-hero-heading">Our Menu</h1>
          <p className="menu-hero-tagline">Crafted with obsession. Served with soul.</p>
        </div>

        <div className="menu-grid">
          {menuData.map((section, idx) => {
            const isFullWidth = section.title === 'RAMEN BOWLS' || section.title === 'SMALL PLATES';
            const isAddons = section.title === 'ADD ONS / EXTRAS';
            const isDezato = section.title === 'DEZĀTO';

            return (
              <div
                key={section.title}
                className={`menu-section ${isFullWidth ? 'menu-section--full' : ''} ${isAddons ? 'addons-section' : ''} ${isDezato ? 'dezato-section' : ''}`}
              >
                <h2 className="menu-section-title">{section.title}</h2>
                {section.subtitle && (
                  <p className={`menu-section-subtitle ${!isFullWidth ? 'menu-section-subtitle--italic' : ''}`}>
                    {section.subtitle}
                  </p>
                )}
                <div className="menu-divider" />

                {section.items.map((item) => (
                  <div className="menu-item" key={item.name}>
                    <div className="menu-item-left">
                      <div className={`menu-item-name ${isAddons ? 'menu-item-name--small' : ''}`}>
                        {item.name}
                        {item.name === 'TOFU SESAME ABURA SOBA' && (
                          <span className="soupless-tag">Soupless</span>
                        )}
                        {item.name === 'TORCHED CAPE WAGYU' && (
                          <span className="wagyu-tag">MS9+</span>
                        )}
                      </div>
                      {item.desc && (
                        <div className="menu-item-desc">{item.desc}</div>
                      )}
                    </div>
                    <div className="menu-item-price">{item.price}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="menu-footer-note">
          Prices in South African Rand (ZAR).<br />
          All dishes are prepared in kitchens that handle allergens.<br />
          Please inform your server of any dietary requirements.
        </div>
      </div>
    </>
  );
}
