"use client";

import { useState } from "react";

/** Password field with a show/hide toggle. Reused across all auth forms. */
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="rounded-xl border border-line bg-white px-4 py-2.5 pr-16 text-sm w-full outline-none focus:border-forest"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
