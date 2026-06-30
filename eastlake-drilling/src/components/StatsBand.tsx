import { stats } from "@/lib/content";

export default function StatsBand() {
  return (
    <div className="bg-white border-y border-black/5">
      <div className="container-px py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-brand">
                {stat.value}
              </div>
              <div className="text-sm text-ink/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}