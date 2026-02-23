export const metadata = {
    title: "Login | Everest Motoring Secure Portal",
    description: "Secure login portal for Everest Motoring affiliates and clients.",
};

export default function LoginPage({ searchParams }) {
    const error = searchParams?.error;
    const message = searchParams?.message;

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

                <div className="bg-slate-950 p-6 text-center">
                    <img
                        src="/images/logo.png"
                        alt="Everest Motoring Logo"
                        className="h-10 w-auto mx-auto mb-4"
                    />
                    <h1 className="text-xl font-bold text-white">Secure Portal Login</h1>
                </div>

                <div className="p-8">
                    {/* Feedback Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
                            <span className="material-symbols-outlined shrink-0">error</span>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
                            <span className="material-symbols-outlined shrink-0">check_circle</span>
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    <form className="space-y-6" action="/auth/login" method="POST">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot?</a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-md transition-all">
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            New Affiliate? <a href="/register" className="text-primary font-bold hover:underline">Apply Here</a>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
