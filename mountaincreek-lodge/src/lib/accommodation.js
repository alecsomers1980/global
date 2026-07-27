// Accommodation unit data helper — backed by Supabase.
// Reads go straight to the DB with the public anon key (RLS allows public
// SELECT). Writes go through /api/admin/* routes, which check the admin
// session cookie server-side and use the service_role key.
import { supabase } from "@/lib/supabaseClient";

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    sleeps: row.sleeps,
    tagline: row.tagline,
    description: row.description,
    features: row.features || [],
    size: row.size,
    span: row.span,
    images: row.images || [],
    active: row.active,
  };
}

function toRow(unit) {
  return {
    name: unit.name,
    sleeps: unit.sleeps,
    tagline: unit.tagline,
    description: unit.description,
    features: unit.features,
    size: unit.size,
    span: unit.span,
    images: unit.images,
    active: unit.active,
  };
}

export async function getUnits() {
  const { data, error } = await supabase
    .from("accommodation_units")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

// Public listing order: Main House first, then the chalets in numeric order.
// Anything else keeps its existing relative order after these.
const DISPLAY_PRIORITY = ["Main House", "Chalet 1", "Chalet 2", "Chalet 3", "Chalet 4"];

export async function getActiveUnits() {
  const units = (await getUnits()).filter((u) => u.active);
  const priority = (name) => {
    const idx = DISPLAY_PRIORITY.indexOf(name);
    return idx === -1 ? DISPLAY_PRIORITY.length : idx;
  };
  return units.sort((a, b) => priority(a.name) - priority(b.name));
}

export async function getUnitById(id) {
  const { data, error } = await supabase
    .from("accommodation_units")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function addUnit(unit) {
  const res = await fetch("/api/admin/units", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(toRow(unit)),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to create unit");
  return fromRow(await res.json());
}

export async function updateUnit(id, updates) {
  const res = await fetch(`/api/admin/units/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(toRow(updates)),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to update unit");
  return fromRow(await res.json());
}

export async function deleteUnit(id) {
  const res = await fetch(`/api/admin/units/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete unit");
}
