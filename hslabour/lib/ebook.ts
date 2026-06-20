import { createAdminClient } from "@/lib/supabase/admin";

export interface EbookProduct {
  id: number;
  title: string;
  description: string | null;
  price_cents: number;
  commission_type: "percent" | "flat";
  commission_value: number;
  file_path: string | null;
  is_active: boolean;
}

export async function getEbookProduct(): Promise<EbookProduct | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("ebook_product").select("*").eq("id", 1).single();
  return (data as EbookProduct) ?? null;
}

export function computeCommissionCents(
  type: "percent" | "flat",
  value: number,
  amountCents: number,
): number {
  if (type === "percent") return Math.round((amountCents * value) / 100);
  return Math.round(value * 100);
}

export function formatRands(cents: number): string {
  return "R " + new Intl.NumberFormat("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}