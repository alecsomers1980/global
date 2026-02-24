export default function PageBanner({ title, subtitle, bgImageUrl, overlayOpacity = "opacity-40" }) {
    return (
        <section className="bg-slate-900 py-24 px-4 text-center lg:px-12 relative overflow-hidden flex items-center justify-center min-h-[300px]">
            {bgImageUrl && (
                <div
                    className={`absolute inset-0 bg-cover bg-center ${overlayOpacity}`}
                    style={{ backgroundImage: `url('${bgImageUrl}')` }}
                ></div>
            )}
            {!bgImageUrl && (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 z-0"></div>
            )}

            <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-lg text-slate-300 md:text-xl font-medium">{subtitle}</p>
                )}
            </div>
        </section>
    );
}
