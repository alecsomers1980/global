"use client";

import { useState } from "react";
import { submitValueMyCar } from "./actions";

export default function ValueMyCarForm() {
    const [status, setStatus] = useState("idle");

    async function handleAction(formData) {
        setStatus("submitting");
        const result = await submitValueMyCar(formData);

        if (result?.error) {
            setStatus("error");
            alert("Failed to submit inquiry. Please try again or call us directly.");
        } else {
            setStatus("success");
        }
    }

    if (status === "success") {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-12 text-center my-8">
                <span className="material-symbols-outlined text-green-500 text-6xl mb-4">task_alt</span>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received!</h2>
                <p className="text-slate-600 text-lg max-w-lg mx-auto mb-8">
                    Thank you for submitting your vehicle details. Our procurement team will review your information and contact you shortly with an indicative offer.
                </p>
                <button
                    onClick={() => setStatus("idle")}
                    className="text-primary font-bold hover:text-primary-dark transition-colors"
                >
                    Submit another vehicle
                </button>
            </div>
        );
    }

    return (
        <form action={handleAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Registration Number</label>
                    <input type="text" name="registration_number" placeholder="e.g. ABC 123 MP" required disabled={status === "submitting"} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Current Mileage</label>
                    <input type="text" name="mileage" placeholder="e.g. 45,000 km" required disabled={status === "submitting"} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Make & Model</label>
                    <input type="text" name="make_model" placeholder="e.g. Toyota Fortuner 2.8 GD-6" required disabled={status === "submitting"} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Year</label>
                    <select name="year" required disabled={status === "submitting"} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white disabled:opacity-50">
                        <option value="">Select Year</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                        <option value="Older">Older</option>
                    </select>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100 mt-12 pt-8">Contact Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name</label>
                    <input type="text" name="client_name" placeholder="John Doe" required disabled={status === "submitting"} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                    <input type="tel" name="client_phone" placeholder="082 123 4567" required disabled={status === "submitting"} className="w-full px-5 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50" />
                </div>
            </div>

            <div className="pt-8">
                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white font-bold py-4 px-8 rounded-lg shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2"
                >
                    {status === "submitting" ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            Processing...
                        </>
                    ) : (
                        'Request Free Valuation'
                    )}
                </button>
            </div>
        </form>
    );
}
