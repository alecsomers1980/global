// Package data helper — backed by Supabase.
// Reads go straight to the DB with the public anon key (RLS allows public
// SELECT). Writes go through /api/admin/* routes, which check the admin
// session cookie server-side and use the service_role key.
import { supabase } from "@/lib/supabaseClient";

function fromRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    category: row.category,
    price: row.price,
    duration: row.duration,
    maxGuests: row.max_guests,
    includes: row.includes || [],
    image: row.image,
    tag: row.tag,
    active: row.active,
  };
}

function toRow(pkg) {
  return {
    slug: pkg.slug,
    title: pkg.title,
    short_description: pkg.shortDescription,
    full_description: pkg.fullDescription,
    category: pkg.category,
    price: pkg.price,
    duration: pkg.duration,
    max_guests: pkg.maxGuests,
    includes: pkg.includes,
    image: pkg.image,
    tag: pkg.tag,
    active: pkg.active,
  };
}

export async function getPackages() {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function getActivePackages() {
  return (await getPackages()).filter((p) => p.active);
}

export async function getPackageBySlug(slug) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function addPackage(pkg) {
  const res = await fetch("/api/admin/packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(toRow(pkg)),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to create package");
  return fromRow(await res.json());
}

export async function updatePackage(id, updates) {
  const res = await fetch(`/api/admin/packages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(toRow(updates)),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to update package");
  return fromRow(await res.json());
}

export async function deletePackage(id) {
  const res = await fetch(`/api/admin/packages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete package");
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
