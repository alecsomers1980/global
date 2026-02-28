export default function StatsSection() {
    const stats = [
        { value: '25+', label: 'YEARS IN BUSINESS' },
        { value: '500+', label: 'PROJECTS COMPLETED' },
        { value: '180+', label: 'VEHICLES WRAPPED' },
        { value: '4.9★', label: 'GOOGLE RATING' },
    ];

    return (
        <section className="py-24 bg-[#0B0E0D] border-y border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="relative group">
                            {index !== 0 && (
                                <div className="hidden lg:block absolute left-[-24px] top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />
                            )}
                            <div className="text-center">
                                <div className="text-5xl md:text-6xl font-black text-vibrant-emerald mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                                    {stat.value}
                                </div>
                                <div className="text-white/40 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

