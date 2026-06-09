'use client';

import React, { useState, useEffect } from 'react';
import { DESIGNS, DELIVERY, PRICE_SET_CENTS, PRICE_BAGTAG_CENTS, rand } from '@/lib/designs';
import type { DeliveryOption } from '@/lib/designs';
import {
  Star,
  Tag,
  X,
  Store,
  Package,
  Truck,
  CheckCircle,
  Lock,
} from 'lucide-react';

const gradientPairs = [
  { from: 'from-brand-pink', to: 'to-brand-purple' },
  { from: 'from-brand-purple', to: 'to-brand-teal' },
  { from: 'from-brand-teal', to: 'to-brand-orange' },
  { from: 'from-brand-orange', to: 'to-brand-yellow' },
  { from: 'from-brand-yellow', to: 'to-brand-green' },
  { from: 'from-brand-green', to: 'to-brand-pink' },
] as const;

function getDesignGradient(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradientPairs[sum % 6];
}

const colorsForTitle = [
  'text-brand-pink',
  'text-brand-purple',
  'text-brand-teal',
  'text-brand-orange',
  'text-brand-yellow',
  'text-brand-green',
  'text-brand-blue',
] as const;

function HeroTitle() {
  const letters = [
    { char: 'S', color: 'bg-brand-yellow' },
    { char: 'T', color: 'bg-brand-orange' },
    { char: 'I', color: 'bg-brand-blue' },
    { char: 'C', color: 'bg-brand-green' },
    { char: 'K', color: 'bg-brand-purple' },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 md:gap-2">
        {letters.map((l, i) => (
          <div key={i} className={`w-12 h-14 md:w-20 md:h-24 ${l.color} flex items-center justify-center rounded shadow-sm`}>
            <span className="text-3xl md:text-6xl font-black text-white">{l.char}</span>
          </div>
        ))}
      </div>
      <div className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight mt-1">
        to your name
      </div>
    </div>
  );
}

export default function OrderPage() {
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [bagTag, setBagTag] = useState<boolean>(false);
  const [childName, setChildName] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | null>(null);
  const [pudoLocation, setPudoLocation] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    paymentUrl: string;
    fields: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    if (!paymentData) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.paymentUrl;
    form.style.display = 'none';
    Object.entries(paymentData.fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }, [paymentData]);

  const phoneDigits = customerPhone.replace(/\s/g, '');
  const isPhoneValid = /^\d{10}$/.test(phoneDigits);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  const isNameValid = customerName.trim().length > 1;
  const isChildNameValid =
    childName.trim().length >= 1 && childName.trim().length <= 20;
  const isDesignSelected = selectedDesignId !== null;
  const isDeliveryOptionSelected = deliveryOption !== null;
  const isPudoLocationValid =
    deliveryOption === 'pudo' ? pudoLocation.trim().length > 0 : true;
  const isDeliveryAddressValid =
    deliveryOption === 'courierguy' ? deliveryAddress.trim().length > 0 : true;

  const formValid =
    isDesignSelected &&
    isChildNameValid &&
    isDeliveryOptionSelected &&
    isPudoLocationValid &&
    isDeliveryAddressValid &&
    isNameValid &&
    isEmailValid &&
    isPhoneValid;

  const totalCents =
    PRICE_SET_CENTS +
    (bagTag ? PRICE_BAGTAG_CENTS : 0) +
    (deliveryOption ? DELIVERY[deliveryOption].priceCents : 0);

  const handleSubmit = async () => {
    if (!formValid || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    const payload = {
      designId: selectedDesignId,
      bagTag,
      childName: childName.trim(),
      deliveryOption,
      pudoLocation: deliveryOption === 'pudo' ? pudoLocation.trim() : undefined,
      deliveryAddress:
        deliveryOption === 'courierguy' ? deliveryAddress.trim() : undefined,
      customerName: customerName.trim(),
      customerEmail,
      customerPhone: phoneDigits,
    };

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      setPaymentData({ paymentUrl: data.paymentUrl, fields: data.fields });
    } catch (err) {
      setErrorMsg('Network error. Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  const designCardClass = (id: string) =>
    `relative w-full aspect-square flex items-center justify-center rounded-2xl transition-all duration-200 ${
      selectedDesignId === id
        ? 'ring-4 ring-brand-pink scale-105'
        : 'hover:ring-2 ring-gray-300'
    }`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="py-12 px-4 text-center bg-white">
        <HeroTitle />
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Self-adhesive vinyl labels — just making life a little easier!
        </p>
        <div className="mt-6 inline-block bg-brand-pink text-white font-semibold rounded-full px-6 py-2 text-lg">
          {rand(PRICE_SET_CENTS)} per set
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm text-gray-700">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-teal flex-shrink-0" />
            <span>120 stickers per set</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-teal flex-shrink-0" />
            <span>Sticks to anything</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-teal flex-shrink-0" />
            <span>1–2 weeks delivery</span>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-10 px-4 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            What you get
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Each pack: 2 × A4 sheets, 120 personalised vinyl labels, packaged in
            a protective plastic cover. Perfect for pencils, koki pens,
            lunchboxes, water bottles, sports kit and anything else your child
            might lose.
          </p>
        </div>
      </section>

      {/* Design Gallery */}
      <section className="py-10 px-4 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            View our designs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <img src="/catalog-1.png" alt="Design Catalog 1" className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
            <img src="/catalog-2.png" alt="Design Catalog 2" className="w-full h-auto rounded-xl shadow-sm border border-gray-100" />
          </div>
        </div>
      </section>

      {/* Order Form */}
      <section className="max-w-5xl mx-auto px-4 pb-20 lg:flex lg:gap-8 lg:items-start">
        <div className="flex-1 space-y-8">
          {/* Step 1 — Choose a design */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-pink text-white font-bold text-sm">
                1
              </span>
              <h3 className="text-xl font-semibold text-gray-900">
                Choose a design
              </h3>
            </div>
            <div
              role="radiogroup"
              aria-label="Choose a design"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              {DESIGNS.map((design) => {
                const { from, to } = getDesignGradient(design.id);
                return (
                  <div key={design.id} className="relative">
                    {design.popular && (
                      <span className="absolute -top-1 -right-1 z-10 bg-brand-yellow text-white rounded-full p-0.5 shadow">
                        <Star className="w-4 h-4 fill-white" />
                      </span>
                    )}
                    <button
                      role="radio"
                      aria-checked={selectedDesignId === design.id}
                      aria-label={design.name}
                      className={designCardClass(design.id)}
                      onClick={() => setSelectedDesignId(design.id)}
                    >
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${from} ${to} flex items-center justify-center relative shadow-md`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md leading-tight text-center px-0.5">
                          {design.name}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Add a Bag Tag? */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-pink text-white font-bold text-sm">
                2
              </span>
              <h3 className="text-xl font-semibold text-gray-900">
                Add a Bag Tag?
              </h3>
            </div>
            <fieldset>
              <legend className="sr-only">Add a bag tag?</legend>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center transition ${
                    bagTag
                      ? 'border-brand-pink bg-brand-pink/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="bagtag"
                    checked={bagTag}
                    onChange={() => setBagTag(true)}
                    className="sr-only"
                  />
                  <Tag className="w-8 h-8 mb-2 text-brand-purple" />
                  <span className="font-semibold">Yes (+R15)</span>
                </label>
                <label
                  className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center transition ${
                    !bagTag
                      ? 'border-brand-pink bg-brand-pink/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="bagtag"
                    checked={!bagTag}
                    onChange={() => setBagTag(false)}
                    className="sr-only"
                  />
                  <X className="w-8 h-8 mb-2 text-gray-400" />
                  <span className="font-semibold">No thanks</span>
                </label>
              </div>
            </fieldset>
            <p className="mt-3 text-sm text-gray-500">
              A matching vinyl tag for their school bag — same personalised name.
            </p>
          </div>

          {/* Step 3 — Child's Name */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-pink text-white font-bold text-sm">
                3
              </span>
              <h3 className="text-xl font-semibold text-gray-900">
                Child&rsquo;s Name
              </h3>
            </div>
            <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
              Name on labels
            </label>
            <input
              id="childName"
              type="text"
              maxLength={20}
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full font-mono uppercase rounded-xl border border-gray-300 px-4 py-3 text-lg placeholder-gray-400 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              placeholder="e.g. ALEX"
              aria-invalid={childName.trim().length > 0 && !isChildNameValid}
            />
            <p className="mt-2 text-sm text-gray-500">
              Use block letters. This is what gets printed on every label.
            </p>
          </div>

          {/* Step 4 — Delivery / Collection */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-pink text-white font-bold text-sm">
                4
              </span>
              <h3 className="text-xl font-semibold text-gray-900">
                Delivery / Collection
              </h3>
            </div>
            <fieldset>
              <legend className="sr-only">Delivery option</legend>
              <div className="space-y-4">
                {(Object.keys(DELIVERY) as DeliveryOption[]).map((key) => {
                  const option = DELIVERY[key];
                  const Icon =
                    key === 'collect'
                      ? Store
                      : key === 'pudo'
                      ? Package
                      : Truck;
                  const selected = deliveryOption === key;
                  return (
                    <label
                      key={key}
                      className={`cursor-pointer border-2 rounded-2xl p-4 flex items-start gap-4 transition ${
                        selected
                          ? 'border-brand-pink bg-brand-pink/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        checked={selected}
                        onChange={() => setDeliveryOption(key)}
                        className="sr-only"
                      />
                      <Icon className="w-8 h-8 mt-1 text-brand-teal flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 block">
                          {option.label}{' '}
                          {option.priceCents > 0
                            ? `(${rand(option.priceCents)})`
                            : '(Free)'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {option.description}
                        </p>
                        {selected && key === 'pudo' && (
                          <div className="mt-3">
                            <label
                              htmlFor="pudoLocation"
                              className="text-sm font-medium text-gray-700"
                            >
                              Pudo locker location
                            </label>
                            <input
                              id="pudoLocation"
                              type="text"
                              value={pudoLocation}
                              onChange={(e) => setPudoLocation(e.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                              placeholder="e.g. Spar The Village"
                              aria-invalid={
                                key === 'pudo' && !isPudoLocationValid && pudoLocation.length > 0
                              }
                            />
                          </div>
                        )}
                        {selected && key === 'courierguy' && (
                          <div className="mt-3">
                            <label
                              htmlFor="deliveryAddress"
                              className="text-sm font-medium text-gray-700"
                            >
                              Delivery address
                            </label>
                            <textarea
                              id="deliveryAddress"
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                              rows={3}
                              placeholder="Street address, suburb, city"
                              aria-invalid={
                                key === 'courierguy' &&
                                !isDeliveryAddressValid &&
                                deliveryAddress.length > 0
                              }
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Step 5 — Your Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-pink text-white font-bold text-sm">
                5
              </span>
              <h3 className="text-xl font-semibold text-gray-900">
                Your Details
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="Your name"
                  aria-invalid={customerName.length > 0 && !isNameValid}
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile number
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="082 123 4567"
                  aria-invalid={customerPhone.length > 0 && !isPhoneValid}
                />
                <p className="text-xs text-gray-500 mt-1">10 digits, spaces ignored</p>
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="you@example.com"
                  aria-invalid={customerEmail.length > 0 && !isEmailValid}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary – sticky on desktop */}
        <aside className="lg:w-80 lg:sticky lg:top-8 mt-8 lg:mt-0">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>120 personalised labels</span>
                <span>{rand(PRICE_SET_CENTS)}</span>
              </li>
              {bagTag && (
                <li className="flex justify-between">
                  <span>Bag tag</span>
                  <span>{rand(PRICE_BAGTAG_CENTS)}</span>
                </li>
              )}
              {deliveryOption && (
                <li className="flex justify-between">
                  <span>{DELIVERY[deliveryOption].label}</span>
                  <span>
                    {DELIVERY[deliveryOption].priceCents > 0
                      ? rand(DELIVERY[deliveryOption].priceCents)
                      : 'Free'}
                  </span>
                </li>
              )}
              {!deliveryOption && (
                <li className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span>—</span>
                </li>
              )}
              <li className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>{rand(totalCents)}</span>
              </li>
            </ul>

            {errorMsg && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!formValid || submitting}
              className="mt-6 w-full bg-brand-pink hover:bg-brand-pink/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-2xl text-lg transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Processing...'
              ) : (
                <>
                  Pay {rand(totalCents)} via PayFast
                  <Lock className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              You will be redirected to PayFast to complete payment securely.
            </p>
          </div>
        </aside>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-500 space-y-2">
        <p>
          Aloe Signs · 42 Homestead Avenue, Randfontein · WhatsApp 083 417 5490
          · melissa@aloesigns.co.za
        </p>
        <p className="flex items-center justify-center gap-1">
          <Lock className="w-4 h-4" />
          Powered by PayFast
        </p>
        <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
          Payment is required to confirm your order. We dispatch within 1–2
          weeks of receiving payment.
        </p>
      </footer>
    </main>
  );
}
