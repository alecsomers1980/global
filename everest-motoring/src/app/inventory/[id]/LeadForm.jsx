"use client";

import { useState } from "react";
import { submitLead } from "./actions";

export default function LeadForm({ carId }) {
    const [status, setStatus] = useState("idle"); // idle, submitting, success, error

    async function handleAction(formData) {
        setStatus("submitting");
        const result = await submitLead(formData);

        if (result?.error) {
            setStatus("error");
            alert("Failed to submit inquiry. Please try again or call us directly.");
        } else {
            setStatus("success");
            // Optionally, reset the form here
        }
    }

    if (status === "success") {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-green-500 text-4xl mb-2">check_circle</span>
                <h4 className="text-green-500 font-bold mb-2">Inquiry Sent!</h4>
                <p className="text-green-400 text-sm">One of our sales executives will be in touch with you shortly.</p>
                <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Send another message
                </button>
            </div>
        );
    }

    return (
        <form action={handleAction} className="space-y-4">
            <input type="hidden" name="car_id" value={carId} />

            <div>
                <input
                    type="text"
                    name="client_name"
                    placeholder="Full Name"
                    required
                    disabled={status === "submitting"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
            </div>
            <div>
                <input
                    type="tel"
                    name="client_phone"
                    placeholder="Phone Number"
                    required
                    disabled={status === "submitting"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
            </div>
            <div>
                <input
                    type="email"
                    name="client_email"
                    placeholder="Email Address"
                    disabled={status === "submitting"}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
            </div>

            <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-600 text-white font-bold py-4 rounded-lg mt-4 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
                {status === "submitting" ? (
                    <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        Sending...
                    </>
                ) : (
                    'Request Callback'
                )}
            </button>
        </form>
    );
}
