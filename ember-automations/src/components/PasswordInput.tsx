"use client";
import { useState } from "react";

/**
 * Password field with a reveal toggle. Every password input in this app uses
 * this — see the standing rule: forgot-password, show-password, keep-signed-in.
 */
export default function PasswordInput({
  value, onChange, placeholder = "Password", autoComplete = "current-password", id,
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
        className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 pr-16 text-[#e2e2f0]"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b6b8a] hover:text-ember-500 px-2 py-1"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
