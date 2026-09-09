export default function Card({ children, className = "", padding = "p-8" }) {
  return (
    <div
      className={`bg-[#1a1d27] rounded-xl border border-white/5 ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
