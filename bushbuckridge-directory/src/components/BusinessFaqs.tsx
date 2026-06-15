import { ChevronDown } from 'lucide-react'

export default function BusinessFaqs({ faqs }: { faqs: any[] }) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null
  const valid = faqs.filter((f) => f && (f.question || f.answer))
  if (valid.length === 0) return null

  return (
    <div className="space-y-3">
      {valid.map((f, i) => (
        <details key={i} className="group rounded-2xl border border-primary/5 bg-card/60 overflow-hidden">
          <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-4 font-black text-primary list-none">
            {f.question}
            <ChevronDown className="h-5 w-5 shrink-0 text-primary/40 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-6 pb-5 text-muted-foreground font-medium leading-relaxed">{f.answer}</div>
        </details>
      ))}
    </div>
  )
}
