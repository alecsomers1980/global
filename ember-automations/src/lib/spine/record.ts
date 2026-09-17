import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client, ClientPerson, ClientSystem, ClientProcess, ClientFact, ClientAsset, FactSource } from "./types";

export async function getClient(db: SupabaseClient, id: string): Promise<Client | null> {
  const { data, error } = await db.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Client | null;
}

export async function getClientBySlug(db: SupabaseClient, slug: string): Promise<Client | null> {
  const { data, error } = await db.from("clients").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Client | null;
}

export async function summarizeRecord(db: SupabaseClient, clientId: string): Promise<string> {
  const client = await getClient(db, clientId);
  if (!client) throw new Error("client not found");

  const { data: people, error: peopleError } = await db.from("client_people")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (peopleError) throw new Error(peopleError.message);

  const { data: systems, error: systemsError } = await db.from("client_systems")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (systemsError) throw new Error(systemsError.message);

  const { data: processes, error: processesError } = await db.from("client_processes")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (processesError) throw new Error(processesError.message);

  const { data: facts, error: factsError } = await db.from("client_facts")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(30);
  if (factsError) throw new Error(factsError.message);

  const { data: assets, error: assetsError } = await db.from("client_assets")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (assetsError) throw new Error(assetsError.message);

  const peopleRows = people as ClientPerson[];
  const systemRows = systems as ClientSystem[];
  const processRows = processes as ClientProcess[];
  const factRows = facts as ClientFact[];
  const assetRows = assets as ClientAsset[];

  const lines: string[] = [];
  lines.push(`Client: ${client.name} (${client.vertical ?? "no vertical"}) — status ${client.status}`);
  lines.push("People:");
  if (peopleRows.length === 0) {
    lines.push("- none recorded");
  } else {
    for (const p of peopleRows) {
      const signsOff = p.signs_off_on?.length ? p.signs_off_on.join(", ") : "n/a";
      lines.push(`- ${p.name} — ${p.role ?? "role unknown"}; signs off on: ${signsOff}`);
    }
  }
  lines.push("Systems:");
  if (systemRows.length === 0) {
    lines.push("- none recorded");
  } else {
    for (const s of systemRows) {
      lines.push(`- ${s.name} (${s.kind ?? "unspecified"})${s.notes ? ": " + s.notes : ""}`);
    }
  }
  lines.push("Processes:");
  if (processRows.length === 0) {
    lines.push("- none recorded");
  } else {
    for (const pr of processRows) {
      lines.push(`- ${pr.name} — ${pr.frequency ?? "?"}, volume ${pr.volume ?? "?"}; pain: ${pr.pain ?? "none noted"}`);
    }
  }
  lines.push("Confirmed facts:");
  if (factRows.length === 0) {
    lines.push("- none recorded");
  } else {
    for (const fact of factRows) {
      lines.push(`- ${fact.statement}`);
    }
  }
  lines.push("Assets:");
  if (assetRows.length === 0) {
    lines.push("- none recorded");
  } else {
    for (const asset of assetRows) {
      lines.push(`- ${asset.label}: ${asset.status}`);
    }
  }

  let result = lines.join("\n");
  if (result.length > 2000) {
    result = result.slice(0, 1997) + "...";
  }
  return result;
}

export async function proposeFacts(
  db: SupabaseClient,
  clientId: string,
  statements: string[],
  source: FactSource,
  sourceRef: string | null,
): Promise<ClientFact[]> {
  if (statements.length === 0) return [];
  const rows = statements.map((statement) => ({
    client_id: clientId,
    statement,
    source,
    source_ref: sourceRef,
    status: "proposed" as const,
  }));
  const { data, error } = await db.from("client_facts").insert(rows).select("*");
  if (error) throw new Error(error.message);
  return data as ClientFact[];
}

export async function setFactStatus(
  db: SupabaseClient,
  factId: string,
  status: "confirmed" | "rejected",
): Promise<void> {
  const { error } = await db.from("client_facts")
    .update({
      status,
      confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
    })
    .eq("id", factId);
  if (error) throw new Error(error.message);
}

export async function primaryPerson(db: SupabaseClient, clientId: string): Promise<ClientPerson | null> {
  const { data, error } = await db.from("client_people")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const people = data as ClientPerson[];
  return people.find((p) => p.is_primary === true) ?? people.find((p) => !!p.email && p.email.trim() !== "") ?? null;
}
