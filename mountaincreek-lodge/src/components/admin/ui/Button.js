const VARIANTS = {
  primary:
    "bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors disabled:opacity-60",
  secondary:
    "text-white/40 hover:text-white/70 px-6 py-3 text-sm transition-colors",
  danger:
    "text-red-400/60 hover:text-red-400 px-3 transition-colors",
  dangerFilled:
    "bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
