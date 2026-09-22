import type { ReportBody } from "@/lib/reports/summary";

function credits(n: number): string {
  return `${n} ${n === 1 ? "credit" : "credits"}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-ZA");
}

export default function ReportView({ body }: { body: ReportBody }) {
  const { facts, suggestions } = body;

  const isQuiet =
    facts.delivered.length === 0 &&
    facts.in_flight.length === 0 &&
    facts.waiting.length === 0 &&
    suggestions.length === 0 &&
    facts.check_ins.length === 0;

  return (
    <div>
      <header>
        <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
          Ember Automations · Monthly report
        </p>
        <h1 className="text-3xl font-extrabold mt-1">{body.period_label}</h1>
        <p className="text-[#6b6b8a]">
          Hi {facts.client_name} — here is where things stand.
        </p>
      </header>

      {facts.delivered.length > 0 && (
        <section className="glass p-5 mt-4">
          <h2 className="font-semibold">What we did</h2>
          <div className="mt-2 space-y-4">
            {facts.delivered.map((item) => {
              const meta = [
                item.size,
                credits(item.credits),
                formatDate(item.delivered_at),
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div key={item.id}>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-[#6b6b8a]">{meta}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[#6b6b8a]">
            {facts.delivered.length} delivered this month, {credits(facts.credits_used)} used.
          </p>
        </section>
      )}

      {facts.in_flight.length > 0 && (
        <section className="glass p-5 mt-4">
          <h2 className="font-semibold">In progress</h2>
          <div className="mt-2 space-y-4">
            {facts.in_flight.map((item) => {
              const meta = [
                item.status.replace(/_/g, " "),
                item.queue_position !== null
                  ? `Queue position ${item.queue_position}`
                  : null,
                item.due_by ? `Due ${formatDate(item.due_by)}` : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div key={item.id}>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-[#6b6b8a]">{meta}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {facts.waiting.length > 0 && (
        <section className="glass p-5 mt-4">
          <h2 className="font-semibold">Waiting on you</h2>
          <div className="mt-2 space-y-4">
            {facts.waiting.map((item) => (
              <div key={item.id}>
                <p>{item.text}</p>
                {item.kind === "estimate" &&
                  (item.credits !== undefined || item.due_by) && (
                    <p className="text-[#6b6b8a]">
                      {[
                        item.credits !== undefined ? credits(item.credits) : null,
                        item.due_by ? `Due ${formatDate(item.due_by)}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[#6b6b8a]">
            Reply to the email you received, or ask your Claude connector.
          </p>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="glass p-5 mt-4">
          <h2 className="font-semibold">What we&apos;d do next</h2>
          <div className="mt-2 space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.catalogue_item_id ?? index}>
                <p className="font-medium">{suggestion.title}</p>
                <p className="text-ember-500">
                  {[suggestion.size, credits(suggestion.credits)].join(" · ")}
                </p>
                <p>{suggestion.why}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[#6b6b8a]">
            Nothing is booked from this report — reply to the email if any of it is worth doing.
          </p>
        </section>
      )}

      {facts.check_ins.length > 0 && (
        <section className="glass p-5 mt-4">
          <h2 className="font-semibold">A quick check</h2>
          <div className="mt-2 space-y-4">
            {facts.check_ins.map((item) => (
              <p key={item.id}>
                {item.title} — delivered {formatDate(item.delivered_at)}. Is it doing what you expected?
              </p>
            ))}
          </div>
        </section>
      )}

      {isQuiet && (
        <section className="glass p-5 mt-4">
          <p className="text-[#6b6b8a]">
            A quiet month — nothing was delivered and nothing is in progress. If something
            needs doing, reply to this email and Ember will take a look.
          </p>
        </section>
      )}

      <div className="mt-6">
        <p className="text-[#6b6b8a]">
          Credit balance: {credits(facts.balance)}
          {facts.balance < 0 ? " (we have run ahead of the plan)" : ""}
        </p>
        <p className="mt-1 text-sm text-[#6b6b8a]">
          Report generated {formatDate(body.generated_at)}.
        </p>
      </div>
    </div>
  );
}

