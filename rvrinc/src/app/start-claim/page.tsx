"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
    User, Car, FileText, Stethoscope, CheckCircle2,
    ArrowRight, ArrowLeft, Loader2, AlertCircle, Shield, Upload
} from "lucide-react";
import Image from "next/image";

const STEPS = [
    { id: 1, title: "Personal Details", icon: User, desc: "Your information" },
    { id: 2, title: "Accident Details", icon: Car, desc: "What happened" },
    { id: 3, title: "Injuries & Medical", icon: Stethoscope, desc: "Your injuries" },
    { id: 4, title: "Documents & Evidence", icon: FileText, desc: "Supporting info" },
    { id: 5, title: "Review & Submit", icon: CheckCircle2, desc: "Confirm & send" },
];

interface FormData {
    // Step 1: Personal
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    altPhone: string;
    email: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    preferredOffice: string;
    // Step 2: Accident
    accidentDate: string;
    accidentTime: string;
    accidentLocation: string;
    accidentDescription: string;
    policeReportFiled: string;
    policeStation: string;
    caseNumber: string;
    vehicleRegistration: string;
    driverName: string;
    driverAtFault: string;
    passengerOrDriver: string;
    witnesses: string;
    // Step 3: Medical
    injuryDescription: string;
    hospitalized: string;
    hospitalName: string;
    treatingDoctor: string;
    ongoingTreatment: string;
    unableToWork: string;
    employerName: string;
    monthlyIncome: string;
    claimType: string;
    // Step 4: Documents
    hasID: boolean;
    hasPoliceReport: boolean;
    hasMedicalRecords: boolean;
    hasPayslips: boolean;
    hasPhotos: boolean;
    additionalNotes: string;
    // Consent
    consentGiven: boolean;
}

const initialFormData: FormData = {
    firstName: "", lastName: "", idNumber: "", dateOfBirth: "", gender: "",
    phone: "", altPhone: "", email: "", address: "", city: "", province: "", postalCode: "",
    preferredOffice: "Pretoria",
    accidentDate: "", accidentTime: "", accidentLocation: "", accidentDescription: "",
    policeReportFiled: "", policeStation: "", caseNumber: "", vehicleRegistration: "",
    driverName: "", driverAtFault: "", passengerOrDriver: "", witnesses: "",
    injuryDescription: "", hospitalized: "", hospitalName: "", treatingDoctor: "",
    ongoingTreatment: "", unableToWork: "", employerName: "", monthlyIncome: "", claimType: "Personal Claim",
    hasID: false, hasPoliceReport: false, hasMedicalRecords: false, hasPayslips: false, hasPhotos: false,
    additionalNotes: "",
    consentGiven: false,
};

export default function StartClaimPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const update = (field: keyof FormData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, 5));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    practiceArea: `New RAF Claim - ${form.claimType}`,
                    message: formatSubmission(form),
                }),
            });
            if (!res.ok) throw new Error("Failed to submit");
            setSubmitted(true);
        } catch {
            setError("Something went wrong. Please try again or call us directly.");
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center py-20">
                    <div className="container max-w-lg text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-brand-navy">Claim Submitted Successfully!</h1>
                        <p className="text-gray-600 leading-relaxed">
                            Thank you, {form.firstName}. Your information has been securely submitted to our team at Roets & Van Rensburg.
                        </p>
                        <div className="bg-brand-cream rounded-xl p-6 border border-gray-100 text-left space-y-3">
                            <p className="font-semibold text-brand-navy">What happens next?</p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start gap-2"><span className="text-brand-gold font-bold">1.</span> A member of our team will review your submission within 24 hours.</li>
                                <li className="flex items-start gap-2"><span className="text-brand-gold font-bold">2.</span> We will contact you at {form.phone || form.email} to schedule a consultation.</li>
                                <li className="flex items-start gap-2"><span className="text-brand-gold font-bold">3.</span> Please prepare your certified ID copy, police report, and any medical records for your first appointment.</li>
                            </ul>
                        </div>
                        <p className="text-xs text-gray-400">
                            Reference: {form.preferredOffice === "Pretoria" ? "PTA" : "MH"}-{Date.now().toString(36).toUpperCase()}
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                {/* Hero */}
                <section className="bg-brand-navy py-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image src="/images/header3.jpg" alt="Law Office" fill className="object-cover object-right opacity-15" priority />
                        <div className="absolute inset-0 bg-brand-navy/80" />
                    </div>
                    <div className="container relative z-10">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Start Your RAF Claim</h1>
                        <p className="text-gray-300 max-w-xl mx-auto">
                            Complete this form so we can assess your case and get started. It takes about 5 minutes.
                        </p>
                    </div>
                </section>

                {/* Stepper */}
                <section className="py-8 bg-brand-cream border-b border-gray-200">
                    <div className="container max-w-4xl">
                        <div className="flex items-center justify-between">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const isActive = step === s.id;
                                const isDone = step > s.id;
                                return (
                                    <div key={s.id} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center text-center flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-brand-gold text-brand-navy' : 'bg-gray-200 text-gray-400'}`}>
                                                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                            </div>
                                            <span className={`text-[10px] mt-1.5 font-medium hidden sm:block ${isActive ? 'text-brand-navy' : 'text-gray-400'}`}>
                                                {s.title}
                                            </span>
                                        </div>
                                        {i < STEPS.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Form Body */}
                <section className="py-12">
                    <div className="container max-w-3xl">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        {/* Step 1: Personal Details */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Personal Details</h2>
                                <p className="text-gray-500 text-sm">We need your details to assess your eligibility and contact you.</p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="First Name *" value={form.firstName} onChange={(v) => update("firstName", v)} required />
                                    <Input label="Last Name *" value={form.lastName} onChange={(v) => update("lastName", v)} required />
                                    <Input label="SA ID Number *" value={form.idNumber} onChange={(v) => update("idNumber", v)} placeholder="e.g. 9001015009088" required />
                                    <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} />
                                    <Select label="Gender" value={form.gender} onChange={(v) => update("gender", v)} options={["", "Male", "Female", "Other"]} />
                                    <Input label="Phone Number *" type="tel" value={form.phone} onChange={(v) => update("phone", v)} placeholder="e.g. 082 000 0000" required />
                                    <Input label="Alternative Phone" type="tel" value={form.altPhone} onChange={(v) => update("altPhone", v)} />
                                    <Input label="Email Address" type="email" value={form.email} onChange={(v) => update("email", v)} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Street Address" value={form.address} onChange={(v) => update("address", v)} className="sm:col-span-2" />
                                    <Input label="City / Town" value={form.city} onChange={(v) => update("city", v)} />
                                    <Select label="Province" value={form.province} onChange={(v) => update("province", v)}
                                        options={["", "Gauteng", "Limpopo", "Mpumalanga", "North West", "Free State", "KwaZulu-Natal", "Eastern Cape", "Western Cape", "Northern Cape"]} />
                                </div>
                                <Select label="Preferred Office" value={form.preferredOffice} onChange={(v) => update("preferredOffice", v)}
                                    options={["Pretoria", "Marble Hall"]} />
                            </div>
                        )}

                        {/* Step 2: Accident Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Accident Details</h2>
                                <p className="text-gray-500 text-sm">Tell us about the accident. This helps us understand the claim.</p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Input label="Date of Accident *" type="date" value={form.accidentDate} onChange={(v) => update("accidentDate", v)} required />
                                    <Input label="Time of Accident" type="time" value={form.accidentTime} onChange={(v) => update("accidentTime", v)} />
                                    <Input label="Location / Road Name *" value={form.accidentLocation} onChange={(v) => update("accidentLocation", v)} className="sm:col-span-2" placeholder="e.g. N1 near Polokwane" required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Description of what happened *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={form.accidentDescription}
                                        onChange={(e) => update("accidentDescription", e.target.value)}
                                        placeholder="Describe the accident in your own words — what happened, how it happened, and who was involved."
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none resize-none"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Select label="Were you the driver or passenger?" value={form.passengerOrDriver} onChange={(v) => update("passengerOrDriver", v)}
                                        options={["", "Driver", "Passenger", "Pedestrian", "Cyclist"]} />
                                    <Select label="Was someone else at fault?" value={form.driverAtFault} onChange={(v) => update("driverAtFault", v)}
                                        options={["", "Yes", "No", "Uncertain"]} />
                                    <Input label="Other driver's name (if known)" value={form.driverName} onChange={(v) => update("driverName", v)} />
                                    <Input label="Other vehicle registration (if known)" value={form.vehicleRegistration} onChange={(v) => update("vehicleRegistration", v)} />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Select label="Was a police report filed?" value={form.policeReportFiled} onChange={(v) => update("policeReportFiled", v)}
                                        options={["", "Yes", "No", "Not sure"]} />
                                    <Input label="Police Station" value={form.policeStation} onChange={(v) => update("policeStation", v)} />
                                    <Input label="SAPS Case Number" value={form.caseNumber} onChange={(v) => update("caseNumber", v)} placeholder="e.g. CAS 123/2026" />
                                    <Input label="Any witnesses? (names/numbers)" value={form.witnesses} onChange={(v) => update("witnesses", v)} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Injuries & Medical */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Injuries & Medical</h2>
                                <p className="text-gray-500 text-sm">Describe your injuries and medical treatment. This is critical for your claim value.</p>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Describe your injuries *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={form.injuryDescription}
                                        onChange={(e) => update("injuryDescription", e.target.value)}
                                        placeholder="List all injuries sustained — e.g. broken leg, whiplash, head injury, scarring..."
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none resize-none"
                                    />
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Select label="Were you hospitalized?" value={form.hospitalized} onChange={(v) => update("hospitalized", v)}
                                        options={["", "Yes", "No"]} />
                                    <Input label="Hospital / Clinic Name" value={form.hospitalName} onChange={(v) => update("hospitalName", v)} />
                                    <Input label="Treating Doctor's Name" value={form.treatingDoctor} onChange={(v) => update("treatingDoctor", v)} />
                                    <Select label="Are you still receiving treatment?" value={form.ongoingTreatment} onChange={(v) => update("ongoingTreatment", v)}
                                        options={["", "Yes", "No"]} />
                                </div>
                                <h3 className="text-lg font-semibold text-brand-navy pt-4">Employment & Loss of Income</h3>
                                <p className="text-gray-500 text-sm">If your injuries affected your ability to work, we can claim for loss of income.</p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Select label="Unable to work due to injuries?" value={form.unableToWork} onChange={(v) => update("unableToWork", v)}
                                        options={["", "Yes, still unable", "Yes, but returned to work", "No"]} />
                                    <Input label="Employer Name" value={form.employerName} onChange={(v) => update("employerName", v)} />
                                    <Input label="Approximate Monthly Income (R)" value={form.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} placeholder="e.g. 15000" />
                                    <Select label="Claim Type" value={form.claimType} onChange={(v) => update("claimType", v)}
                                        options={["Personal Claim", "Loss of Support Claim", "Under Settlement", "Direct Claim"]} />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Documents & Evidence */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Documents & Evidence</h2>
                                <p className="text-gray-500 text-sm">
                                    These documents will be needed to process your claim. Tick what you already have — don&apos;t worry if you don&apos;t have everything yet, we can help you obtain them.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { key: "hasID" as keyof FormData, label: "Certified copy of your SA ID or Passport" },
                                        { key: "hasPoliceReport" as keyof FormData, label: "Police / SAPS Accident Report" },
                                        { key: "hasMedicalRecords" as keyof FormData, label: "Hospital records / medical reports" },
                                        { key: "hasPayslips" as keyof FormData, label: "Payslips or proof of income (if claiming loss of earnings)" },
                                        { key: "hasPhotos" as keyof FormData, label: "Photos of the accident scene or vehicles" },
                                    ].map((doc) => (
                                        <label key={doc.key} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-brand-gold/50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={form[doc.key] as boolean}
                                                onChange={(e) => update(doc.key, e.target.checked)}
                                                className="w-5 h-5 rounded text-brand-gold focus:ring-brand-gold border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{doc.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                    <p className="font-semibold mb-1">💡 Don&apos;t have all documents?</p>
                                    <p>No problem. RVR Inc can help you obtain hospital records, the SAPS accident report, and other necessary documents. Just indicate what you have so we know where to start.</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Any additional notes or information</label>
                                    <textarea
                                        rows={3}
                                        value={form.additionalNotes}
                                        onChange={(e) => update("additionalNotes", e.target.value)}
                                        placeholder="Anything else you'd like us to know about your case..."
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 5: Review & Submit */}
                        {step === 5 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Review & Submit</h2>
                                <p className="text-gray-500 text-sm">Please review your information before submitting.</p>

                                <ReviewSection title="Personal Details" items={[
                                    ["Name", `${form.firstName} ${form.lastName}`],
                                    ["ID Number", form.idNumber],
                                    ["Phone", form.phone],
                                    ["Email", form.email || "Not provided"],
                                    ["Address", `${form.address}, ${form.city}, ${form.province}`],
                                    ["Preferred Office", form.preferredOffice],
                                ]} />

                                <ReviewSection title="Accident Details" items={[
                                    ["Date", form.accidentDate],
                                    ["Location", form.accidentLocation],
                                    ["Role", form.passengerOrDriver || "Not specified"],
                                    ["Fault", form.driverAtFault || "Not specified"],
                                    ["Police Report", form.policeReportFiled || "Not specified"],
                                    ["SAPS Case No.", form.caseNumber || "Not provided"],
                                ]} />

                                <ReviewSection title="Injuries & Medical" items={[
                                    ["Injuries", form.injuryDescription],
                                    ["Hospitalized", form.hospitalized || "Not specified"],
                                    ["Hospital", form.hospitalName || "Not provided"],
                                    ["Unable to work", form.unableToWork || "Not specified"],
                                    ["Claim Type", form.claimType],
                                ]} />

                                <div className="bg-brand-cream rounded-xl p-4 border border-gray-100">
                                    <h3 className="font-semibold text-brand-navy text-sm mb-2">Documents Available</h3>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {form.hasID && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ Certified ID</span>}
                                        {form.hasPoliceReport && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ Police Report</span>}
                                        {form.hasMedicalRecords && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ Medical Records</span>}
                                        {form.hasPayslips && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ Payslips</span>}
                                        {form.hasPhotos && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✓ Photos</span>}
                                        {!form.hasID && !form.hasPoliceReport && !form.hasMedicalRecords && !form.hasPayslips && !form.hasPhotos && (
                                            <span className="text-gray-400">None selected — we can help obtain them</span>
                                        )}
                                    </div>
                                </div>

                                {/* Consent */}
                                <label className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.consentGiven}
                                        onChange={(e) => update("consentGiven", e.target.checked)}
                                        className="w-5 h-5 rounded text-brand-gold focus:ring-brand-gold border-gray-300 mt-0.5"
                                    />
                                    <span className="text-sm text-gray-700">
                                        I confirm that the information provided is accurate to the best of my knowledge. I consent to Roets & Van Rensburg Inc processing my personal information in accordance with POPIA for the purpose of assessing and handling my RAF claim.
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
                            {step > 1 ? (
                                <button onClick={prevStep} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-navy transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                            ) : <div />}

                            {step < 5 ? (
                                <button onClick={nextStep} className="flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-navy rounded-xl font-semibold text-sm hover:bg-brand-gold/90 transition-colors">
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!form.consentGiven || submitting}
                                    className="flex items-center gap-2 px-8 py-3 bg-brand-navy text-white rounded-xl font-semibold text-sm hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Claim <CheckCircle2 className="w-4 h-4" /></>}
                                </button>
                            )}
                        </div>

                        {/* POPIA Footer */}
                        <div className="flex items-center gap-2 justify-center pt-6 text-xs text-gray-400">
                            <Shield className="w-3 h-3" />
                            <span>Your information is encrypted and handled in compliance with POPIA.</span>
                        </div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}

// Helper Components
function Input({ label, value, onChange, type = "text", placeholder, required, className }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean; className?: string;
}) {
    return (
        <div className={className}>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none"
            />
        </div>
    );
}

function Select({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold outline-none bg-white"
            >
                {options.map((o) => <option key={o} value={o}>{o || "— Select —"}</option>)}
            </select>
        </div>
    );
}

function ReviewSection({ title, items }: { title: string; items: [string, string][] }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h3 className="font-semibold text-brand-navy text-sm mb-3">{title}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {items.map(([k, v]) => (
                    <div key={k} className="contents">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-gray-800 font-medium truncate">{v || "—"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatSubmission(form: FormData): string {
    return `
--- NEW RAF CLAIM SUBMISSION ---
Preferred Office: ${form.preferredOffice}
Claim Type: ${form.claimType}

=== PERSONAL DETAILS ===
Name: ${form.firstName} ${form.lastName}
ID Number: ${form.idNumber}
DOB: ${form.dateOfBirth}
Gender: ${form.gender}
Phone: ${form.phone}
Alt Phone: ${form.altPhone}
Email: ${form.email}
Address: ${form.address}, ${form.city}, ${form.province} ${form.postalCode}

=== ACCIDENT DETAILS ===
Date: ${form.accidentDate}
Time: ${form.accidentTime}
Location: ${form.accidentLocation}
Description: ${form.accidentDescription}
Role: ${form.passengerOrDriver}
At Fault: ${form.driverAtFault}
Other Driver: ${form.driverName}
Other Vehicle: ${form.vehicleRegistration}
Police Report: ${form.policeReportFiled}
Police Station: ${form.policeStation}
SAPS Case No: ${form.caseNumber}
Witnesses: ${form.witnesses}

=== INJURIES & MEDICAL ===
Injuries: ${form.injuryDescription}
Hospitalized: ${form.hospitalized}
Hospital: ${form.hospitalName}
Doctor: ${form.treatingDoctor}
Ongoing Treatment: ${form.ongoingTreatment}
Unable to Work: ${form.unableToWork}
Employer: ${form.employerName}
Monthly Income: R${form.monthlyIncome}

=== DOCUMENTS AVAILABLE ===
Certified ID: ${form.hasID ? "Yes" : "No"}
Police Report: ${form.hasPoliceReport ? "Yes" : "No"}
Medical Records: ${form.hasMedicalRecords ? "Yes" : "No"}
Payslips: ${form.hasPayslips ? "Yes" : "No"}
Photos: ${form.hasPhotos ? "Yes" : "No"}

Additional Notes: ${form.additionalNotes}
--- END SUBMISSION ---`.trim();
}
