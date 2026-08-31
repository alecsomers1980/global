"use client";

import { useState } from "react";

/**
 * Password field with a show/hide toggle.
 *
 * Every login in this build ships the toggle, forgot-password and
 * keep-me-signed-in in the first pass rather than as a retrofit.
 */
export function PasswordInput({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className="min-h-[48px] w-full border border-hairline bg-white px-4 pr-16 text-[15px] text-ink focus:border-brand focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] uppercase tracking-[0.08em] text-ink-mute hover:text-brand"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
