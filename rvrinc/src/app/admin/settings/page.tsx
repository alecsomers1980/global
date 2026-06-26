"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Lock } from "lucide-react";

export default function AccountSettingsPage() {
    const supabase = createClient();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Personal details
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");
    const [savingDetails, setSavingDetails] = useState(false);

    // Password
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUserId(user.id);
            setEmail(user.email || "");
            setOriginalEmail(user.email || "");

            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", user.id)
                .single();

            if (profile) {
                setFullName(profile.full_name || "");
                if (!user.email && profile.email) {
                    setEmail(profile.email);
                    setOriginalEmail(profile.email);
                }
            }
            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        if (!fullName.trim()) {
            toast({ title: "Name required", description: "Please enter your full name.", variant: "destructive" });
            return;
        }
        if (!email.trim()) {
            toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
            return;
        }

        setSavingDetails(true);

        const emailChanged = email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

        // If the login email changed, ask Supabase to send a confirmation link.
        if (emailChanged) {
            const { error: authErr } = await supabase.auth.updateUser({ email: email.trim() });
            if (authErr) {
                toast({ title: "Could not update email", description: authErr.message, variant: "destructive" });
                setSavingDetails(false);
                return;
            }
        }

        const { error: profileErr } = await supabase
            .from("profiles")
            .update({ full_name: fullName.trim(), email: email.trim() })
            .eq("id", userId);

        if (profileErr) {
            toast({ title: "Update failed", description: profileErr.message, variant: "destructive" });
            setSavingDetails(false);
            return;
        }

        toast({
            title: "Details saved",
            description: emailChanged
                ? "We sent a confirmation link to your new email. Your login email changes once you click it."
                : "Your personal details have been updated.",
        });
        setSavingDetails(false);
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
            return;
        }
        if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword)) {
            toast({ title: "Weak password", description: "Password must contain a capital and a lowercase letter.", variant: "destructive" });
            return;
        }
        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords do not match", description: "Please re-enter your password.", variant: "destructive" });
            return;
        }

        setSavingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
            setSavingPassword(false);
            return;
        }

        toast({ title: "Password updated", description: "Your password has been changed." });
        setNewPassword("");
        setConfirmPassword("");
        setSavingPassword(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
                <p className="text-slate-500 mt-2">Update your personal details and password.</p>
            </div>

            {/* Personal details */}
            <form onSubmit={handleSaveDetails} className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-gold" /> Personal Details
                </h2>
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Jan van der Merwe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@rvrinc.co.za" />
                    <p className="text-xs text-gray-500">Changing your email sends a confirmation link to the new address.</p>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" variant="brand" disabled={savingDetails}>
                        {savingDetails ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Details
                    </Button>
                </div>
            </form>

            {/* Password */}
            <form onSubmit={handleSavePassword} className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-gold" /> Change Password
                </h2>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 chars, 1 capital, 1 lowercase" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" variant="brand" disabled={savingPassword}>
                        {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Update Password
                    </Button>
                </div>
            </form>
        </div>
    );
}
