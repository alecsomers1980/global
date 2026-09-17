import type { SupabaseClient } from "@supabase/supabase-js";
import { makeToken, tokenExpiry } from "@/lib/spine/tokens";
import type { LinkKind, LinkToken } from "@/lib/spine/types";

export async function mintLink(
  db: SupabaseClient,
  input: { kind: LinkKind; ref_id: string; client_id: string },
  now: Date = new Date()
): Promise<{ row: LinkToken; url: string }> {
  const token = makeToken();
  const expiresAt = tokenExpiry(now).toISOString();
  const { data, error } = await db
    .from("link_tokens")
    .insert({
      token,
      kind: input.kind,
      ref_id: input.ref_id,
      client_id: input.client_id,
      expires_at: expiresAt,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as LinkToken;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/c/${row.token}`;
  return { row, url };
}
