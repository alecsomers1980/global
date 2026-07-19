import type { Question, ModuleId } from "./types";

const q = (
  id: string, module: Question["module"], label: string, type: Question["type"],
  opts: Partial<Pick<Question, "help" | "options" | "required" | "critical">> = {}
): Question => ({
  id, module, label, type, round: 1,
  help: opts.help, options: opts.options,
  required: opts.required ?? false, critical: opts.critical ?? false,
});

// COMMON CORE — every project (vault reference/client-intake-questions.md)
export const CORE: Question[] = [
  q("core.contact", "core", "Your name, organisation, and role.", "text", { required: true, critical: true }),
  q("core.goal", "core", "In a sentence or two: what should this achieve / what problem does it solve?", "long", { required: true, critical: true }),
  q("core.decision", "core", "Who is the decision-maker who signs off and approves?", "text", { required: true, critical: true }),
  q("core.budget", "core", "What budget range are you working within for the build, and what monthly running cost is comfortable? (ranges are fine — so we recommend something that fits)", "long", { required: true, critical: true }),
  q("core.deadline", "core", "What's your deadline, and is it hard (a date/event) or flexible?", "text", { required: true, critical: true }),
  q("core.posture", "core", "Is this \"start simple this year and grow\", or does everything need to work from day one?", "select", { options: ["Start simple & grow", "Everything from day one"], required: true, critical: true }),
  q("core.tools", "core", "What existing tools/accounts must this keep or work with, and who owns them?", "long"),
  q("core.popia", "core", "Any rules about storing people's personal details (retention / POPIA)?", "long"),
  q("core.examples", "core", "Show us 1–2 sites/systems you like, and what you like about them.", "long", { help: "Paste links if you have them." }),
  q("core.anything", "core", "Anything else we should know?", "long"),
];

const MODULE_A: Question[] = [
  q("A.pages", "A", "What pages/sections do you need? (Home, About, Services, Contact, Gallery, Blog…)", "long"),
  q("A.primaryJob", "A", "What's the site's #1 job — phone calls, enquiry forms, bookings, online sales, or just credibility?", "select", { options: ["Phone calls", "Enquiry forms", "Bookings", "Online sales", "Credibility"], required: true, critical: true }),
  q("A.audience", "A", "Who's the audience, and which areas/towns do you serve? (for local SEO)", "long"),
  q("A.content", "A", "Do you provide the words and photos, or should we write/source them?", "select", { options: ["We provide everything", "You write/source everything", "Mix"], required: true }),
  q("A.branding", "A", "Do you have a logo, colours and fonts, or should we create them?", "select", { options: ["Have all", "Have some", "Create from scratch"] }),
  q("A.domain", "A", "Do you own a domain and hosting already?", "select", { options: ["Yes both", "Domain only", "Neither"] }),
  q("A.enquiries", "A", "Where should enquiries go — email, WhatsApp, a CRM?", "text"),
  q("A.moscow", "A", "Tag each possible feature by how much you need it.", "moscow", {
    help: "Must = launch blocker · Should = important · Could = nice · Not-yet = later.",
    options: ["Online booking", "Payments / shop", "Maps / directions", "Multiple languages", "Blog / news", "Photo gallery"],
  }),
];

const MODULE_B: Question[] = [
  q("B.process", "B", "Walk us through the process this should handle, start to finish.", "long", { required: true, critical: true }),
  q("B.roles", "B", "What are the user roles, and what can each do (view / submit / approve / admin)?", "long", { required: true, critical: true }),
  q("B.data", "B", "What records/data does it track, what reports do you need, and who sees them?", "long"),
  q("B.integrations", "B", "Which systems must it integrate with (e.g. a ticketing / payment / CRM API)?", "long"),
  q("B.outputs", "B", "How do outputs reach people (email, door list, codes, dashboards)?", "text"),
  q("B.scale", "B", "How many people use it, and does it spike around an event/season?", "text"),
  q("B.home", "B", "Where should it live — your existing tool (Airtable etc.) or a branded app?", "select", { options: ["Existing tool", "Branded app", "Not sure"] }),
  q("B.moscow", "B", "Tag each possible capability by how much you need it.", "moscow", {
    help: "Must = launch blocker · Should = important · Could = nice · Not-yet = later.",
    options: ["Requests", "Approvals", "Notifications", "Dashboards", "Integration sync", "Exports"],
  }),
];

export const MODULES: Record<ModuleId, Question[]> = { A: MODULE_A, B: MODULE_B };

export function assembleQuestionSet(modules: ModuleId[], custom: Question[] = []): Question[] {
  const chosen = modules.flatMap(m => MODULES[m]);
  return [...CORE, ...chosen, ...custom].map(q => ({ ...q, round: q.round ?? 1 }));
}
