import Link from "next/link";

export default function Header({ siteConfig }) {
    return (
        <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-slate-950/95 px-6 py-4 backdrop-blur-md transition-all lg:px-12 shadow-sm">
            <div className="flex items-center gap-2">
                {/* Dealership Logo */}
                <Link href="/" className="h-16 w-auto lg:h-20 overflow-hidden flex items-center justify-center">
                    <img
                        src={siteConfig?.logo || "/images/logo.png"}
                        alt={`${siteConfig?.name || 'Dealership'} Logo`}
                        className="h-full w-auto object-contain mix-blend-screen"
                    />
                </Link>
            </div>
            <nav className="hidden items-center gap-8 md:flex">
                <Link className="text-sm font-medium text-slate-300 transition-colors hover:text-white" href="/">Home</Link>
                <Link className="text-sm font-medium text-slate-300 transition-colors hover:text-white" href="/inventory">Buy a Car</Link>
                <Link className="text-sm font-medium text-slate-300 transition-colors hover:text-white" href="/value-my-car">Value My Car</Link>
                <Link className="text-sm font-medium text-slate-300 transition-colors hover:text-white" href="/about">About</Link>
            </nav>
            <div className="flex items-center gap-4">
                <Link href="/contact" className="hidden rounded-lg border-2 border-primary bg-transparent px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary border-transparent md:block bg-primary">
                    Book Consultation
                </Link>
                <button className="block md:hidden text-white">
                    <span className="material-symbols-outlined text-3xl">menu</span>
                </button>
            </div>
        </header>
    );
}
