"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/app/admin/_components/DataTable";
import type {
  Client,
  ClientPerson,
  ClientSystem,
  ClientProcess,
  ClientFact,
  ClientAsset,
  Question,
  RequestRow,
  CreditRow,
  CatalogueItem,
  ClientStatus,
  AiProvider,
} from "@/lib/spine/types";
import type { Plan } from "@/lib/spine/plan";

type Props = {
  client: Client;
  people: ClientPerson[];
  systems: ClientSystem[];
  processes: ClientProcess[];
  facts: ClientFact[];
  assets: ClientAsset[];
  questions: Question[];
  requests: RequestRow[];
  ledger: CreditRow[];
  balance: number;
  shadow: { total: number; wouldAutoSend: number; edited: number };
  catalogue: CatalogueItem[];
  plan: Plan;
};

const inputClass =
  "w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm";
const primaryButton =
  "bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm";
const secondaryButton = "bg-dark-600 px-4 py-2 rounded-lg text-sm";
const dangerButton =
  "border border-[#2a2a3d] text-red-400 px-4 py-2 rounded-lg text-sm";
const statusLabelClass = "text-xs uppercase tracking-wide text-ember-500";
const mutedClass = "text-[#6b6b8a]";

function FormError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400 text-sm">{msg}</p>;
}

function PeopleSection({
  clientId,
  people,
}: {
  clientId: string;
  people: ClientPerson[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    signs_off_on: "",
    is_primary: false,
  });
  const [error, setError] = useState("");
  const [invited, setInvited] = useState<Record<string, string>>({});
  const [inviteError, setInviteError] = useState<Record<string, string>>({});

  const columns: {
    key: keyof ClientPerson & string;
    label: string;
    render?: (row: ClientPerson) => ReactNode;
  }[] = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role", render: (row) => row.role ?? "—" },
    { key: "email", label: "Email", render: (row) => row.email ?? "—" },
    { key: "phone", label: "Phone", render: (row) => row.phone ?? "—" },
    {
      key: "signs_off_on",
      label: "Signs off on",
      render: (row) =>
        Array.isArray(row.signs_off_on) ? row.signs_off_on.join(", ") : "—",
    },
    {
      key: "is_primary",
      label: "Primary",
      render: (row) => (row.is_primary ? "✓" : ""),
    },
    {
      key: "id",
      label: "Invite",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!row.email}
            onClick={() => invite(row)}
            className="bg-dark-600 px-3 py-1 rounded-lg text-xs disabled:opacity-40"
          >
            Invite
          </button>
          {invited[row.id] ? (
            <span className="text-xs text-ember-500">
              Invited {invited[row.id]}
            </span>
          ) : null}
          {inviteError[row.id] ? (
            <span className="text-xs text-red-400">{inviteError[row.id]}</span>
          ) : null}
        </div>
      ),
    },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/spine/clients/${clientId}/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        role: form.role || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        signs_off_on: form.signs_off_on
          ? form.signs_off_on.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        is_primary: form.is_primary,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setForm({
      name: "",
      role: "",
      email: "",
      phone: "",
      signs_off_on: "",
      is_primary: false,
    });
    router.refresh();
  }

  async function invite(person: ClientPerson) {
    setInviteError((prev) => ({ ...prev, [person.id]: "" }));
    const res = await fetch(`/api/admin/spine/clients/${clientId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: person.id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setInviteError((prev) => ({
        ...prev,
        [person.id]: body.error ?? "failed",
      }));
      return;
    }
    setInvited((prev) => ({
      ...prev,
      [person.id]: body.email || person.email || "invited",
    }));
    router.refresh();
  }

  return (
    <section className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold">People</h2>
      <DataTable
        rows={people}
        columns={columns}
        searchKeys={
          ["name", "role", "email", "phone"] as (keyof ClientPerson & string)[]
        }
      />
      <form
        onSubmit={submit}
        className="space-y-3 border-t border-[#2a2a3d] pt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className={inputClass}
          />
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Role"
            className={inputClass}
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className={inputClass}
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            className={inputClass}
          />
        </div>
        <input
          value={form.signs_off_on}
          onChange={(e) => setForm({ ...form, signs_off_on: e.target.value })}
          placeholder="Signs off on (comma-separated)"
          className={inputClass}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
          />
          Primary contact
        </label>
        <button className={primaryButton}>Add person</button>
        <FormError msg={error} />
      </form>
    </section>
  );
}

function SystemsSection({
  clientId,
  systems,
}: {
  clientId: string;
  systems: ClientSystem[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", kind: "", notes: "" });
  const [error, setError] = useState("");

  const columns: {
    key: keyof ClientSystem & string;
    label: string;
    render?: (row: ClientSystem) => ReactNode;
  }[] = [
    { key: "name", label: "Name" },
    { key: "kind", label: "Kind", render: (row) => row.kind ?? "—" },
    { key: "notes", label: "Notes", render: (row) => row.notes ?? "—" },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/spine/clients/${clientId}/systems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        kind: form.kind || undefined,
        notes: form.notes || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setForm({ name: "", kind: "", notes: "" });
    router.refresh();
  }

  return (
    <section className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold">Systems</h2>
      <DataTable
        rows={systems}
        columns={columns}
        searchKeys={
          ["name", "kind", "notes"] as (keyof ClientSystem & string)[]
        }
      />
      <form
        onSubmit={submit}
        className="space-y-3 border-t border-[#2a2a3d] pt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className={inputClass}
          />
          <input
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
            placeholder="Kind"
            className={inputClass}
          />
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
            className={inputClass}
          />
        </div>
        <button className={primaryButton}>Add system</button>
        <FormError msg={error} />
      </form>
    </section>
  );
}

function ProcessesSection({
  clientId,
  processes,
}: {
  clientId: string;
  processes: ClientProcess[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    frequency: "",
    volume: "",
    pain: "",
  });
  const [error, setError] = useState("");

  const columns: {
    key: keyof ClientProcess & string;
    label: string;
    render?: (row: ClientProcess) => ReactNode;
  }[] = [
    { key: "name", label: "Name" },
    {
      key: "frequency",
      label: "Frequency",
      render: (row) => row.frequency ?? "—",
    },
    { key: "volume", label: "Volume", render: (row) => row.volume ?? "—" },
    { key: "pain", label: "Pain", render: (row) => row.pain ?? "—" },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/spine/clients/${clientId}/processes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        frequency: form.frequency || undefined,
        volume: form.volume || undefined,
        pain: form.pain || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setForm({ name: "", frequency: "", volume: "", pain: "" });
    router.refresh();
  }

  return (
    <section className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold">Processes</h2>
      <DataTable
        rows={processes}
        columns={columns}
        searchKeys={
          ["name", "frequency", "volume", "pain"] as (keyof ClientProcess &
            string)[]
        }
      />
      <form
        onSubmit={submit}
        className="space-y-3 border-t border-[#2a2a3d] pt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className={inputClass}
          />
          <input
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            placeholder="Frequency"
            className={inputClass}
          />
          <input
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
            placeholder="Volume"
            className={inputClass}
          />
          <input
            value={form.pain}
            onChange={(e) => setForm({ ...form, pain: e.target.value })}
            placeholder="Pain"
            className={inputClass}
          />
        </div>
        <button className={primaryButton}>Add process</button>
        <FormError msg={error} />
      </form>
    </section>
  );
}

function FactsSection({
  clientId,
  facts,
}: {
  clientId: string;
  facts: ClientFact[];
}) {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [formError, setFormError] = useState("");
  const [statusError, setStatusError] = useState<Record<string, string>>({});

  const columns: {
    key: keyof ClientFact & string;
    label: string;
    render?: (row: ClientFact) => ReactNode;
  }[] = [
    { key: "statement", label: "Statement" },
    { key: "source", label: "Source", render: (row) => row.source ?? "—" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={statusLabelClass}>{row.status}</span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (row) =>
        row.status === "proposed" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateStatus(row, "confirmed")}
              className="bg-dark-600 px-3 py-1 rounded-lg text-xs"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => updateStatus(row, "rejected")}
              className="border border-[#2a2a3d] text-red-400 px-3 py-1 rounded-lg text-xs"
            >
              Reject
            </button>
            {statusError[row.id] ? (
              <span className="text-xs text-red-400">
                {statusError[row.id]}
              </span>
            ) : null}
          </div>
        ) : (
          <span className={mutedClass}>—</span>
        ),
    },
  ];

  async function updateStatus(
    fact: ClientFact,
    status: "confirmed" | "rejected",
  ) {
    setStatusError((prev) => ({ ...prev, [fact.id]: "" }));
    const res = await fetch(`/api/admin/spine/clients/${clientId}/facts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fact_id: fact.id, status }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatusError((prev) => ({
        ...prev,
        [fact.id]: body.error ?? "failed",
      }));
      return;
    }
    router.refresh();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const res = await fetch(`/api/admin/spine/clients/${clientId}/facts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statement }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(body.error ?? "failed");
      return;
    }
    setStatement("");
    router.refresh();
  }

  return (
    <section className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold">Facts</h2>
      <DataTable
        rows={facts}
        columns={columns}
        searchKeys={
          ["statement", "source", "status"] as (keyof ClientFact & string)[]
        }
      />
      <form
        onSubmit={submit}
        className="space-y-3 border-t border-[#2a2a3d] pt-4"
      >
        <input
          required
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Add a fact or claim"
          className={inputClass}
        />
        <button className={primaryButton}>Add fact</button>
        <FormError msg={formError} />
      </form>
    </section>
  );
}

function AssetsSection({
  clientId,
  assets,
}: {
  clientId: string;
  assets: ClientAsset[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ kind: "site", label: "", url: "" });
  const [error, setError] = useState("");

  const columns: {
    key: keyof ClientAsset & string;
    label: string;
    render?: (row: ClientAsset) => ReactNode;
  }[] = [
    { key: "kind", label: "Kind" },
    { key: "label", label: "Label" },
    {
      key: "url",
      label: "URL",
      render: (row) =>
        row.url ? (
          <a
            className="text-ember-500"
            href={row.url}
            target="_blank"
            rel="noreferrer"
          >
            {row.url}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={statusLabelClass}>{row.status ?? "—"}</span>
      ),
    },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/spine/clients/${clientId}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: form.kind,
        label: form.label,
        url: form.url || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setForm({ kind: "site", label: "", url: "" });
    router.refresh();
  }

  return (
    <section className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold">Assets</h2>
      <DataTable
        rows={assets}
        columns={columns}
        searchKeys={
          ["kind", "label", "status"] as (keyof ClientAsset & string)[]
        }
      />
      <form
        onSubmit={submit}
        className="space-y-3 border-t border-[#2a2a3d] pt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
            className={inputClass}
          >
            <option value="site">site</option>
            <option value="domain">domain</option>
            <option value="supabase">supabase</option>
            <option value="vercel">vercel</option>
            <option value="email">email</option>
            <option value="repo">repo</option>
            <option value="other">other</option>
          </select>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Label"
            className={inputClass}
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL"
            className={inputClass}
          />
        </div>
        <button className={primaryButton}>Add asset</button>
        <FormError msg={error} />
      </form>
    </section>
  );
}

function RequestForm({
  clientId,
  catalogue,
}: {
  clientId: string;
  catalogue: CatalogueItem[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    why_it_matters: "",
    affected_area: "",
    examples: "",
    deadline: "",
    catalogue_item_id: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMsg("");
    setError("");
    const res = await fetch(`/api/admin/spine/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        title: form.title,
        description: form.description,
        why_it_matters: form.why_it_matters || undefined,
        affected_area: form.affected_area || undefined,
        examples: form.examples || undefined,
        deadline: form.deadline || undefined,
        catalogue_item_id: form.catalogue_item_id || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 200) {
      setMsg("Triaged — item waiting in the queue");
    } else if (res.status === 202) {
      setMsg("Logged — triage pending (retry from the request page)");
    } else {
      setError(body.error ?? "failed");
      return;
    }
    setForm({
      title: "",
      description: "",
      why_it_matters: "",
      affected_area: "",
      examples: "",
      deadline: "",
      catalogue_item_id: "",
    });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className={inputClass}
        />
        <input
          value={form.affected_area}
          onChange={(e) => setForm({ ...form, affected_area: e.target.value })}
          placeholder="Affected area"
          className={inputClass}
        />
      </div>
      <textarea
        required
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
        className={`${inputClass} min-h-[6rem]`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea
          value={form.why_it_matters}
          onChange={(e) =>
            setForm({ ...form, why_it_matters: e.target.value })
          }
          placeholder="Why it matters"
          className={`${inputClass} min-h-[6rem]`}
        />
        <textarea
          value={form.examples}
          onChange={(e) => setForm({ ...form, examples: e.target.value })}
          placeholder="Examples"
          className={`${inputClass} min-h-[6rem]`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          className={inputClass}
        />
        <select
          value={form.catalogue_item_id}
          onChange={(e) =>
            setForm({ ...form, catalogue_item_id: e.target.value })
          }
          className={inputClass}
        >
          <option value="">No catalogue item</option>
          {catalogue.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <button className={primaryButton}>Log request</button>
      {msg ? <p className="text-sm text-ember-500">{msg}</p> : null}
      <FormError msg={error} />
    </form>
  );
}

function RequestsTab({
  client,
  requests,
  catalogue,
}: {
  client: Client;
  requests: RequestRow[];
  catalogue: CatalogueItem[];
}) {
  const columns: {
    key: keyof RequestRow & string;
    label: string;
    render?: (row: RequestRow) => ReactNode;
  }[] = [
    { key: "title", label: "Title" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={statusLabelClass}>{row.status}</span>
      ),
    },
    { key: "size", label: "Size", render: (row) => row.size ?? "—" },
    {
      key: "credits",
      label: "Credits",
      render: (row) => row.credits ?? "—",
    },
    {
      key: "created_at",
      label: "Created",
      render: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("en-ZA")
          : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-bold">Log a request</h2>
        <RequestForm clientId={client.id} catalogue={catalogue} />
      </section>
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-bold">Requests</h2>
        <DataTable
          rows={requests}
          columns={columns}
          searchKeys={["title", "status"] as (keyof RequestRow & string)[]}
          initialSort={{ key: "created_at", dir: "desc" }}
          rowHref={(row) => `/admin/requests/${row.id}`}
        />
      </section>
    </div>
  );
}

function QuestionsTab({
  clientId,
  questions,
}: {
  clientId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const columns: {
    key: keyof Question & string;
    label: string;
    render?: (row: Question) => ReactNode;
  }[] = [
    { key: "text", label: "Text" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={statusLabelClass}>{row.status}</span>
      ),
    },
    {
      key: "answer",
      label: "Answer",
      render: (row) => row.answer ?? "—",
    },
    {
      key: "created_at",
      label: "Created",
      render: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("en-ZA")
          : "—",
    },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMsg("");
    setError("");
    const questions = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(" — ");
        if (idx === -1) return { text: line };
        return {
          text: line.slice(0, idx).trim(),
          why: line.slice(idx + 3).trim(),
        };
      });

    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }

    const res = await fetch(`/api/admin/spine/clients/${clientId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setText("");
    setMsg("Batch queued for your approval");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-bold">Questions</h2>
        <DataTable
          rows={questions}
          columns={columns}
          searchKeys={
            ["text", "answer"] as (keyof Question & string)[]
          }
        />
      </section>
      <section className="glass p-6 space-y-3">
        <h2 className="text-xl font-bold">Draft a question batch</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="One question per line. Optional — why after an em dash"
          className={`${inputClass} min-h-[8rem]`}
        />
        <button className={primaryButton} onClick={submit}>
          Queue for approval
        </button>
        {msg ? <p className="text-sm text-ember-500">{msg}</p> : null}
        <FormError msg={error} />
      </section>
    </div>
  );
}

function CreditsTab({
  clientId,
  balance,
  ledger,
}: {
  clientId: string;
  balance: number;
  ledger: CreditRow[];
}) {
  const router = useRouter();
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const columns: {
    key: keyof CreditRow & string;
    label: string;
    render?: (row: CreditRow) => ReactNode;
  }[] = [
    {
      key: "created_at",
      label: "Date",
      render: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString("en-ZA")
          : "—",
    },
    {
      key: "delta",
      label: "Delta",
      render: (row) => `${row.delta > 0 ? "+" : ""}${row.delta}`,
    },
    { key: "reason", label: "Reason", render: (row) => row.reason ?? "—" },
    { key: "note", label: "Note", render: (row) => row.note ?? "—" },
  ];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/spine/clients/${clientId}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        delta: Number(delta),
        note: note || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setDelta("");
    setNote("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="glass p-6 space-y-4">
        <h2 className="text-xl font-bold">Credits</h2>
        <p className="text-4xl font-bold">{balance}</p>
        <DataTable
          rows={ledger}
          columns={columns}
          searchKeys={["reason", "note"] as (keyof CreditRow & string)[]}
        />
      </section>
      <section className="glass p-6 space-y-3">
        <h2 className="text-xl font-bold">Adjust balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            required
            type="number"
            step="any"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="Delta"
            className={inputClass}
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className={inputClass}
          />
        </div>
        <button className={primaryButton} onClick={submit}>
          Add adjustment
        </button>
        <FormError msg={error} />
      </section>
    </div>
  );
}

function SettingsTab({
  client,
  plan,
  shadow,
}: {
  client: Client;
  plan: Plan;
  shadow: { total: number; wouldAutoSend: number; edited: number };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: client.name,
    vertical: client.vertical ?? "",
    status: client.status,
    approval_mode: client.approval_mode,
    ai_provider: client.ai_provider ?? "",
    notes: client.notes ?? "",
  });
  const [monthly_credits, setMonthlyCredits] = useState(
    String(plan.monthly_credits),
  );
  const [max_active, setMaxActive] = useState(String(plan.max_active));
  const [renews_on, setRenewsOn] = useState(String(plan.renews_on));
  const [rollover, setRollover] = useState(plan.rollover);
  const [turnaroundS, setTurnaroundS] = useState(plan.turnaround.S ?? "");
  const [turnaroundM, setTurnaroundM] = useState(plan.turnaround.M ?? "");
  const [turnaroundL, setTurnaroundL] = useState(plan.turnaround.L ?? "");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const aiProviders = ["openai", "anthropic", "google", "azure", "custom"];
  if (form.ai_provider && !aiProviders.includes(form.ai_provider)) {
    aiProviders.push(form.ai_provider);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMsg("");
    const res = await fetch(`/api/admin/spine/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        vertical: form.vertical || undefined,
        status: form.status,
        approval_mode: form.approval_mode,
        ai_provider: form.ai_provider || undefined,
        notes: form.notes || undefined,
        plan: {
          ...plan,
          monthly_credits: Number(monthly_credits),
          max_active: Number(max_active),
          renews_on: Number(renews_on),
          rollover,
          turnaround: {
            S: turnaroundS,
            M: turnaroundM,
            L: turnaroundL,
          },
        },
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "failed");
      return;
    }
    setMsg("Saved");
    router.refresh();
  }

  return (
    <section className="glass p-6 space-y-4">
      <h2 className="text-xl font-bold">Settings</h2>
      <p className="text-sm text-[#6b6b8a]">
        Under mode B, {shadow.wouldAutoSend} of {shadow.total} items in the
        last 30 days would have gone out unreviewed; you edited {shadow.edited}{" "}
        of them.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className={inputClass}
          />
          <input
            value={form.vertical}
            onChange={(e) => setForm({ ...form, vertical: e.target.value })}
            placeholder="Vertical"
            className={inputClass}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}
            className={inputClass}
          >
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="archived">archived</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={form.approval_mode}
            onChange={(e) =>
              setForm({ ...form, approval_mode: e.target.value as "A" | "B" })
            }
            className={inputClass}
          >
            <option value="A">Mode A</option>
            <option value="B">Mode B</option>
          </select>
          <select
            value={form.ai_provider}
            onChange={(e) =>
              setForm({ ...form, ai_provider: e.target.value as AiProvider })
            }
            className={inputClass}
          >
            <option value="">Select provider</option>
            {aiProviders.map((provider) => (
              <option key={provider} value={provider}>
                {provider}
              </option>
            ))}
          </select>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            required
            type="number"
            value={monthly_credits}
            onChange={(e) => setMonthlyCredits(e.target.value)}
            placeholder="Monthly credits"
            className={inputClass}
          />
          <input
            required
            type="number"
            value={max_active}
            onChange={(e) => setMaxActive(e.target.value)}
            placeholder="Max active"
            className={inputClass}
          />
          <input
            required
            type="number"
            min="1"
            max="28"
            value={renews_on}
            onChange={(e) => setRenewsOn(e.target.value)}
            placeholder="Renews on (1–28)"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={turnaroundS}
            onChange={(e) => setTurnaroundS(e.target.value)}
            placeholder="S turnaround"
            className={inputClass}
          />
          <input
            value={turnaroundM}
            onChange={(e) => setTurnaroundM(e.target.value)}
            placeholder="M turnaround"
            className={inputClass}
          />
          <input
            value={turnaroundL}
            onChange={(e) => setTurnaroundL(e.target.value)}
            placeholder="L turnaround"
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={rollover}
            onChange={(e) => setRollover(e.target.checked)}
          />
          Rollover unused credits
        </label>
        <button className={primaryButton}>Save settings</button>
        {msg ? <p className="text-sm text-ember-500">{msg}</p> : null}
        <FormError msg={error} />
      </form>
    </section>
  );
}

function RecordTab({
  client,
  people,
  systems,
  processes,
  facts,
  assets,
}: {
  client: Client;
  people: ClientPerson[];
  systems: ClientSystem[];
  processes: ClientProcess[];
  facts: ClientFact[];
  assets: ClientAsset[];
}) {
  return (
    <div className="space-y-6">
      <PeopleSection clientId={client.id} people={people} />
      <SystemsSection clientId={client.id} systems={systems} />
      <ProcessesSection clientId={client.id} processes={processes} />
      <FactsSection clientId={client.id} facts={facts} />
      <AssetsSection clientId={client.id} assets={assets} />
    </div>
  );
}

export default function RecordTabs(props: Props) {
  const [tab, setTab] = useState<
    "record" | "requests" | "questions" | "credits" | "settings"
  >("record");

  const tabs: {
    key: "record" | "requests" | "questions" | "credits" | "settings";
    label: string;
  }[] = [
    { key: "record", label: "Record" },
    { key: "requests", label: "Requests" },
    { key: "questions", label: "Questions" },
    { key: "credits", label: "Credits" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={tab === item.key ? primaryButton : secondaryButton}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "record" ? (
        <RecordTab
          client={props.client}
          people={props.people}
          systems={props.systems}
          processes={props.processes}
          facts={props.facts}
          assets={props.assets}
        />
      ) : null}

      {tab === "requests" ? (
        <RequestsTab
          client={props.client}
          requests={props.requests}
          catalogue={props.catalogue}
        />
      ) : null}

      {tab === "questions" ? (
        <QuestionsTab clientId={props.client.id} questions={props.questions} />
      ) : null}

      {tab === "credits" ? (
        <CreditsTab
          clientId={props.client.id}
          balance={props.balance}
          ledger={props.ledger}
        />
      ) : null}

      {tab === "settings" ? (
        <SettingsTab
          client={props.client}
          plan={props.plan}
          shadow={props.shadow}
        />
      ) : null}
    </div>
  );
}

