"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    office?: string;
}

export function ContactModal({ isOpen, onClose, office }: ContactModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [inquiryType, setInquiryType] = useState("RAF Claim Inquiry");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [statusMsg, setStatusMsg] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    practiceArea: inquiryType,
                    message: `[Office: ${office || "General"}]\n${message}`,
                }),
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
                setPhone("");
                setInquiryType("RAF Claim Inquiry");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="sticky top-0 bg-brand-navy text-white p-6 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-serif font-bold">Send a Message</h2>
                        {office && <p className="text-brand-gold text-sm mt-0.5">{office}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6">
                    {status === "success" && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {statusMsg}
                        </div>
                    )}
                    {status === "error" && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {statusMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Last Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 082 000 0000"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Inquiry Type</label>
                            <select
                                value={inquiryType}
                                onChange={(e) => setInquiryType(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none bg-white"
                            >
                                <option>RAF Claim Inquiry</option>
                                <option>Personal Injury Claim</option>
                                <option>Loss of Support Claim</option>
                                <option>General Litigation</option>
                                <option>General Inquiry</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Message *</label>
                            <textarea
                                rows={3}
                                required
                                minLength={10}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us briefly about your situation..."
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-brand-gold text-brand-navy font-semibold rounded-lg hover:bg-brand-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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

                        <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                            We handle your data with the highest level of confidentiality, in full compliance with POPIA.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
