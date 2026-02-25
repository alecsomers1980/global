"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

export default function NewsletterForm({ variant = "footer" }) {
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [message, setMessage] = useState("");
    const isHome = variant === "home";

    async function onSubmit(e) {
        e.preventDefault();
        setStatus("loading");
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");

        if (!email) {
            setStatus("error");
            setMessage("Please enter a valid email.");
            return;
        }

        const result = await subscribeToNewsletter(email);

        if (result.success) {
            setStatus("success");
            setMessage("Subscribed successfully!");
        } else {
            setStatus("error");
            setMessage(result.error || "Failed to subscribe.");
        }
    }

    return (
        <form onSubmit={onSubmit} className={isHome ? "mx-auto flex w-full max-w-md flex-col gap-3" : "flex flex-col gap-2"}>
            <div className={isHome ? "flex flex-col sm:flex-row gap-3" : "flex"}>
                <input
                    type="email"
                    name="email"
                    required
                    placeholder={isHome ? "Enter your email address" : "Email address"}
                    className={
                        isHome
                            ? "flex-1 rounded-lg border-0 bg-white px-5 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                            : "w-full bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm disabled:opacity-50"
                    }
                    disabled={status === "loading" || status === "success"}
                />
                <button
                    type="submit"
                    disabled={status === "loading" || status === "success"}
                    className={
                        isHome
                            ? "rounded-lg bg-slate-900 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
                            : "bg-primary hover:bg-primary-light transition-colors rounded-r-lg px-4 flex items-center justify-center disabled:opacity-50"
                    }
                >
                    {status === "loading" ? (
                        <span className="material-symbols-outlined text-white text-[20px] animate-spin">autorenew</span>
                    ) : status === "success" ? (
                        <span className="material-symbols-outlined text-white text-[20px]">check</span>
                    ) : (
                        isHome ? "Subscribe" : <span className="material-symbols-outlined text-white text-[20px]">arrow_forward</span>
                    )}
                </button>
            </div>
            {message && (
                <p className={`text-sm ${status === "success" ? "text-emerald-400" : "text-rose-400"} ${isHome ? "text-center" : "text-xs"}`}>
                    {message}
                </p>
            )}
        </form>
    );
}
