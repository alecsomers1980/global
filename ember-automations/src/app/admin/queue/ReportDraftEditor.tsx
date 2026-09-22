"use client";

import { emailSummary, type ReportBody, type ReportSuggestion } from "@/lib/reports/summary";

export default function ReportDraftEditor({
  body,
  onChange,
}: {
  body: ReportBody;
  onChange: (next: ReportBody) => void;
}) {
  const emailLines = emailSummary(body);

  const delivered = body.facts.delivered.length;
  const inProgress = body.facts.in_flight.length;
  const waiting = body.facts.waiting.length;
  const checkIns = body.facts.check_ins.length;

  const factParts: string[] = [];
  if (delivered > 0) factParts.push(`${delivered} delivered`);
  if (inProgress > 0) factParts.push(`${inProgress} in progress`);
  if (waiting > 0) factParts.push(`${waiting} waiting on them`);
  if (checkIns > 0) factParts.push(`${checkIns} check-in${checkIns === 1 ? "" : "s"}`);

  const factsLine =
    factParts.length > 0
      ? factParts.join(" · ")
      : "Nothing delivered or in progress this month.";

  function credits(n: number): string {
    return n === 1 ? "1 credit" : `${n} credits`;
  }

  function updateSuggestionTitle(index: number, title: string) {
    onChange({
      ...body,
      suggestions: body.suggestions.map((suggestion, i) =>
        i === index ? { ...suggestion, title } : suggestion,
      ),
    });
  }

  function updateSuggestionWhy(index: number, why: string) {
    onChange({
      ...body,
      suggestions: body.suggestions.map((suggestion, i) =>
        i === index ? { ...suggestion, why } : suggestion,
      ),
    });
  }

  function removeSuggestion(index: number) {
    onChange({
      ...body,
      suggestions: body.suggestions.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-[#6b6b8a]">Email preview</p>
        <div className="space-y-1">
          {emailLines.map((line, index) => (
            <p key={index} className="text-sm text-[#6b6b8a]">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-[#6b6b8a]">The facts</p>
        <p className="text-sm text-[#6b6b8a]">{factsLine}</p>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-[#6b6b8a]">
          Suggestions (<span className="text-ember-500">{body.suggestions.length}</span>)
        </p>

        {body.suggestions.length === 0 ? (
          <p className="text-sm text-[#6b6b8a]">
            No suggestions — the AI returned none, or they were all removed.
          </p>
        ) : (
          body.suggestions.map((suggestion: ReportSuggestion, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-[#2a2a3d] p-3">
              <input
                aria-label={`Suggestion ${index + 1} title`}
                className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
                value={suggestion.title}
                onChange={(event) => updateSuggestionTitle(index, event.target.value)}
              />
              <textarea
                aria-label={`Suggestion ${index + 1} reasoning`}
                className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm"
                rows={3}
                value={suggestion.why}
                onChange={(event) => updateSuggestionWhy(index, event.target.value)}
              />
              <p className="text-xs text-[#6b6b8a]">
                {suggestion.size} · {credits(suggestion.credits)}
              </p>
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={() => removeSuggestion(index)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

