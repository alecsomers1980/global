"use server";

import { getServerClient } from "@/lib/supabase/server";
import { isBot } from "@/lib/bot-guard";

export type StockistResult = { ok: true } | { ok: false; error: string };

const REQUIRED = ["business", "contact", "email", "phone", "town"] as const;

/** Long enough for any real answer, short enough that the column is not a dumping ground. */
const MAX = 2000;

export async function submitStockistApplication(form: FormData): Promise<StockistResult> {
  if (isBot({ company: form.get("company"), renderedAt: form.get("renderedAt") })) {
    // Report success and write nothing. A rejection message tells the bot what
    // to change; silence does not.
    return { ok: true };
  }

  const value = (k: string) => String(form.get(k) ?? "").trim().slice(0, MAX);
  const row = {
    business: value("business"),
    contact: value("contact"),
    email: value("email").toLowerCase(),
    phone: value("phone"),
    town: value("town"),
    stocking: value("stocking") || null,
  };

  if (REQUIRED.some((k) => !row[k])) {
    return { ok: false, error: "Please fill in every field except the last one." };
  }
  if (!row.email.includes("@")) {
    return { ok: false, error: "That email address does not look right." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[stockists] Supabase is not configured — application dropped");
    return {
      ok: false,
      error: "We could not send that just now. Please call us on 082 824 9023.",
    };
  }

  const { error } = await getServerClient().from("stockist_applications").insert(row);
  if (error) {
    console.error("[stockists] insert failed", error.message);
    return {
      ok: false,
      error: "We could not send that just now. Please call us on 082 824 9023.",
    };
  }

  return { ok: true };
}
