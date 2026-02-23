"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function ContactForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [practiceArea, setPracticeArea] = useState("General Inquiry");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [statusMsg, setStatusMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, practiceArea, message }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus("error");
                setStatusMsg(data.error || "Something went wrong. Please try again.");
            } else {
                setStatus("success");
                setStatusMsg("Your message has been sent successfully. We'll be in touch shortly.");
                setFirstName("");
                setLastName("");
                setEmail("");
                setPracticeArea("General Inquiry");
                setMessage("");
            }
        } catch {
            setStatus("error");
            setStatusMsg("Network error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-serif font-bold text-brand-navy mb-6">Send Us a Message</h2>

            {status === "success" && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {statusMsg}
                </div>
            )}
            {status === "error" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {statusMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Practice Area</label>
                    <select
                        value={practiceArea}
                        onChange={(e) => setPracticeArea(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none bg-white"
                    >
                        <option>General Inquiry</option>
                        <option>Civil Litigation</option>
                        <option>Family Law</option>
                        <option>Commercial Law</option>
                        <option>Property Law</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Message</label>
                    <textarea
                        rows={4}
                        required
                        minLength={10}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-brand-gold text-brand-navy font-semibold rounded-md hover:bg-brand-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Send Message"
                    )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                    All communications are treated with strict confidentiality.
                </p>
            </form>
        </div>
    );
}
