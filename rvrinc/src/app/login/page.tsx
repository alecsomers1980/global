"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
    const searchParams = useSearchParams();
    const [isSignUp, setIsSignUp] = useState(false);
    const redirectTo = searchParams.get("redirect") || "/portal";
    const isAdminLogin = redirectTo.startsWith("/admin");

    useEffect(() => {
        if (searchParams.get("mode") === "signup") {
            setIsSignUp(true);
        }
    }, [searchParams]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            role: 'client' // Default role
                        }
                    }
                });
                if (error) throw error;
                setSuccessMsg("Account created! Please check your email to confirm.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden relative">
                {/* Close button */}
                <Link
                    href="/"
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close and return to website"
                >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </Link>
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-serif font-bold text-brand-navy">
                            {isSignUp ? "Create Account" : isAdminLogin ? "Admin Login" : "Client Portal Login"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-2">
                            {isSignUp
                                ? "Join RVR Inc. for secure legal management."
                                : isAdminLogin ? "Authorized personnel only." : "Secure access to your case files and updates."}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {successMsg}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                placeholder="you@example.com"
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
                        <Button
                            type="submit"
                            variant="brand"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading
                                ? (isSignUp ? "Creating Account..." : "Signing in...")
                                : (isSignUp ? "Create Account" : "Sign In")}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <div className="text-sm text-gray-600">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                    setSuccessMsg(null);
                                }}
                                className="text-brand-gold font-medium hover:underline focus:outline-none"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </div>

                        {!isSignUp && (
                            <div className="text-xs">
                                <Link href="/forgot-password" className="text-gray-400 hover:text-brand-navy underline">
                                    Forgot your password?
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t">
                    Secured by Roets & Van Rensburg Security Protocols
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
