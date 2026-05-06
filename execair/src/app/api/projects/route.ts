import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { portfolioData } from "@/lib/data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/projects — list all projects, optionally filter by sector
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");

  try {
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (sector) query = query.eq("sector", sector);

    const { data, error } = await query;
    if (error) throw error;

    // If DB has projects, return those; otherwise fall back to static data
    if (data && data.length > 0) {
      return NextResponse.json(data);
    }

    // Fallback: flatten static portfolio data
    const fallback = portfolioData.flatMap((section) =>
      section.projects.map((p) => ({ ...p, sector: section.title }))
    );
    return NextResponse.json(fallback);
  } catch {
    // On any error, return static fallback
    const fallback = portfolioData.flatMap((section) =>
      section.projects.map((p) => ({ ...p, sector: section.title }))
    );
    return NextResponse.json(fallback);
  }
}

// POST /api/projects — create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, image, gallery, location, year, equipment, client, sector } = body;

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "name, slug, and description are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        description,
        image: image || null,
        gallery: gallery || [],
        location: location || null,
        year: year || null,
        equipment: equipment || null,
        client: client || null,
        sector: sector || "Commercial",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
