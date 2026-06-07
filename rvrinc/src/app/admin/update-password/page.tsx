"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

export default function UpdatePasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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

        const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
        if (updateErr) {
            setError(updateErr.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            router.push("/admin");
            router.refresh();
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated</h2>
                    <p className="text-gray-600">Redirecting you to the dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <Lock className="mx-auto h-10 w-10 text-brand-gold mb-2" />
                    <h1 className="text-2xl font-serif font-bold text-brand-navy">Set New Password</h1>
                    <p className="text-sm text-gray-500 mt-2">Choose a strong password for your account.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                            placeholder="Min. 8 chars, capital & lowercase"
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
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
