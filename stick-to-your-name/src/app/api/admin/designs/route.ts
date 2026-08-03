export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/admin';
import {
  listDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
} from '@/lib/db';

async function guard(): Promise<boolean> {
  return await isAdmin();
}

const KEBAB_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(req: NextRequest) {
  if (!(await guard())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const designs = await listDesigns();
    return Response.json({ designs });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await guard())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id, name, popular, image_url, active, sort_order } = body;

    if (!id || !KEBAB_REGEX.test(id)) {
      return Response.json({ error: 'Invalid id. Must be kebab-case.' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'Name is required.' }, { status: 400 });
    }

    const existing = await getDesign(id);
    if (existing) {
      return Response.json(
        { error: 'A design with that id already exists.' },
        { status: 409 }
      );
    }

    await createDesign({
      id,
      name: name.trim(),
      popular: !!popular,
      image_url: image_url || null,
      active: active !== false,
      sort_order: Number(sort_order) || 0,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await guard())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { id, ...patch } = body;
    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'id is required.' }, { status: 400 });
    }

    const coercedPatch: any = { ...patch };
    if ('popular' in patch) {
      coercedPatch.popular = !!patch.popular;
    }
    if ('active' in patch) {
      coercedPatch.active = !!patch.active;
    }
    if ('sort_order' in patch) {
      coercedPatch.sort_order = Number(patch.sort_order) || 0;
    }
    // prevent accidental id override
    delete coercedPatch.id;

    await updateDesign(id, coercedPatch);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await guard())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json(
        { error: 'id query parameter is required.' },
        { status: 400 }
      );
    }
    await deleteDesign(id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}