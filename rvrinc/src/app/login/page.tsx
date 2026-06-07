"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AlertCircle, X } from "lucide-react";
import { resolveEmail } from "./actions";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Resolve username to email (handles both email and name input)
            const result = await resolveEmail(username.trim());
            if (result.error) {
                setError(result.error);
                setLoading(false);
                return;
            }

            const { error } = await supabase.auth.signInWithPassword({
                email: result.email!,
                password,
            });
            if (error) throw error;

            if (rememberMe) {
                localStorage.setItem("rvr_remember_me", "true");
            } else {
                localStorage.removeItem("rvr_remember_me");
            }
            router.push("/admin");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden relative">
                <Link
                    href="/"
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close and return to website"
                >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </Link>
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-serif font-bold text-brand-navy">Staff Login</h1>
                        <p className="text-sm text-gray-500 mt-2">Authorized personnel only.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email or Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="you@rvrinc.co.za or Jan van der Merwe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="flex items-center gap-2 my-3">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-600">Remember me</label>
                        </div>
                        <Button type="submit" variant="brand" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-brand-navy underline">
                            Forgot your password?
                        </Link>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                    Secured by Roets & Van Rensburg Security Protocols
                </div>
            </div>
        </div>
    );
}
