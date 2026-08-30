"use client";

import { useEffect, useState } from "react";

/**
 * Invisible bot protection for any form that emails or writes to the database.
 * Renders a honeypot a human never sees and stamps when the form mounted;
 * the server decides with `isBot()` in src/lib/bot-guard.ts.
 *
 * Positioned off-canvas rather than `display:none` — some bots skip hidden
 * inputs but happily fill one that is merely out of view.
 */
export function BotGuard() {
  const [renderedAt, setRenderedAt] = useState(0);

  // Set on mount, not at render: a prerendered timestamp would be the build
  // time, which makes every submission look impossibly slow rather than fast.
  useEffect(() => setRenderedAt(Date.now()), []);

  return (
    <div className="absolute -left-[9999px] top-0" aria-hidden="true">
      <label htmlFor="company">Company</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      <input type="hidden" name="renderedAt" value={renderedAt} readOnly />
    </div>
  );
}
