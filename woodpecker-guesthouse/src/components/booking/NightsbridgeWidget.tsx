"use client";

import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { SITE } from "@/lib/site";

// Real Nightsbridge integration. The client's live site embeds a vanilla-JS
// widget (nb_DateWidget.js) that reads a hardcoded Booking Business ID
// (nb.config.nb_bbid = "37935") and, on "Check Availability", opens
//   https://book.nightsbridge.com/{bbid}?startdate=YYYY-MM-DD&enddate=YYYY-MM-DD
// in a new tab. This component reproduces that exact behaviour with our own
// brand-styled date pickers (flatpickr, the same library their widget uses)
// instead of loading their jQuery-era markup/CSS verbatim — same real
// booking flow and property ID, our visual design.
const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, n: number) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export default function NightsbridgeWidget() {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  const checkInPicker = useRef<flatpickr.Instance | null>(null);
  const checkOutPicker = useRef<flatpickr.Instance | null>(null);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);

  useEffect(() => {
    if (!checkInRef.current || !checkOutRef.current) return;

    checkOutPicker.current = flatpickr(checkOutRef.current, {
      dateFormat: "d M Y",
      defaultDate: tomorrow,
      minDate: addDays(today, 1),
      onChange: ([date]) => date && setCheckOut(date),
    });

    checkInPicker.current = flatpickr(checkInRef.current, {
      dateFormat: "d M Y",
      defaultDate: today,
      minDate: today,
      onChange: ([date]) => {
        if (!date) return;
        setCheckIn(date);
        const minOut = addDays(date, 1);
        checkOutPicker.current?.set("minDate", minOut);
        if (checkOut <= date) {
          checkOutPicker.current?.setDate(minOut, true);
        }
      },
    });

    return () => {
      checkInPicker.current?.destroy();
      checkOutPicker.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookingUrl = `https://book.nightsbridge.com/${SITE.nightsbridge.bbid}?startdate=${toISO(checkIn)}&enddate=${toISO(checkOut)}`;

  return (
    // @container: this widget is reused in two very different widths (a wide
    // hero banner on Home, a narrow sidebar on room detail pages) — sizing
    // its own internal grid off container width, not viewport width, is
    // what makes both placements work without a squeezed sidebar layout.
    <div className="nb-widget @container rounded-2xl bg-white shadow-xl p-5 sm:p-6">
      <div className="grid @[420px]:grid-cols-[1fr_1fr_auto] gap-4 items-end">
        <div>
          <label htmlFor="nb-checkin" className="block text-xs font-medium tracking-widest uppercase text-muted mb-1.5">
            Arrival
          </label>
          <input
            id="nb-checkin"
            ref={checkInRef}
            readOnly
            className="w-full rounded-lg border border-line px-3 py-2.5 text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
        </div>
        <div>
          <label htmlFor="nb-checkout" className="block text-xs font-medium tracking-widest uppercase text-muted mb-1.5">
            Departure
          </label>
          <input
            id="nb-checkout"
            ref={checkOutRef}
            readOnly
            className="w-full rounded-lg border border-line px-3 py-2.5 text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-terracotta/40"
          />
        </div>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-terracotta text-white px-6 py-2.5 font-semibold text-center hover:bg-terracotta-deep transition-colors whitespace-nowrap"
        >
          Check Availability
        </a>
      </div>
    </div>
  );
}
