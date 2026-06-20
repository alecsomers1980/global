import { createAdminClient } from "@/lib/supabase/admin";

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  kind: "instant" | "service";
  file_path: string | null;
  requires_upload: boolean;
  revisions: number;
  is_active: boolean;
  sort_order: number;
  requires_consent: boolean;
  requires_appointment: boolean;
  sla_hours: number;
}

// Physical fingerprint hubs for criminal-record checks (buyer picks one in the portal).
export const FINGERPRINT_HUBS = [
  "Johannesburg North",
  "Brackenhurst (Alberton)",
  "Mitchell's Plain (Cape Town)",
  "Cape Town CBD",
];

export async function getActiveProducts(): Promise<ShopProduct[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as ShopProduct[];
}

export async function getAllProducts(): Promise<ShopProduct[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("shop_products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as ShopProduct[];
}

export async function getProductBySlug(slug: string): Promise<ShopProduct | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("shop_products").select("*").eq("slug", slug).maybeSingle();
  return (data as ShopProduct) ?? null;
}

export async function getProductById(id: string): Promise<ShopProduct | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("shop_products").select("*").eq("id", id).maybeSingle();
  return (data as ShopProduct) ?? null;
}