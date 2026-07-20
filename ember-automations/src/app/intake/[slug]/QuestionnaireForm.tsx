"use client";
import { useState, useCallback, useRef } from "react";
import type { Question, AnswerValue, MoscowTag } from "@/lib/types";

const nowRound = (qs: Question[]) => (qs.length ? Math.max(...qs.map(q => q.round)) : 1);

export default function QuestionnaireForm({ slug, questionSet, initialAnswers, status }: {
  slug: string;
  questionSet: Question[];
  initialAnswers: Record<string, AnswerValue>;
  status: string;
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(initialAnswers || {});
  const [submitted, setSubmitted] = useState(status === "submitted" || status === "ready_to_quote");
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRound = nowRound(questionSet);

  const persist = useCallback((next: Record<string, AnswerValue>) => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true);
    timer.current = setTimeout(async () => {
      await fetch(`/api/intake/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next }),
      });
      setSaving(false);
    }, 700);
  }, [slug]);

  const set = (id: string, value: AnswerValue["value"]) => {
    const next = { ...answers, [id]: { value, round: activeRound, saved_at: new Date().toISOString() } };
    setAnswers(next);
    persist(next);
  };

  const submit = async () => {
    await fetch(`/api/intake/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    await fetch(`/api/intake/${slug}`, { method: "POST" });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="glass p-8 text-center">
        <h2 className="text-xl font-bold">Thank you!</h2>
        <p className="text-[#6b6b8a] mt-2">
          We&apos;ve got your answers and will be in touch. If we need anything more,
          this same link will show a few extra questions.
        </p>
      </div>
    );
  }

  const visible = questionSet.filter(q => q.round === activeRound);

  return (
    <form className="space-y-6" onSubmit={e => { e.preventDefault(); submit(); }}>
      {visible.map(q => (
        <Field key={q.id} q={q} slug={slug} value={answers[q.id]?.value} onChange={v => set(q.id, v)} />
      ))}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-ember-500 hover:bg-ember-600 text-[#0a0a0f] font-semibold px-6 py-3 rounded-xl ember-glow transition"
        >
          Submit answers
        </button>
        <span className="text-xs text-[#6b6b8a]">{saving ? "Saving…" : "Progress saved"}</span>
      </div>
    </form>
  );
}

const inputCls = "w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-[#e2e2f0]";

function Field({ q, slug, value, onChange }: {
  q: Question; slug: string; value: any; onChange: (v: any) => void;
}) {
  return (
    <div className="glass p-5">
      <label className="block font-semibold mb-1">
        {q.label}{q.critical && <span className="text-ember-500"> *</span>}
      </label>
      {q.help && <p className="text-xs text-[#6b6b8a] mb-2">{q.help}</p>}

      {q.type === "long" && (
        <textarea className={inputCls} rows={4} value={value ?? ""} onChange={e => onChange(e.target.value)} />
      )}

      {["text", "url", "email", "number"].includes(q.type) && (
        <input
          className={inputCls}
          type={q.type === "number" ? "number" : q.type === "email" ? "email" : "text"}
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
        />
      )}

      {q.type === "select" && (
        <select className={inputCls} value={value ?? ""} onChange={e => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {q.type === "multiselect" && q.options?.map(o => {
        const arr: string[] = Array.isArray(value) ? value : [];
        return (
          <label key={o} className="flex items-center gap-2 py-0.5">
            <input
              type="checkbox"
              checked={arr.includes(o)}
              onChange={e => onChange(e.target.checked ? [...arr, o] : arr.filter(x => x !== o))}
            />
            {o}
          </label>
        );
      })}

      {q.type === "moscow" && (
        <Moscow options={q.options ?? []} value={value ?? {}} onChange={onChange} />
      )}

      {q.type === "file" && (
        <>
          <input
            type="file"
            className={inputCls}
            onChange={async e => {
              const f = e.target.files?.[0];
              if (!f) return;
              const fd = new FormData();
              fd.append("file", f);
              fd.append("slug", slug);
              fd.append("questionId", q.id);
              const res = await fetch("/api/uploads", { method: "POST", body: fd });
              const j = await res.json();
              if (j.filename) onChange(j.filename);
            }}
          />
          {value && <p className="text-xs text-[#6b6b8a] mt-1">Uploaded: {value}</p>}
        </>
      )}
    </div>
  );
}

function Moscow({ options, value, onChange }: {
  options: string[];
  value: Record<string, MoscowTag>;
  onChange: (v: Record<string, MoscowTag>) => void;
}) {
  const tags: MoscowTag[] = ["Must", "Should", "Could", "Not-yet"];
  return (
    <div className="space-y-2">
      {options.map(f => (
        <div key={f} className="flex items-center justify-between gap-3">
          <span>{f}</span>
          <div className="flex gap-1">
            {tags.map(t => (
              <button
                type="button"
                key={t}
                className={`text-xs px-2 py-1 rounded ${
                  value[f] === t ? "bg-ember-500 text-[#0a0a0f]" : "bg-dark-600 text-[#6b6b8a]"
                }`}
                onClick={() => onChange({ ...value, [f]: t })}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
