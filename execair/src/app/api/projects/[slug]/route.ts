import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { portfolioData } from "@/lib/data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/projects/[slug] — get a single project by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) return NextResponse.json(data);
    if (error && error.code !== "PGRST116") throw error;

    // Fallback to static data
    const all = portfolioData.flatMap((s) => s.projects.map((p) => ({ ...p, sector: s.title })));
    const project = all.find((p) => p.slug === slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (err: any) {
    // Fallback to static
    const all = portfolioData.flatMap((s) => s.projects.map((p) => ({ ...p, sector: s.title })));
    const project = all.find((p) => p.slug === slug);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  }
}

// PUT /api/projects/[slug] — update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const { name, description, image, gallery, location, year, equipment, client, sector } = body;

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (image !== undefined) updates.image = image;
    if (gallery !== undefined) updates.gallery = gallery;
    if (location !== undefined) updates.location = location;
    if (year !== undefined) updates.year = year;
    if (equipment !== undefined) updates.equipment = equipment;
    if (client !== undefined) updates.client = client;
    if (sector !== undefined) updates.sector = sector;

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT /api/projects error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/projects/[slug] — delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const { error } = await supabase.from("projects").delete().eq("slug", slug);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/projects error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
