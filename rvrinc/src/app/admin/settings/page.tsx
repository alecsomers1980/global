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
  phase text not null check (phase in ('intake', 'claim', 'litigation', 'prep_court', 'court', 'general_damages', 'payment', 'costs', 'undertaking', 'finalization')),
  sort_order int not null,
  default_note text,
  requires_note boolean default false,
  requires_date boolean default false,
  requires_client_action boolean default false,
  client_message text not null
);

-- 1b. Drop phase constraint so legacy rows can be remapped/cleared (re-added after DELETE)
ALTER TABLE public.case_statuses DROP CONSTRAINT IF EXISTS case_statuses_phase_check;

-- 1c. Remap legacy status slugs on existing cases & history to the new taxonomy
WITH slug_map(old_slug, new_slug) AS (VALUES
  ('claim_documents_returned', 'raf_objection_expired'),
  ('waiting_application_date', 'applied_court_date'),
  ('application_default_judgment', 'apply_default_judgment_roll'),
  ('applied_default_judgment_date', 'applied_court_date'),
  ('client_send_documents', 'client_provide_documents'),
  ('default_judgment_general_damages', 'apply_new_court_date'),
  ('awaiting_general_damages_date', 'follow_up_court_date_general'),
  ('applied_raf_undertaking', 'sent_undertaking_request'),
  ('no_undertaking_received', 'followed_up_undertaking'),
  ('waiting_undertaking_date', 'followed_up_undertaking'),
  ('client_provide_bank_letter', 'request_bank_letter'),
  ('client_attend_expert', 'client_attend_medico_legal'),
  ('demanded_interest_payment', 'send_interest_letter')
)
UPDATE public.cases c SET status = m.new_slug FROM slug_map m WHERE c.status = m.old_slug;

WITH slug_map(old_slug, new_slug) AS (VALUES
  ('claim_documents_returned', 'raf_objection_expired'),
  ('waiting_application_date', 'applied_court_date'),
  ('application_default_judgment', 'apply_default_judgment_roll'),
  ('applied_default_judgment_date', 'applied_court_date'),
  ('client_send_documents', 'client_provide_documents'),
  ('default_judgment_general_damages', 'apply_new_court_date'),
  ('awaiting_general_damages_date', 'follow_up_court_date_general'),
  ('applied_raf_undertaking', 'sent_undertaking_request'),
  ('no_undertaking_received', 'followed_up_undertaking'),
  ('waiting_undertaking_date', 'followed_up_undertaking'),
  ('client_provide_bank_letter', 'request_bank_letter'),
  ('client_attend_expert', 'client_attend_medico_legal'),
  ('demanded_interest_payment', 'send_interest_letter')
)
UPDATE public.case_status_history h SET new_status = m.new_slug FROM slug_map m WHERE h.new_status = m.old_slug;

WITH slug_map(old_slug, new_slug) AS (VALUES
  ('claim_documents_returned', 'raf_objection_expired'),
  ('waiting_application_date', 'applied_court_date'),
  ('application_default_judgment', 'apply_default_judgment_roll'),
  ('applied_default_judgment_date', 'applied_court_date'),
  ('client_send_documents', 'client_provide_documents'),
  ('default_judgment_general_damages', 'apply_new_court_date'),
  ('awaiting_general_damages_date', 'follow_up_court_date_general'),
  ('applied_raf_undertaking', 'sent_undertaking_request'),
  ('no_undertaking_received', 'followed_up_undertaking'),
  ('waiting_undertaking_date', 'followed_up_undertaking'),
  ('client_provide_bank_letter', 'request_bank_letter'),
  ('client_attend_expert', 'client_attend_medico_legal'),
  ('demanded_interest_payment', 'send_interest_letter')
)
UPDATE public.case_status_history h SET old_status = m.new_slug FROM slug_map m WHERE h.old_status = m.old_slug;

-- 2. Re-seed all 67 RAF statuses (re-add constraint on the now-empty table first)
DELETE FROM public.case_statuses;
ALTER TABLE public.case_statuses ADD CONSTRAINT case_statuses_phase_check
  CHECK (phase in ('intake', 'claim', 'litigation', 'prep_court', 'court', 'general_damages', 'payment', 'costs', 'undertaking', 'finalization'));
insert into public.case_statuses (slug, label, phase, sort_order, default_note, requires_note, requires_date, requires_client_action, client_message) values
('consultation_complete', 'Consultation complete', 'intake', 1, NULL, false, false, false, 'Consultation complete'),
('consultation_letter_sent', 'Confirmation of consultation letter sent to client', 'intake', 2, NULL, false, false, false, 'Confirmation of consultation letter sent to client'),
('requested_records', 'Requested Hospital records & Accident report', 'intake', 3, NULL, false, false, false, 'Requested Hospital records & Accident report'),
('client_obtain_records', 'Client to assist in obtaining hospital records', 'intake', 4, NULL, false, false, true, 'Client to assist in obtaining hospital records'),
('client_obtain_accident_report', 'Client to assist in obtaining accident report', 'intake', 5, NULL, false, false, true, 'Client to assist in obtaining accident report'),
('client_obtain_records_and_report', 'Client to assist in obtaining hospital records & accident report', 'intake', 6, NULL, false, false, true, 'Client to assist in obtaining hospital records & accident report'),
('client_sign_affidavit', 'Client to sign affidavit & send certified copy of ID', 'intake', 7, NULL, false, false, true, 'Client to sign affidavit & send certified copy of ID'),
('claim_lodged', 'Claim lodged date', 'claim', 8, NULL, false, true, false, 'Claim lodged date'),
('raf_objection_expired', 'Time expired for RAF to object, Summons to be drafted', 'claim', 9, NULL, false, false, false, 'Time expired for RAF to object, Summons to be drafted'),
('drafting_summons', 'Drafting Summons', 'litigation', 10, NULL, false, false, false, 'Drafting Summons'),
('advocate_review_summons', 'Advocate review Summons', 'litigation', 11, NULL, false, false, false, 'Advocate review Summons'),
('summons_issued_served', 'Summons issued and served', 'litigation', 12, NULL, false, false, false, 'Summons issued and served'),
('matter_defended', 'Matter defended', 'litigation', 13, NULL, false, false, false, 'Matter defended'),
('mediation', 'Mediation', 'litigation', 14, NULL, false, false, false, 'Mediation'),
('application_compel_mediate', 'Application to compel to mediate', 'litigation', 15, NULL, false, false, false, 'Application to compel to mediate'),
('application_delinquent_mediator', 'Application for delinquent mediator', 'litigation', 16, NULL, false, false, false, 'Application for delinquent mediator'),
('apply_default_judgment_roll', 'Apply for date on default judgment roll after mediation was unsuccessful', 'litigation', 17, NULL, false, false, false, 'Apply for date on default judgment roll after mediation was unsuccessful'),
('notice_of_bar', 'Notice of bar', 'litigation', 18, NULL, false, false, false, 'Notice of bar'),
('plea', 'Plea', 'litigation', 19, NULL, false, false, false, 'Plea'),
('proceeding_default', 'Proceeding on default basis', 'litigation', 20, NULL, false, false, false, 'Proceeding on default basis'),
('applied_court_date', 'Applied for date from court', 'litigation', 21, NULL, false, false, false, 'Applied for date from court'),
('followed_up_court_date', 'Followed up on court date', 'litigation', 22, NULL, false, false, false, 'Followed up on court date'),
('default_judgment_merits', 'Obtain default judgment date – merits only', 'litigation', 23, NULL, false, true, false, 'Obtain default judgment date – merits only'),
('default_judgment_quantum', 'Obtain default judgment date – quantum only', 'litigation', 24, NULL, false, true, false, 'Obtain default judgment date – quantum only'),
('default_judgment_merits_quantum', 'Obtain default judgment date – merits & quantum', 'litigation', 25, NULL, false, true, false, 'Obtain default judgment date – merits & quantum'),
('client_provide_documents', 'Client to provide multiple documents in order to prove claim', 'prep_court', 26, NULL, false, false, true, 'Client to provide multiple documents in order to prove claim'),
('client_sign_discovery', 'Client to sign Discovery Affidavit', 'prep_court', 27, NULL, false, false, true, 'Client to sign Discovery Affidavit'),
('client_attend_medico_legal', 'Client to attend to medico-legal appointments', 'prep_court', 28, NULL, false, false, true, 'Client to attend to medico-legal appointments'),
('client_attend_inspection', 'Client to attend to inspection in loco', 'prep_court', 29, NULL, false, false, true, 'Client to attend to inspection in loco'),
('waiting_medico_legal_reports', 'Waiting for medico-legal reports from the experts', 'prep_court', 30, NULL, false, false, false, 'Waiting for medico-legal reports from the experts'),
('client_sign_damages', 'Client to sign damages affidavit', 'prep_court', 31, NULL, false, false, true, 'Client to sign damages affidavit'),
('matter_heard', 'Matter heard', 'court', 32, NULL, false, false, false, 'Matter heard'),
('obtained_outcome', 'Obtained outcome', 'court', 33, NULL, false, false, false, 'Obtained outcome'),
('follow_up_court_order', 'Follow up on court order', 'court', 34, NULL, false, false, false, 'Follow up on court order'),
('court_order_sent_raf', 'Court order sent to RAF for payment', 'court', 35, NULL, false, false, false, 'Court order sent to RAF for payment'),
('court_ordered_trust', 'Court ordered for a Trust to be established – all monies will go to the Trust', 'court', 36, NULL, false, false, false, 'Court ordered for a Trust to be established – all monies will go to the Trust'),
('raf_undecided_general', 'RAF undecided on General damages', 'general_damages', 37, NULL, false, false, false, 'RAF undecided on General damages'),
('apply_compel_raf_general', 'Apply for date to compel RAF to make a decision on the General Damages', 'general_damages', 38, NULL, false, false, false, 'Apply for date to compel RAF to make a decision on the General Damages'),
('raf_accepted_general', 'RAF accepted General damages', 'general_damages', 39, NULL, false, false, false, 'RAF accepted General damages'),
('apply_new_court_date', 'Apply to Court for a new court date', 'general_damages', 40, NULL, false, false, false, 'Apply to Court for a new court date'),
('settled_general_damages', 'Settled general damages with RAF', 'general_damages', 41, NULL, false, false, false, 'Settled general damages with RAF'),
('follow_up_court_date_general', 'Follow up on date for court', 'general_damages', 42, NULL, false, false, false, 'Follow up on date for court'),
('raf_rejected_general', 'RAF rejected General damages', 'general_damages', 43, NULL, false, false, false, 'RAF rejected General damages'),
('referred_hpcsa', 'Referred matter to HPCSA for a decision on the General damages', 'general_damages', 44, NULL, false, false, false, 'Referred matter to HPCSA for a decision on the General damages'),
('followed_up_hpcsa', 'Followed up from HPCSA regarding outcome', 'general_damages', 45, NULL, false, false, false, 'Followed up from HPCSA regarding outcome'),
('no_response_hpcsa', 'No response from HPCSA, we have to bring an application to compel them', 'general_damages', 46, NULL, false, false, false, 'No response from HPCSA, we have to bring an application to compel them'),
('received_hpcsa_outcome', 'Received outcome from HPCSA', 'general_damages', 47, NULL, false, false, false, 'Received outcome from HPCSA'),
('not_qualify_general', 'You do not qualify for General Damages', 'general_damages', 48, NULL, false, false, false, 'You do not qualify for General Damages'),
('qualify_general', 'You qualify for General Damages, so we have to apply for a new date to go to court', 'general_damages', 49, NULL, false, false, false, 'You qualify for General Damages, so we have to apply for a new date to go to court'),
('followed_up_new_date_general', 'Followed up new date from court for general damages', 'general_damages', 50, NULL, false, false, false, 'Followed up new date from court for general damages'),
('received_payment_general', 'Received payment of General Damages from RAF', 'payment', 51, NULL, false, false, false, 'Received payment of General Damages from RAF'),
('received_payment_loss_earnings', 'Received payment of Loss of Earnings from RAF', 'payment', 52, NULL, false, false, false, 'Received payment of Loss of Earnings from RAF'),
('received_payment_medical', 'Received payment of past medical expenses from RAF – you will receive your part after we deducted our fee; the rest goes to the medical aid', 'payment', 53, NULL, false, false, false, 'Received payment of past medical expenses from RAF – you will receive your part after we deducted our fee; the rest goes to the medical aid'),
('send_interest_letter', 'Send letter for interest on capital to RAF', 'payment', 54, NULL, false, false, false, 'Send letter for interest on capital to RAF'),
('request_bank_letter', 'Request bank letter from client to be sent to belinda@rvrinc.co.za', 'payment', 55, NULL, false, false, true, 'Request bank letter from client to be sent to belinda@rvrinc.co.za'),
('made_payment_client', 'Made payment to client', 'payment', 56, NULL, false, false, false, 'Made payment to client'),
('deducted_fees', 'Deducted experts and counsel fees from capital', 'payment', 57, NULL, false, false, false, 'Deducted experts and counsel fees from capital'),
('received_interest', 'Received interest from RAF, pay over to you after deducting our fees', 'payment', 58, NULL, false, false, false, 'Received interest from RAF, pay over to you after deducting our fees'),
('compiled_file_cost_consultant', 'Compiled file for cost consultant', 'costs', 59, NULL, false, false, false, 'Compiled file for cost consultant'),
('file_at_cost_consultant', 'File at cost consultant', 'costs', 60, NULL, false, false, false, 'File at cost consultant'),
('obtain_taxation_date', 'Obtain taxation date', 'costs', 61, NULL, false, true, false, 'Obtain taxation date'),
('receive_bill_send_raf', 'Receive Bill from Cost Consultant and send it to RAF to pay', 'costs', 62, NULL, false, false, false, 'Receive Bill from Cost Consultant and send it to RAF to pay'),
('received_costs_refund', 'Received money from RAF for costs – refund client for expert and counsel fees', 'costs', 63, NULL, false, false, false, 'Received money from RAF for costs – refund client for expert and counsel fees'),
('follow_up_interest_payment', 'Follow up payment of interest on capital from RAF', 'costs', 64, NULL, false, false, false, 'Follow up payment of interest on capital from RAF'),
('received_undertaking', 'Received Undertaking from RAF', 'undertaking', 65, NULL, false, false, false, 'Received Undertaking from RAF'),
('sent_undertaking_request', 'Sent request to RAF for Undertaking', 'undertaking', 66, NULL, false, false, false, 'Sent request to RAF for Undertaking'),
('followed_up_undertaking', 'Followed up at RAF for Undertaking', 'undertaking', 67, NULL, false, false, false, 'Followed up at RAF for Undertaking'),
('matter_finalized', 'All aspects of the matter have been finalized. Matter finalized. Close file', 'finalization', 68, NULL, false, false, false, 'All aspects of the matter have been finalized. Matter finalized. Close file')
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
                                    href="https://supabase.com/dashboard/project/ctfwxbrjyxjcdsrbdxxz/sql/new"
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
