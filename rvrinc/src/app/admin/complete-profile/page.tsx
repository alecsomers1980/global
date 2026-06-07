"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, UserCheck } from "lucide-react";

export default function CompleteProfilePage() {
    const [fullName, setFullName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Pre-fill email from current session
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user?.email) setEmail(data.user.email);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!fullName.trim() || !surname.trim()) {
            setError("Please enter your full name and surname.");
            setLoading(false);
            return;
        }
        if (!email.trim()) {
            setError("Please enter your email address.");
            setLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError("Password must contain at least one capital letter.");
            setLoading(false);
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            setError("Password must contain at least one lowercase letter.");
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        // Step 1: Update password
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) {
            setError(pwError.message);
            setLoading(false);
            return;
        }

        // Step 2: Get user (session is still valid after password update)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Session expired. Please log in again.");
            setLoading(false);
            return;
        }

        // Step 3: Update profile (don't change auth email — Supabase requires separate confirmation flow)
        const combinedName = `${fullName.trim()} ${surname.trim()}`;
        const { error: profileErr } = await supabase
            .from("profiles")
            .update({
                full_name: combinedName,
                email: email,
                profile_completed: true,
            })
            .eq("id", user.id);

        if (profileErr) {
            setError(profileErr.message);
            setLoading(false);
            return;
        }

        // Step 4: Show success and redirect
        setSuccess(true);
        setTimeout(() => {
            router.push("/admin");
            router.refresh();
        }, 1500);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h1 className="text-2xl font-serif font-bold text-brand-navy mb-2">Profile Complete</h1>
                    <p className="text-sm text-gray-500">Your account has been set up. Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <UserCheck className="mx-auto h-10 w-10 text-brand-gold mb-2" />
                    <h1 className="text-2xl font-serif font-bold text-brand-navy">Complete Your Profile</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Set up your account with a strong password before continuing.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                            placeholder="e.g. Jan"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Surname</label>
                        <input
                            type="text"
                            required
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                            placeholder="e.g. van der Merwe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                            placeholder="you@rvrinc.co.za"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                            placeholder="Min. 8 chars, 1 capital, 1 lowercase"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                            placeholder="Re-enter your password"
                        />
                    </div>
                    <Button type="submit" variant="brand" className="w-full" disabled={loading}>
                        {loading ? "Setting up..." : "Complete Setup"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
