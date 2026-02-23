"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Database, CheckCircle, AlertTriangle, Loader2, Copy } from "lucide-react";

const MIGRATION_SQL = `-- RAF Case Status Migration for RVR Inc

-- 1. Create status lookup table
create table if not exists public.case_statuses (
  id serial primary key,
  slug text unique not null,
  label text not null,
  phase text not null check (phase in ('intake', 'claim', 'litigation', 'court', 'raf_damages', 'settlement')),
  sort_order int not null,
  default_note text,
  requires_note boolean default false,
  requires_date boolean default false,
  requires_client_action boolean default false,
  client_message text not null
);

-- 2. Insert all 34 RAF statuses
insert into public.case_statuses (slug, label, phase, sort_order, default_note, requires_note, requires_date, requires_client_action, client_message) values
('consultation_complete', 'Consultation Complete', 'intake', 1, NULL, true, false, false, 'Your initial consultation has been completed. Our team is reviewing your case.'),
('requested_records', 'Requested Hospital Records & Accident Report', 'intake', 2, NULL, false, false, false, 'We have submitted requests for your hospital records and accident report.'),
('client_obtain_records', 'Client to Obtain Hospital Records', 'intake', 3, NULL, false, false, true, 'We need your help to obtain your hospital records.'),
('client_obtain_accident_report', 'Client to Obtain Accident Report', 'intake', 4, NULL, false, false, true, 'We need your help to obtain the accident report.'),
('client_obtain_records_and_report', 'Client to Obtain Hospital Records & Accident Report', 'intake', 5, NULL, false, false, true, 'We need your help to obtain both your hospital records and the accident report.'),
('client_sign_affidavit', 'Client to Sign Affidavit & Send Certified ID', 'intake', 6, NULL, false, false, true, 'Please sign the affidavit and send it back together with a certified copy of your ID.'),
('claim_lodged', 'Claim Lodged', 'claim', 7, 'We have diarized our file for 120 days for the RAF to assess the claim.', false, false, false, 'Your claim has been lodged with the RAF. We have set a 120-day follow-up period.'),
('claim_documents_returned', 'Claim Documents Returned', 'claim', 8, 'We will now bring an application, and will continue with your claim.', false, false, false, 'Your claim documents have been returned. We are preparing an application.'),
('drafting_summons', 'Drafting Summons (Advocate Review)', 'litigation', 9, NULL, false, false, false, 'We are drafting the Summons for advocate review.'),
('summons_issued_served', 'Summons Issued & Served', 'litigation', 10, NULL, false, false, false, 'The Summons has been issued and served on the RAF.'),
('matter_defended', 'Matter Defended', 'litigation', 11, 'We now have to mediate with RAF.', false, false, false, 'The RAF has entered a defence. We will proceed to mediation.'),
('proceeding_default', 'Proceeding on Default Basis', 'litigation', 12, NULL, false, false, false, 'We are proceeding on a default basis.'),
('waiting_application_date', 'Waiting for Application Date', 'litigation', 13, NULL, false, false, false, 'We are waiting for the court to provide a date.'),
('followed_up_court_date', 'Followed Up Court Date', 'litigation', 14, NULL, false, false, false, 'We have followed up with the court regarding the date.'),
('application_default_judgment', 'Application for Default Judgment', 'litigation', 15, NULL, false, false, false, 'We are bringing an application for Default Judgment.'),
('applied_default_judgment_date', 'Applied for Default Judgment Date', 'litigation', 16, NULL, false, false, false, 'We have applied for a Default Judgment date.'),
('default_judgment_merits', 'Default Judgment Date: Merits Only', 'court', 17, NULL, true, true, false, 'A court date has been set for Default Judgment on merits.'),
('default_judgment_quantum', 'Default Judgment Date: Quantum Only', 'court', 18, NULL, true, true, false, 'A court date has been set for Default Judgment on quantum.'),
('default_judgment_merits_quantum', 'Default Judgment Date: Merits & Quantum', 'court', 19, NULL, true, true, false, 'A court date has been set for Default Judgment on merits and quantum.'),
('client_send_documents', 'Client to Send Documents', 'court', 20, NULL, true, false, true, 'We require certain documents from you. Please submit them urgently.'),
('client_sign_discovery', 'Client to Sign Discovery Affidavit', 'court', 21, NULL, false, false, true, 'Please sign the Discovery Affidavit and return it to our offices.'),
('client_sign_damages', 'Client to Sign Damages Affidavit', 'court', 22, NULL, false, false, true, 'Please sign the Damages Affidavit and urgently return it to our offices.'),
('matter_heard', 'Matter Heard', 'court', 23, NULL, true, false, false, 'Your matter has been heard. Your attorney will contact you regarding the outcome.'),
('raf_undecided_general', 'RAF Undecided on General Damages', 'raf_damages', 24, 'We will now bring an application.', false, false, false, 'The RAF has not yet decided on General Damages. We are preparing an application.'),
('raf_rejected_general', 'RAF Rejected General Damages', 'raf_damages', 25, 'We will refer your matter to the HPCSA.', false, false, false, 'The RAF has rejected your General Damages claim. We are referring to the HPCSA.'),
('raf_accepted_general', 'RAF Accepted General Damages', 'raf_damages', 26, NULL, false, false, false, 'The RAF has accepted your General Damages claim.'),
('default_judgment_general_damages', 'Default Judgment Date: General Damages', 'court', 27, NULL, true, true, false, 'A court date has been set for Default Judgment on General Damages.'),
('awaiting_general_damages_date', 'Awaiting General Damages Date', 'raf_damages', 28, NULL, false, false, false, 'We are awaiting a court date for General Damages.'),
('applied_raf_undertaking', 'Applied to RAF for Undertaking', 'raf_damages', 29, NULL, false, false, false, 'We have applied to the RAF for an Undertaking.'),
('no_undertaking_received', 'No Undertaking from RAF', 'raf_damages', 30, 'We will bring an application.', false, false, false, 'No undertaking received from the RAF. We are preparing an application.'),
('waiting_undertaking_date', 'Waiting for Undertaking Date', 'raf_damages', 31, NULL, false, false, false, 'We are waiting for a date regarding your undertaking.'),
('client_provide_bank_letter', 'Client to Provide Bank Letter', 'settlement', 32, NULL, false, false, true, 'Please provide a bank confirmation letter for payment processing.'),
('client_attend_expert', 'Client to Attend Expert Appointments', 'settlement', 33, NULL, false, false, true, 'You need to attend expert appointments. We will contact you.'),
('demanded_interest_payment', 'Demanded Interest Payment from RAF', 'settlement', 34, NULL, false, false, false, 'We have demanded payment of interest on the capital amount.')
ON CONFLICT (slug) DO NOTHING;

-- 3. Create status history table
create table if not exists public.case_status_history (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade not null,
  old_status text,
  new_status text not null,
  notes text,
  scheduled_date date,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz default now()
);

-- 4. Add new columns to cases table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'status_notes') THEN
    ALTER TABLE public.cases ADD COLUMN status_notes text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'status_phase') THEN
    ALTER TABLE public.cases ADD COLUMN status_phase text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'scheduled_date') THEN
    ALTER TABLE public.cases ADD COLUMN scheduled_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'diary_date') THEN
    ALTER TABLE public.cases ADD COLUMN diary_date timestamptz;
  END IF;
END $$;

-- 5. Drop old CHECK constraint
DO $$ BEGIN
  ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 6. RLS for case_statuses
ALTER TABLE public.case_statuses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Allow public read on case_statuses') THEN
    CREATE POLICY "Allow public read on case_statuses" ON public.case_statuses FOR SELECT USING (true);
  END IF;
END $$;

-- 7. RLS for case_status_history
ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view status history for their cases') THEN
    CREATE POLICY "Users can view status history for their cases" ON public.case_status_history FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_status_history.case_id AND (cases.client_id = auth.uid() OR cases.attorney_id = auth.uid()))
    );
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Staff can insert status history') THEN
    CREATE POLICY "Staff can insert status history" ON public.case_status_history FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Staff can view all status history') THEN
    CREATE POLICY "Staff can view all status history" ON public.case_status_history FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff', 'attorney'))
    );
  END IF;
END $$;`;

export default function DatabaseSetupPage() {
    const [copied, setCopied] = useState(false);
    const [checkResults, setCheckResults] = useState<string[]>([]);
    const [checking, setChecking] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(MIGRATION_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleCheck = async () => {
        setChecking(true);
        try {
            const res = await fetch("/api/setup-raf", { method: "POST" });
            const data = await res.json();
            setCheckResults(data.results || [data.message || data.error]);
        } catch (e: any) {
            setCheckResults(["Error: " + e.message]);
        }
        setChecking(false);
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Database Setup</h1>
                <p className="text-slate-500 mt-2">Run the RAF Case Status migration to enable the full status workflow.</p>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-brand-gold" /> Migration Instructions
                </h2>

                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <span className="w-8 h-8 rounded-full bg-brand-gold text-slate-900 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                        <div>
                            <p className="font-semibold text-slate-800">Copy the migration SQL</p>
                            <p className="text-sm text-gray-500">Click the button below to copy the entire migration to your clipboard.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="w-8 h-8 rounded-full bg-brand-gold text-slate-900 flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                        <div>
                            <p className="font-semibold text-slate-800">Open Supabase SQL Editor</p>
                            <p className="text-sm text-gray-500">
                                Go to{" "}
                                <a
                                    href="https://supabase.com/dashboard/project/xyhvdljnjyonaiedfgyh/sql/new"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-gold underline font-medium"
                                >
                                    your Supabase SQL Editor →
                                </a>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="w-8 h-8 rounded-full bg-brand-gold text-slate-900 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                        <div>
                            <p className="font-semibold text-slate-800">Paste and Run</p>
                            <p className="text-sm text-gray-500">Paste the SQL in the editor and click &quot;Run&quot;. This creates the status tables and updates the cases table.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <span className="w-8 h-8 rounded-full bg-brand-gold text-slate-900 flex items-center justify-center font-bold text-sm flex-shrink-0">4</span>
                        <div>
                            <p className="font-semibold text-slate-800">Verify</p>
                            <p className="text-sm text-gray-500">Click &quot;Check Database&quot; below to confirm all tables were created.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="brand" onClick={handleCopy} className="gap-2">
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Migration SQL"}
                    </Button>
                    <Button variant="outline" onClick={handleCheck} disabled={checking} className="gap-2">
                        {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        {checking ? "Checking..." : "Check Database"}
                    </Button>
                </div>

                {checkResults.length > 0 && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2">
                        {checkResults.map((r, i) => (
                            <p key={i} className={`text-sm ${r.startsWith("✅") ? "text-green-700" : r.startsWith("⚠️") ? "text-amber-700" : "text-gray-700"}`}>
                                {r}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* SQL Preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Migration SQL Preview</h2>
                <pre className="bg-slate-900 text-green-400 p-6 rounded-lg text-xs overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed">
                    {MIGRATION_SQL}
                </pre>
            </div>
        </div>
    );
}
