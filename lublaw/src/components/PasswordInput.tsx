"use client";
import { useState } from "react";

/** Password field with a reveal toggle. Standing rule for every login in
 *  this codebase: forgot-password + show-password + keep-signed-in. */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        className="rounded-lg border border-line bg-white px-4 py-2.5 pr-16 text-sm w-full outline-none focus:border-maroon"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-maroon px-2 py-1"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
