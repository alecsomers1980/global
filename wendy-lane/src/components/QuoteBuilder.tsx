"use client";

import { useState, useMemo } from "react";
import {
  WENDY_SIZES,
  VERANDAS,
  EXTRAS,
  PRICE_LIST_DATE,
  DELIVERY_NOTE,
  formatRand,
  priceOrPOA,
} from "@/data/pricing";
import { BUSINESS } from "@/data/business";
import LeadForm from "@/components/LeadForm";

export default function QuoteBuilder() {
  // State
  const [sizeCode, setSizeCode] = useState<string>(WENDY_SIZES[0]!.code);
  const [withWindow, setWithWindow] = useState<boolean>(false);
  const [verandaCode, setVerandaCode] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [town, setTown] = useState<string>("");

  // Derived data
  const currentSize = useMemo(
    () => WENDY_SIZES.find((s) => s.code === sizeCode)!,
    [sizeCode],
  );

  const windowPriceDelta = currentSize.priceOneWindow - currentSize.priceNoWindow;
  const basePrice = withWindow ? currentSize.priceOneWindow : currentSize.priceNoWindow;

  const selectedVeranda = useMemo(
    () => (verandaCode ? VERANDAS.find((v) => v.code === verandaCode) : undefined),
    [verandaCode],
  );

  const selectedExtrasObjects = useMemo(
    () =>
      selectedExtras
        .map((id) => EXTRAS.find((e) => e.id === id)!)
        .filter(Boolean),
    [selectedExtras],
  );

  const extrasNumericTotal = selectedExtrasObjects.reduce(
    (sum, e) => sum + (e.price ?? 0),
    0,
  );

  const total = basePrice + (selectedVeranda?.price ?? 0) + extrasNumericTotal;

  const hasPOAExtras = selectedExtrasObjects.some((e) => e.price === null);

  // Message builders
  const messageBody = useMemo(() => {
    const lines: string[] = [];
    lines.push("Hi Wendy Lane, I'd like a quote for:\n");
    lines.push(
      `Wendy House ${currentSize.code} (${currentSize.front}m × ${currentSize.side}m) - ${formatRand(basePrice)}`,
    );

    if (withWindow) {
      lines.push(`One window (${currentSize.windowType}) - included`);
    } else {
      lines.push("Door only");
    }

    if (selectedVeranda) {
      lines.push(
        `Veranda ${selectedVeranda.code} (${selectedVeranda.front}m × ${selectedVeranda.side}m) - ${formatRand(selectedVeranda.price)}`,
      );
    }

    selectedExtrasObjects.forEach((extra) => {
      lines.push(`${extra.label} - ${priceOrPOA(extra.price ?? null)}`);
    });

    lines.push("");
    lines.push(`Total: ${formatRand(total)}`);

    const disclaimers: string[] = [];
    disclaimers.push("(All prices include VAT @ 15%)");
    disclaimers.push(
      town
        ? `(Excludes delivery - please quote delivery to ${town}.)`
        : "(Excludes delivery - please quote for my area.)",
    );
    if (hasPOAExtras) {
      disclaimers.push("Some items marked POA - please quote separately.");
    }
    lines.push(disclaimers.join("\n"));

    return lines.join("\n");
  }, [
    currentSize,
    basePrice,
    withWindow,
    selectedVeranda,
    selectedExtrasObjects,
    total,
    hasPOAExtras,
    town,
  ]);

  const whatsappLink = `https://wa.me/${BUSINESS.whatsapp.number}?text=${encodeURIComponent(messageBody)}`;
  const mailtoLink = `mailto:${BUSINESS.email}?subject=${encodeURIComponent("Wendy House quote request")}&body=${encodeURIComponent(messageBody)}`;

  // Handlers
  const handleSizeChange = (code: string) => setSizeCode(code);
  const handleWindowChange = (hasWindow: boolean) => setWithWindow(hasWindow);
  const handleVerandaChange = (code: string) =>
    setVerandaCode(code === "" ? null : code);
  const toggleExtra = (id: string) =>
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        {/* Left column – Options */}
        <div className="space-y-10">
          {/* 1. Size */}
          <fieldset>
            <legend className="text-xl font-semibold text-ink mb-4">
              1. Choose your size
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WENDY_SIZES.map((size) => (
                <label
                  key={size.code}
                  className={`
                    relative block rounded-card border p-4 cursor-pointer transition-all
                    ${
                      sizeCode === size.code
                        ? "border-brand ring-2 ring-brand/30 bg-brand-50"
                        : "border-ink/10 hover:border-brand-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size.code}
                    checked={sizeCode === size.code}
                    onChange={() => handleSizeChange(size.code)}
                    className="sr-only"
                  />
                  <div className="text-lg font-bold text-ink">{size.code}</div>
                  <div className="text-sm text-ink/70">
                    {size.front}m × {size.side}m
                  </div>
                  <div className="mt-1 text-brand font-semibold">
                    From {formatRand(size.priceNoWindow)}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 2. Window */}
          <fieldset>
            <legend className="text-xl font-semibold text-ink mb-4">
              2. Add a window
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Door only */}
              <label
                className={`
                  relative block rounded-card border p-4 cursor-pointer transition-all
                  ${
                    !withWindow
                      ? "border-brand ring-2 ring-brand/30 bg-brand-50"
                      : "border-ink/10 hover:border-brand-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="window"
                  value="no"
                  checked={!withWindow}
                  onChange={() => handleWindowChange(false)}
                  className="sr-only"
                />
                <div className="text-lg font-bold text-ink">Door only</div>
                <div className="text-sm text-ink/70">No window</div>
                <div className="mt-1 text-brand font-semibold">
                  {formatRand(currentSize.priceNoWindow)}
                </div>
              </label>

              {/* One window */}
              <label
                className={`
                  relative block rounded-card border p-4 cursor-pointer transition-all
                  ${
                    withWindow
                      ? "border-brand ring-2 ring-brand/30 bg-brand-50"
                      : "border-ink/10 hover:border-brand-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="window"
                  value="yes"
                  checked={withWindow}
                  onChange={() => handleWindowChange(true)}
                  className="sr-only"
                />
                <div className="text-lg font-bold text-ink">One window</div>
                <div className="text-sm text-ink/70">
                  {currentSize.windowType} window
                </div>
                <div className="mt-1 text-brand font-semibold">
                  {formatRand(currentSize.priceOneWindow)}{" "}
                  <span className="text-sm font-normal text-ink/50">
                    +{formatRand(windowPriceDelta)}
                  </span>
                </div>
              </label>
            </div>
          </fieldset>

          {/* 3. Veranda */}
          <fieldset>
            <legend className="text-xl font-semibold text-ink mb-4">
              3. Add a veranda
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* No veranda */}
              <label
                className={`
                  relative block rounded-card border p-4 cursor-pointer transition-all
                  ${
                    verandaCode === null
                      ? "border-brand ring-2 ring-brand/30 bg-brand-50"
                      : "border-ink/10 hover:border-brand-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="veranda"
                  value=""
                  checked={verandaCode === null}
                  onChange={() => handleVerandaChange("")}
                  className="sr-only"
                />
                <div className="text-lg font-bold text-ink">No veranda</div>
                <div className="text-sm text-ink/70">R0</div>
              </label>

              {VERANDAS.map((veranda) => (
                <label
                  key={veranda.code}
                  className={`
                    relative block rounded-card border p-4 cursor-pointer transition-all
                    ${
                      verandaCode === veranda.code
                        ? "border-brand ring-2 ring-brand/30 bg-brand-50"
                        : "border-ink/10 hover:border-brand-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="veranda"
                    value={veranda.code}
                    checked={verandaCode === veranda.code}
                    onChange={() => handleVerandaChange(veranda.code)}
                    className="sr-only"
                  />
                  <div className="text-lg font-bold text-ink">
                    {veranda.code}
                  </div>
                  <div className="text-sm text-ink/70">
                    {veranda.front}m × {veranda.side}m
                  </div>
                  <div className="mt-1 text-brand font-semibold">
                    {formatRand(veranda.price)}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 4. Extras */}
          <fieldset>
            <legend className="text-xl font-semibold text-ink mb-4">
              4. Optional extras
            </legend>
            <div className="space-y-3">
              {EXTRAS.map((extra) => (
                <label
                  key={extra.id}
                  className="flex items-center gap-4 rounded-card border border-ink/10 p-4 cursor-pointer hover:border-brand-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedExtras.includes(extra.id)}
                    onChange={() => toggleExtra(extra.id)}
                    className="sr-only"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-ink">
                      {extra.label}
                    </div>
                    {extra.note && (
                      <p className="text-sm text-ink/50 mt-0.5">{extra.note}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-semibold ${
                        extra.price === null
                          ? "text-ink/40 text-sm italic"
                          : "text-brand"
                      }`}
                    >
                      {priceOrPOA(extra.price ?? null)}
                    </span>
                  </div>
                  {/* Custom checkbox visual */}
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedExtras.includes(extra.id)
                        ? "border-brand bg-brand text-white"
                        : "border-ink/20 bg-white"
                    }`}
                    aria-hidden="true"
                  >
                    {selectedExtras.includes(extra.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 5. Delivery area */}
          <fieldset>
            <legend className="text-xl font-semibold text-ink mb-4">
              5. Where are we delivering?
            </legend>
            <p className="mb-4 text-sm text-ink/60">
              {DELIVERY_NOTE} Pick your area and we&rsquo;ll include the delivery
              cost when we come back to you — no second round of questions.
            </p>
            <select
              value={town}
              onChange={(e) => setTown(e.target.value)}
              aria-label="Delivery area"
              className="w-full max-w-sm rounded-card border border-ink/10 bg-white px-4 py-3 text-ink transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">Select your area…</option>
              {BUSINESS.serviceAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
              <option value="Somewhere else">Somewhere else</option>
            </select>
          </fieldset>
        </div>

        {/* Right column – Summary */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="rounded-card border border-ink/10 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-ink mb-4">Your quote</h2>

            <div className="space-y-3 text-sm text-ink/80">
              {/* Size */}
              <div className="flex justify-between">
                <span>
                  {currentSize.code} ({currentSize.front}m × {currentSize.side}m)
                </span>
                <span className="font-medium text-ink">
                  {formatRand(basePrice)}
                </span>
              </div>

              {/* Window — priced into the base above, not a separate line item */}
              <div className="flex justify-between">
                <span>
                  {withWindow
                    ? `One window (${currentSize.windowType})`
                    : "Door only"}
                </span>
                <span className="font-medium text-ink">included</span>
              </div>

              {/* Veranda */}
              {selectedVeranda && (
                <div className="flex justify-between">
                  <span>
                    Veranda {selectedVeranda.code} ({selectedVeranda.front}m ×{" "}
                    {selectedVeranda.side}m)
                  </span>
                  <span className="font-medium text-ink">
                    {formatRand(selectedVeranda.price)}
                  </span>
                </div>
              )}

              {/* Extras */}
              {selectedExtrasObjects.map((extra) => (
                <div key={extra.id} className="flex justify-between">
                  <span>{extra.label}</span>
                  <span
                    className={`font-medium ${
                      extra.price === null ? "text-ink/40 italic" : "text-ink"
                    }`}
                  >
                    {extra.price === null
                      ? "POA"
                      : formatRand(extra.price)}
                  </span>
                </div>
              ))}

              {/* Delivery — never priced into the total, always shown so it
                  can't come as a surprise later. */}
              <div className="flex justify-between">
                <span>Delivery{town ? ` to ${town}` : ""}</span>
                <span className="font-medium text-ink/50 italic">
                  {town ? "we'll quote" : "select area"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-ink/10" />

            {/* Total */}
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-semibold text-ink">Total</span>
              <span className="text-2xl font-bold text-brand">
                {formatRand(total)}
              </span>
            </div>

            {/* Disclaimers */}
            <div className="mt-4 space-y-1 text-xs text-ink/50">
              <p>All prices include VAT @ 15%</p>
              <p>{DELIVERY_NOTE}</p>
              {hasPOAExtras && (
                <p className="text-amber-700 font-medium">
                  Final total subject to POA items being quoted.
                </p>
              )}
              <p>Prices as at {PRICE_LIST_DATE}</p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 space-y-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-brand hover:bg-brand-600 text-white font-semibold py-3 px-4 rounded-card transition-colors"
              >
                Send this quote on WhatsApp
              </a>
              <a
                href={mailtoLink}
                className="block w-full text-center border border-brand text-brand hover:bg-brand-50 font-semibold py-3 px-4 rounded-card transition-colors"
              >
                Email this quote
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lead capture — so the enquiry reaches Wendy Lane even if the customer
          never actually sends the WhatsApp/email draft above. */}
      <section id="enquiry" className="scroll-mt-24 mt-16 border-t border-ink/10 pt-12">
        <div className="mx-auto max-w-3xl">
          <LeadForm
            quoteSummary={messageBody}
            heading="Prefer we call you back?"
            intro="Send us your quote and details — we'll come back to you, usually the same working day."
          />
        </div>
      </section>

      {/* Mobile sticky total — keeps price + send action in reach while choosing */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink/50 leading-none">Your total</p>
            <p className="text-xl font-bold text-brand leading-tight">
              {formatRand(total)}
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Send on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
