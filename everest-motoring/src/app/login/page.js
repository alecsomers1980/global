export const dynamic = "force-dynamic";

export const metadata = {
    title: "Login or Register | Everest Motoring Secure Portal",
    description: "Secure login portal and registration for Everest Motoring clients.",
};

export default async function LoginPage({ searchParams }) {
    const params = await searchParams;
    const error = params?.error;
    const message = params?.message;
    const isRegisteringClient = params?.register === 'client';
    const carId = params?.car_id || '';

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4 py-12">
            <div className={`w-full ${isRegisteringClient ? 'max-w-2xl' : 'max-w-md'} bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300`}>

                <div className={`p-6 text-center border-b border-white/10 ${isRegisteringClient ? 'bg-primary text-white' : 'bg-slate-950 text-white'}`}>
                    <img
                        src="/images/logo.png"
                        alt="Everest Motoring Logo"
                        className="h-10 w-auto mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold">{isRegisteringClient ? 'Client Portal Registration' : 'Secure Portal Login'}</h1>
                    {isRegisteringClient && (
                        <p className="text-white/80 mt-2">Track your vehicle financing securely in one place.</p>
                    )}
                </div>

                <div className="p-8 md:p-10">
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

                    {isRegisteringClient ? (
                        <>
                            <form className="space-y-6" action="/auth/register-client" method="POST">
                                <input type="hidden" name="carId" value={carId} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">First Name</label>
                                        <input type="text" name="firstName" required className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Last Name</label>
                                        <input type="text" name="lastName" required className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                                        <input type="email" name="email" required className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                                        <input type="tel" name="phone" required className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Account Security</h3>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Create Password</label>
                                        <input type="password" name="password" required minLength={8} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Minimum 8 characters" />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-md transition-all text-lg flex items-center justify-center gap-2">
                                        Create Account
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-sm text-slate-500">
                                    Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Sign In Instead</a>
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <form className="space-y-6" action="/auth/login" method="POST">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Email Address</label>
                                    <input type="email" name="email" required className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="you@example.com" />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                        <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot?</a>
                                    </div>
                                    <input type="password" name="password" required className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="••••••••" />
                                </div>

                                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-all">
                                    Sign In
                                </button>
                            </form>

                            <div className="mt-8 text-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="text-sm text-slate-500">
                                    New Client? <a href="/login?register=client" className="text-primary font-bold hover:underline">Apply Here</a>
                                </p>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
