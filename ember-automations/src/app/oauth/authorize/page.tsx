import { redirect } from "next/navigation";
import { sessionUser } from "@/lib/supabaseSession";
import { clientIdOf } from "@/lib/mcp/auth";
import { getOauthClient } from "@/lib/mcp/store";
import { serviceClient } from "@/lib/supabaseServer";
import { getClient } from "@/lib/spine/record";
import { isAllowedRedirectUri, isRedirectRegistered } from "@/lib/mcp/redirect";

function Problem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-8 w-full max-w-xl">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="mt-4 space-y-3">{children}</div>
        <p className="mt-6 text-sm text-[#6b6b8a]">
          If this keeps happening, send this screen to whoever set up the connector.
        </p>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-[#6b6b8a]">
      {label}: <code className="break-all">{value}</code>
    </p>
  );
}

export const dynamic = "force-dynamic";

const READ_TOOLS = [
  ["get_account", "See your plan, credit balance and what's in the queue"],
  ["list_catalogue", "Browse the things Ember can build, with credit prices"],
  ["list_requests / get_request", "See your requests, their estimates and status"],
  ["get_open_questions", "See questions Ember has asked you"],
];

const WRITE_TOOLS = [
  ["submit_request", "Log a new request for Ember to estimate"],
  ["approve_estimate / decline_estimate", "Accept or turn down an estimate"],
  ["answer_questions", "Answer Ember's questions"],
  ["share_business_info", "Tell Ember how your business works, for review"],
];

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { client_id, redirect_uri, code_challenge, code_challenge_method, state } = params;

  if (!client_id || !redirect_uri || !code_challenge) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass p-8 w-full max-w-xl">
          <h1 className="text-xl font-semibold">Invalid request</h1>
          <p className="mt-4 text-[#6b6b8a]">Missing required parameters.</p>
        </div>
      </main>
    );
  }

  if (code_challenge_method !== "S256") {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass p-8 w-full max-w-xl">
          <h1 className="text-xl font-semibold">Invalid request</h1>
          <p className="mt-4 text-[#6b6b8a]">Only S256 is supported.</p>
        </div>
      </main>
    );
  }

  // Three separate failures used to share one message, which made a real support
  // problem impossible to diagnose without database access. Say which it is —
  // every value echoed here came from the caller's own request.
  const db = serviceClient();
  const client = await getOauthClient(db, client_id);

  if (!client) {
    console.warn("[oauth/authorize] unknown client_id", { client_id, redirect_uri });
    return (
      <Problem title="Unrecognised client">
        <p>
          This connector is not registered with the portal. Remove it in Claude and add it
          again — that re-registers it.
        </p>
        <Detail label="Client ID" value={client_id} />
      </Problem>
    );
  }

  if (!isAllowedRedirectUri(redirect_uri)) {
    console.warn("[oauth/authorize] redirect not allowlisted", { client_id, redirect_uri });
    return (
      <Problem title="Redirect not permitted">
        <p>The portal only returns authorisation codes to Claude.</p>
        <Detail label="Requested redirect" value={redirect_uri} />
      </Problem>
    );
  }

  if (!isRedirectRegistered(client.redirect_uris, redirect_uri)) {
    console.warn("[oauth/authorize] redirect not registered for client", {
      client_id,
      redirect_uri,
      registered: client.redirect_uris,
    });
    return (
      <Problem title="Redirect does not match this connector">
        <p>
          This connector registered a different callback. Remove it in Claude and add it
          again.
        </p>
        <Detail label="Requested redirect" value={redirect_uri} />
        <Detail label="Registered" value={client.redirect_uris.join(", ")} />
      </Problem>
    );
  }

  const user = await sessionUser();
  if (!user) {
    const self = new URLSearchParams(params as Record<string, string>).toString();
    redirect(`/login?next=${encodeURIComponent(`/oauth/authorize?${self}`)}`);
  }

  const email = user.email ?? "";
  const clientId = clientIdOf(user);

  if (!clientId) {
    return (
      <Problem title="This account cannot connect">
        <p>
          Signed in as {email}. The Ember connector is for client accounts that Ember has
          invited. Alec: the admin connector isn&rsquo;t built yet — use /admin.
        </p>
      </Problem>
    );
  }

  const emberClient = await getClient(db, clientId);

  if (!emberClient || emberClient.status === "archived") {
    return (
      <Problem title="This account cannot connect">
        <p>Signed in as {email}. This client record is no longer active.</p>
      </Problem>
    );
  }

  const host = new URL(redirect_uri).host;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-8 w-full max-w-xl">
        <h1 className="text-xl font-semibold">
          Connect {client.client_name} to Ember for {emberClient.name}?
        </h1>
        <p className="mt-4 text-[#6b6b8a]">
          Signed in as <strong>{email}</strong>. It will be able to read:
        </p>
        <ul className="mt-2 space-y-1">
          {READ_TOOLS.map(([name, desc]) => (
            <li key={name}>
              <code>{name}</code> — {desc}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[#6b6b8a]">And to make changes:</p>
        <ul className="mt-2 space-y-1">
          {WRITE_TOOLS.map(([name, desc]) => (
            <li key={name}>
              <code>{name}</code> — {desc}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-lg bg-amber-500/10 p-4 text-sm">
          <strong>Everything goes through Alec.</strong> Requests are estimated and
          questions are drafted by Ember; nothing is built and no credits are used until
          you approve an estimate.
        </p>
        <p className="mt-4 rounded-lg bg-white/5 p-4 text-sm">
          <strong>Nothing can be deleted</strong>, and this connector only sees your own
          business&rsquo;s records.
        </p>
        <p className="mt-4 text-sm text-[#6b6b8a]">
          Approving sends you to <strong>{host}</strong>.
        </p>

        <form method="POST" action="/oauth/approve" className="mt-6 flex gap-3">
          <input type="hidden" name="client_id" value={client_id} />
          <input type="hidden" name="redirect_uri" value={redirect_uri} />
          <input type="hidden" name="code_challenge" value={code_challenge} />
          <input type="hidden" name="state" value={state ?? ""} />
          <button
            type="submit"
            name="decision"
            value="approve"
            className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg"
          >
            Approve
          </button>
          <button
            type="submit"
            name="decision"
            value="deny"
            className="border border-[#2a2a3d] px-4 py-2 rounded-lg"
          >
            Deny
          </button>
        </form>
      </div>
    </main>
  );
}

